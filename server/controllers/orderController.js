import { prisma } from '../config/db.js';
import { orderJson } from '../utils/presenters.js';

export const myOrders = async (req, res) => res.json((await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } })).map(orderJson));
export const allOrders = async (req, res) => res.json((await prisma.order.findMany({ include: { user: { select: { email: true, phone: true } }, items: true }, orderBy: { createdAt: 'desc' } })).map(orderJson));
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { user: { select: { email: true, phone: true } }, items: true }
  });
  res.json(orderJson(order));
};
