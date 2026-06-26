import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import { prisma } from '../config/db.js';
import { orderJson } from '../utils/presenters.js';
import { checkoutSchema, parse } from '../utils/validation.js';
import { calculateCoupon, priceCart } from '../utils/discounts.js';

const razorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) { const error = new Error('Razorpay test credentials are not configured'); error.statusCode = 503; throw error; }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

export const createRazorpayOrder = async (req, res) => {
  const { items, shippingDetails, couponCode } = parse(checkoutSchema, req.body);
  const priced = await priceCart(items);
  const totals = await calculateCoupon(couponCode, priced);
  if (totals.total < 1) return res.status(400).json({ message: 'Order total after discount must be at least INR 1' });
  const amount = Math.round(totals.total * 100);
  const order = await razorpay().orders.create({ amount, currency: 'INR', receipt: `mj_${Date.now()}`, notes: { userId: req.user.id } });
  const checkoutToken = jwt.sign({ orderId: order.id, amount, items: priced, shippingDetails, couponCode: totals.coupon?.code||'' }, process.env.JWT_SECRET, { expiresIn: '20m', issuer: 'masion-jaziz-checkout', subject: req.user.id });
  res.json({ razorpayOrderId: order.id, amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID, checkoutToken, subtotal: totals.subtotal, discount: totals.discount, total: totals.total });
};

export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, checkoutToken } = req.body;
  if (![razorpay_order_id, razorpay_payment_id, razorpay_signature, checkoutToken].every((value) => typeof value === 'string' && value)) return res.status(400).json({ message: 'Incomplete payment verification payload' });
  let checkout;
  try { checkout = jwt.verify(checkoutToken, process.env.JWT_SECRET, { issuer: 'masion-jaziz-checkout', subject: req.user.id }); } catch { return res.status(400).json({ message: 'Checkout session is invalid or expired' }); }
  if (checkout.orderId !== razorpay_order_id) return res.status(400).json({ message: 'Payment order mismatch' });
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected.length !== razorpay_signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))) return res.status(400).json({ message: 'Payment signature verification failed' });
  const existing = await prisma.order.findUnique({ where: { razorpayOrderId: razorpay_order_id }, include: { items: true } });
  if (existing) return res.json(orderJson(existing));
  const payment = await razorpay().payments.fetch(razorpay_payment_id);
  if (payment.order_id !== razorpay_order_id || payment.amount !== checkout.amount || !['authorized', 'captured'].includes(payment.status)) return res.status(400).json({ message: 'Razorpay payment details could not be confirmed' });
  const currentItems = await priceCart(checkout.items.map(({ productId, size, quantity }) => ({ productId, size, quantity })));
  const totals = await calculateCoupon(checkout.couponCode||'', currentItems);
  if (Math.round(totals.total * 100) !== checkout.amount) return res.status(409).json({ message: 'Product pricing or coupon eligibility changed before payment confirmation. Contact support with your payment ID.' });
  const order = await prisma.$transaction(async (tx) => {
    for (const item of currentItems) {
      const updated = await tx.productSize.updateMany({ where: { productId: item.productId, size: item.size, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (!updated.count) throw Object.assign(new Error(`${item.name} (${item.size}) is no longer in stock`), { statusCode: 409 });
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    }
    if(totals.coupon){
      const usageWhere=totals.coupon.usageLimit===null?{id:totals.coupon.id,active:true}:{id:totals.coupon.id,active:true,usedCount:{lt:totals.coupon.usageLimit}};
      const used=await tx.coupon.updateMany({where:usageWhere,data:{usedCount:{increment:1}}});
      if(!used.count)throw Object.assign(new Error('Coupon usage limit was reached before payment confirmation'),{statusCode:409});
    }
    
    // Save shipping details to user's profile
    await tx.user.update({
      where: { id: req.user.id },
      data: {
        name: checkout.shippingDetails.name,
        phone: checkout.shippingDetails.phone,
        addressLine1: checkout.shippingDetails.addressLine1,
        addressLine2: checkout.shippingDetails.addressLine2 || null,
        city: checkout.shippingDetails.city,
        state: checkout.shippingDetails.state,
        zipCode: checkout.shippingDetails.postalCode,
        country: checkout.shippingDetails.country || 'India'
      }
    });

    return tx.order.create({ data: { userId: req.user.id, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, paymentStatus: 'paid', subtotalAmount: totals.subtotal, discountAmount: totals.discount, totalAmount: totals.total, couponCode: totals.coupon?.code||null, couponId: totals.coupon?.id||null, shippingDetails: checkout.shippingDetails, items: { create: currentItems.map(({productId,name,size,price,quantity})=>({productId,name,size,price,quantity})) } }, include: { items: true } });
  }, { timeout: 30000 });
  res.status(201).json(orderJson(order));
};

export const createCodOrder = async (req, res) => {
  const { items, shippingDetails, couponCode } = parse(checkoutSchema, req.body);
  const priced = await priceCart(items);
  const totals = await calculateCoupon(couponCode, priced);
  if (totals.total < 1) return res.status(400).json({ message: 'Order total after discount must be at least INR 1' });
  const order = await prisma.$transaction(async (tx) => {
    for (const item of priced) {
      const updated = await tx.productSize.updateMany({ where: { productId: item.productId, size: item.size, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (!updated.count) throw Object.assign(new Error(`${item.name} (${item.size}) is no longer in stock`), { statusCode: 409 });
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    }
    if (totals.coupon) {
      const usageWhere = totals.coupon.usageLimit === null ? { id: totals.coupon.id, active: true } : { id: totals.coupon.id, active: true, usedCount: { lt: totals.coupon.usageLimit } };
      const used = await tx.coupon.updateMany({ where: usageWhere, data: { usedCount: { increment: 1 } } });
      if (!used.count) throw Object.assign(new Error('Coupon usage limit was reached'), { statusCode: 409 });
    }
    await tx.user.update({
      where: { id: req.user.id },
      data: {
        name: shippingDetails.name,
        phone: shippingDetails.phone,
        addressLine1: shippingDetails.addressLine1,
        addressLine2: shippingDetails.addressLine2 || null,
        city: shippingDetails.city,
        state: shippingDetails.state,
        zipCode: shippingDetails.postalCode,
        country: shippingDetails.country || 'India'
      }
    });
    const fakeOrderId = `cod_order_${crypto.randomUUID()}`;
    const fakePaymentId = `cod_pay_${crypto.randomUUID()}`;
    return tx.order.create({ data: { userId: req.user.id, razorpayOrderId: fakeOrderId, razorpayPaymentId: fakePaymentId, paymentStatus: 'pending', subtotalAmount: totals.subtotal, discountAmount: totals.discount, totalAmount: totals.total, couponCode: totals.coupon?.code||null, couponId: totals.coupon?.id||null, shippingDetails: shippingDetails, items: { create: priced.map(({productId,name,size,price,quantity})=>({productId,name,size,price,quantity})) } }, include: { items: true } });
  });
  res.status(201).json(orderJson(order));
};
