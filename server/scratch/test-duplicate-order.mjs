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

    const sizeVar = product.sizes[0];
    // Duplicate the product size item in the cart payload
    const priced = [
      {
        productId: product.id,
        categoryId: product.categoryId,
        name: product.name,
        size: sizeVar.size,
        price: Number(sizeVar.price),
        quantity: 1
      },
      {
        productId: product.id,
        categoryId: product.categoryId,
        name: product.name,
        size: sizeVar.size,
        price: Number(sizeVar.price),
        quantity: 1
      }
    ];

    const totals = {
      subtotal: priced[0].price * 2,
      discount: 0,
      total: priced[0].price * 2,
      coupon: null
    };

    console.log('Starting transaction with duplicate items...');
    const order = await prisma.$transaction(async (tx) => {
      for (const item of priced) {
        console.log(`Processing item ${item.name} (${item.size}) quantity ${item.quantity}`);
        const updated = await tx.productSize.updateMany({
          where: { productId: item.productId, size: item.size, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });
        console.log(`ProductSize update count: ${updated.count}`);
        if (!updated.count) throw Object.assign(new Error(`${item.name} (${item.size}) is no longer in stock`), { statusCode: 409 });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
        console.log('Product updated');
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
      console.log('Creating order...');
      return tx.order.create({
        data: {
          userId: user.id,
          razorpayOrderId: fakeOrderId,
          razorpayPaymentId: fakePaymentId,
          paymentStatus: 'pending',
          status: 'pending',
          totalAmount: totals.total,
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
