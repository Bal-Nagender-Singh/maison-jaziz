import { prisma } from '../config/db.js';
import crypto from 'node:crypto';

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    const product = await prisma.product.findFirst({
      include: {
        sizes: true
      }
    });
    if (!product || !product.sizes.length) {
      console.log('No product or size found');
      return;
    }
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
      discount: 0,
      total: priced[0].price,
      coupon: null
    };

    console.log('Starting transaction...');
    const order = await prisma.$transaction(async (tx) => {
      console.log('Transaction started');
      for (const item of priced) {
        console.log('Updating product size stock...');
        const updated = await tx.productSize.updateMany({
          where: { productId: item.productId, size: item.size, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });
        console.log('Product size stock updated:', updated);
        if (!updated.count) throw Object.assign(new Error(`${item.name} (${item.size}) is no longer in stock`), { statusCode: 409 });

        console.log('Updating product stock...');
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
        console.log('Product stock updated');
      }

      console.log('Updating user address...');
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: 'Test User',
          phone: '9876543210',
          addressLine1: 'Test Address',
          addressLine2: null,
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        }
      });
      console.log('User address updated');

      const fakeOrderId = `cod_order_${crypto.randomUUID()}`;
      const fakePaymentId = `cod_pay_${crypto.randomUUID()}`;
      console.log('Creating order...');
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
