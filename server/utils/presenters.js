export const productJson = (product) => ({
  ...product,
  _id: product.id,
  price: Number(product.price),
  image: product.imageUrl,
  images: (product.images || []).sort((a, b) => a.sortOrder - b.sortOrder).map(img => ({ id: img.id, url: img.url, publicId: img.publicId, alt: img.alt, sortOrder: img.sortOrder })),
  sizes: product.sizes?.map((s) => ({ ...s, price: Number(s.price) })) || []
});

export const orderJson = (order) => ({
  ...order,
  _id: order.id,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  totalAmount: Number(order.totalAmount),
  subtotalAmount: Number(order.subtotalAmount),
  discountAmount: Number(order.discountAmount),
  paymentStatus: order.paymentStatus,
  products: order.items?.map((item) => ({ ...item, _id: item.id, price: Number(item.price) })) || []
});
