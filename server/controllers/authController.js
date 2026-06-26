import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';
import { adminLoginSchema, otpRequestSchema, otpVerifySchema, parse } from '../utils/validation.js';

const present = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || '',
    phone: user.phone || '',
    addressLine1: user.addressLine1 || '',
    addressLine2: user.addressLine2 || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    country: user.country || 'India'
  };
};
const otpHash = (email, otp) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${email}:${otp}`).digest('hex');
const tokenFor = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d', issuer: 'masion-jaziz' });
const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });

export const requestOtp = async (req, res) => {
  const { email } = parse(otpRequestSchema, req.body);
  const otp = crypto.randomInt(100000, 1000000).toString();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.role === 'admin' || email === (process.env.ADMIN_EMAIL || 'admin@masionjaziz.com').toLowerCase()) return res.status(403).json({ message: 'Administrators must use the admin password login.' });

  await prisma.$transaction([
    prisma.emailOtp.updateMany({ where: { email, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.emailOtp.create({ data: { email, otpHash: otpHash(email, otp), expiresAt: new Date(Date.now() + 10 * 60 * 1000), userId: user?.id } })
  ]);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Generated OTP code for ${email} is: ${otp}`);
  }

  if (!process.env.SMTP_EMAIL || !process.env.SMTP_APP_PASSWORD) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] SMTP not configured. OTP code for ${email} is: ${otp}`);
      return res.json({ message: '[DEV ONLY] OTP logged to server console.' });
    }
    return res.status(503).json({ message: 'Email delivery is not configured' });
  }

  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.gmail.com', port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_APP_PASSWORD } });
  try {
    await transporter.sendMail({ from: `Masion Jaziz <${process.env.SMTP_EMAIL}>`, to: email, subject: 'Your Masion Jaziz private access code', text: `Your Masion Jaziz verification code is ${otp}. It expires in 10 minutes.`, html: `<div style="background:#f8f5ef;padding:40px;color:#151310;font-family:Georgia,serif"><p style="letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:#a6874e">Private client access</p><h1 style="font-weight:400">Your verification code</h1><p style="font-size:34px;letter-spacing:.25em">${otp}</p><p style="font-family:Arial,sans-serif;font-size:13px;color:#666">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>` });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Failed to send email, but logged OTP for ${email}: ${otp}`);
    } else {
      await prisma.emailOtp.updateMany({ where: { email, usedAt: null }, data: { usedAt: new Date() } });
      throw error;
    }
  }
  res.json({ message: 'A verification code has been sent if this address can receive mail.' });
};

export const verifyOtp = async (req, res) => {
  const { email, otp, phone } = parse(otpVerifySchema, req.body);
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.role === 'admin' || email === (process.env.ADMIN_EMAIL || 'admin@masionjaziz.com').toLowerCase()) return res.status(403).json({ message: 'Administrators must use the admin password login.' });
  const latest = await prisma.emailOtp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } });
  const candidate = otpHash(email, otp);
  const validHash = latest && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(latest.otpHash));
  if (!latest || latest.usedAt || latest.expiresAt <= new Date() || !validHash) return res.status(401).json({ message: 'Invalid or expired verification code' });
  const phoneData = phone ? { phone: String(phone).trim() } : {};
  const user = await prisma.$transaction(async (tx) => {
    const authenticated = await tx.user.upsert({
      where: { email },
      update: existingUser?.phone ? {} : phoneData,
      create: { email, ...phoneData }
    });
    await tx.emailOtp.update({ where: { id: latest.id }, data: { usedAt: new Date(), userId: authenticated.id } });
    return authenticated;
  });
  res.cookie('jaziz_session', tokenFor(user), cookieOptions()).json({ user: present(user) });
};


export const adminLogin = async (req, res) => {
  const { email, password } = parse(adminLoginSchema, req.body);
  const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@masionjaziz.com').trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) return res.status(503).json({ message: 'Admin password login is not configured.' });
  const suppliedEmailHash = crypto.createHash('sha256').update(email).digest();
  const configuredEmailHash = crypto.createHash('sha256').update(configuredEmail).digest();
  const suppliedPasswordHash = crypto.createHash('sha256').update(password).digest();
  const configuredPasswordHash = crypto.createHash('sha256').update(configuredPassword).digest();
  const valid = crypto.timingSafeEqual(suppliedEmailHash, configuredEmailHash) && crypto.timingSafeEqual(suppliedPasswordHash, configuredPasswordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid admin ID or password.' });
  const user = await prisma.user.upsert({ where: { email: configuredEmail }, update: { role: 'admin' }, create: { email: configuredEmail, role: 'admin' } });
  res.cookie('jaziz_session', tokenFor(user), cookieOptions()).json({ user: present(user) });
};

export const me = async (req, res) => res.json({ user: present(req.user) });
export const logout = async (req, res) => res.clearCookie('jaziz_session', cookieOptions()).status(204).end();

export const updateProfile = async (req, res) => {
  const { name, phone, addressLine1, addressLine2, city, state, zipCode, country } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone, addressLine1, addressLine2, city, state, zipCode, country }
  });
  res.json({ user: present(updated) });
};

export const listCustomers = async (req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: 'user' },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      createdAt: true,
      _count: {
        select: { orders: true }
      },
      wishlist: {
        select: {
          product: {
            select: {
              name: true,
              imageUrl: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(customers);
};
