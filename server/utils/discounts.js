import { prisma } from '../config/db.js';

const fail=(message,statusCode=400)=>{throw Object.assign(new Error(message),{statusCode})};

export const priceCart=async(requested)=>{
  const identifiers=requested.map(item=>item.productId);
  const products=await prisma.product.findMany({where:{OR:[{id:{in:identifiers.filter(value=>/^[0-9a-f-]{36}$/i.test(value))}},{slug:{in:identifiers}}]},include:{sizes:true}});
  return requested.map(item=>{
    const product=products.find(entry=>entry.id===item.productId||entry.slug===item.productId);
    if(!product)fail('A cart item is unavailable',409);
    const sizeVar=product.sizes.find(s=>s.size.toLowerCase() === item.size.toLowerCase());
    if(!sizeVar||sizeVar.stock<item.quantity)fail(`Fragrance "${product.name}" in size ${item.size} has insufficient stock or is unavailable`,409);
    return {productId:product.id,categoryId:product.categoryId,name:product.name,size:sizeVar.size,price:Number(sizeVar.price),quantity:item.quantity};
  });
};

export const calculateCoupon=async(code,items,userId=null)=>{
  const subtotal=items.reduce((sum,item)=>sum+item.price*item.quantity,0);
  if(!code)return {subtotal,discount:0,total:subtotal,coupon:null};
  const coupon=await prisma.coupon.findUnique({where:{code:code.trim().toUpperCase()}});
  const now=new Date();
  if(!coupon||!coupon.active)fail('Coupon is invalid or inactive');
  if(coupon.startsAt&&coupon.startsAt>now)fail('Coupon is not active yet');
  if(coupon.expiresAt&&coupon.expiresAt<=now)fail('Coupon has expired');
  if(coupon.usageLimit!==null&&coupon.usedCount>=coupon.usageLimit)fail('Coupon usage limit has been reached');
  if(coupon.perCustomer&&userId){
    const alreadyUsed=await prisma.order.count({where:{userId,couponId:coupon.id}});
    if(alreadyUsed>0)fail('You have already used this coupon');
  }
  if(subtotal<Number(coupon.minimumOrder))fail(`Minimum order for this coupon is INR ${Number(coupon.minimumOrder).toLocaleString('en-IN')}`);
  const eligible=items.filter(item=>coupon.scope==='all'||(coupon.scope==='category'&&item.categoryId===coupon.categoryId)||(coupon.scope==='product'&&item.productId===coupon.productId));
  const eligibleSubtotal=eligible.reduce((sum,item)=>sum+item.price*item.quantity,0);
  if(!eligibleSubtotal)fail('This coupon does not apply to the products in your cart');
  let discount=coupon.discountType==='percent'?eligibleSubtotal*Number(coupon.value)/100:Math.min(Number(coupon.value),eligibleSubtotal);
  if(coupon.maximumDiscount!==null)discount=Math.min(discount,Number(coupon.maximumDiscount));
  discount=Math.round(discount*100)/100;
  return {subtotal,discount,total:Math.max(0,Math.round((subtotal-discount)*100)/100),coupon};
};
