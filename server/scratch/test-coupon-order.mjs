import { prisma } from '../config/db.js';
import crypto from 'node:crypto';

async function main() {
  try {
    const user = await prisma.user.findFirst();
    const product = await prisma.product.findFirst({
      include: {
        sizes: true
      }
    });
    const coupon = await prisma.coupon.findFirst({
      where: { code: 'TESTAPI10' }
    });

    const sizeVar = product.sizes[0];
    const priced = [{
      productId: product.id,
      categoryId: product.categoryId,
      name: product.name,
      size: sizeVar.size,
      price: Number(sizeVar.price),
      quantity: 1
    }];

    const totals = {
      subtotal: priced[0].price,
      discount: priced[0].price * 0.1,
      total: priced[0].price * 0.9,
      coupon: coupon
    };

    console.log('Starting transaction with coupon...');
    const order = await prisma.$transaction(async (tx) => {
      for (const item of priced) {
        const updated = await tx.productSize.updateMany({
          where: { productId: item.productId, size: item.size, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });
        if (!updated.count) throw Object.assign(new Error(`${item.name} (${item.size}) is no longer in stock`), { statusCode: 409 });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      if (totals.coupon) {
        console.log('Updating coupon count...');
        const usageWhere = totals.coupon.usageLimit === null ? { id: totals.coupon.id, active: true } : { id: totals.coupon.id, active: true, usedCount: { lt: totals.coupon.usageLimit } };
        const used = await tx.coupon.updateMany({
          where: usageWhere,
          data: { usedCount: { increment: 1 } }
        });
        console.log('Coupon update result:', used);
        if (!used.count) throw Object.assign(new Error('Coupon usage limit was reached'), { statusCode: 409 });
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          name: 'Test User',
          phone: '9876543210',
          addressLine1: 'Test Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        }
      });

      const fakeOrderId = `cod_order_${crypto.randomUUID()}`;
      const fakePaymentId = `cod_pay_${crypto.randomUUID()}`;
      console.log('Creating order in DB...');
      return tx.order.create({
        data: {
          userId: user.id,
          razorpayOrderId: fakeOrderId,
          razorpayPaymentId: fakePaymentId,
          paymentStatus: 'pending',
          subtotalAmount: totals.subtotal,
          discountAmount: totals.discount,
          totalAmount: totals.total,
          couponCode: totals.coupon?.code || null,
          couponId: totals.coupon?.id || null,
          shippingDetails: {
            name: 'Test User',
            phone: '9876543210',
            addressLine1: 'Test Address',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India'
          },
          items: {
            create: priced.map(({ productId, name, size, price, quantity }) => ({
              productId,
              name,
              size,
              price,
              quantity
            }))
          }
        },
        include: { items: true }
      });
    });
    console.log('Order created successfully:', order);
  } catch (error) {
    console.error('Error during transaction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
