import { prisma } from '../config/db.js';
import { destroyImage } from '../utils/cloudinary.js';
import { calculateCoupon, priceCart } from '../utils/discounts.js';
import { categorySchema, couponSchema, heroSlideSchema, parse } from '../utils/validation.js';

const couponJson=c=>({...c,value:Number(c.value),minimumOrder:Number(c.minimumOrder),maximumDiscount:c.maximumDiscount===null?null:Number(c.maximumDiscount)});
const cleanDates=data=>({...data,startsAt:data.startsAt?new Date(data.startsAt):null,expiresAt:data.expiresAt?new Date(data.expiresAt):null,categoryId:data.scope==='category'?data.categoryId:null,productId:data.scope==='product'?data.productId:null});

export const listCategories=async(req,res)=>res.json(await prisma.category.findMany({where:req.user?.role==='admin'?{}:{active:true},include:{_count:{select:{products:true}}},orderBy:[{sortOrder:'asc'},{name:'asc'}]}));
export const createCategory=async(req,res)=>res.status(201).json(await prisma.category.create({data:parse(categorySchema,req.body)}));
export const updateCategory=async(req,res)=>{const current=await prisma.category.findUnique({where:{id:req.params.id}});if(!current)return res.status(404).json({message:'Category not found'});const updated=await prisma.category.update({where:{id:current.id},data:parse(categorySchema,req.body)});if(current.imagePublicId&&current.imagePublicId!==updated.imagePublicId)destroyImage(current.imagePublicId).catch(console.error);res.json(updated)};
export const deleteCategory=async(req,res)=>{const current=await prisma.category.findUnique({where:{id:req.params.id}});if(!current)return res.status(404).json({message:'Category not found'});await prisma.category.delete({where:{id:current.id}});if(current.imagePublicId)destroyImage(current.imagePublicId).catch(console.error);res.json({message:'Category deleted'})};

export const listSlides=async(req,res)=>res.json(await prisma.heroSlide.findMany({where:req.user?.role==='admin'?{}:{active:true},include:{product:true},orderBy:[{sortOrder:'asc'},{createdAt:'asc'}]}));
export const createSlide=async(req,res)=>res.status(201).json(await prisma.heroSlide.create({data:parse(heroSlideSchema,req.body)}));
export const updateSlide=async(req,res)=>{const current=await prisma.heroSlide.findUnique({where:{id:req.params.id}});if(!current)return res.status(404).json({message:'Slide not found'});const updated=await prisma.heroSlide.update({where:{id:current.id},data:parse(heroSlideSchema,req.body)});if(current.imagePublicId&&current.imagePublicId!==updated.imagePublicId)destroyImage(current.imagePublicId).catch(console.error);res.json(updated)};
export const deleteSlide=async(req,res)=>{if(req.params.id==='00000000-0000-0000-0000-000000000001')return res.status(400).json({message:'The default slide is compulsory and cannot be deleted.'});const current=await prisma.heroSlide.findUnique({where:{id:req.params.id}});if(!current)return res.status(404).json({message:'Slide not found'});await prisma.heroSlide.delete({where:{id:current.id}});if(current.imagePublicId)destroyImage(current.imagePublicId).catch(console.error);res.json({message:'Slide deleted'})};

const couponInsert=async(data)=>{
  const {perCustomer,...rest}=data;
  const created=await prisma.coupon.create({data:rest});
  if(perCustomer){await prisma.$executeRawUnsafe(`UPDATE "coupons" SET "per_customer"=$1 WHERE id=$2::uuid`,true,created.id);}
  return prisma.coupon.findUnique({where:{id:created.id},include:{category:true,product:true}});
};
const couponUpdateRaw=async(id,data)=>{
  const {perCustomer,...rest}=data;
  const updated=await prisma.coupon.update({where:{id},data:rest});
  await prisma.$executeRawUnsafe(`UPDATE "coupons" SET "per_customer"=$1 WHERE id=$2::uuid`,!!perCustomer,id);
  return prisma.coupon.findUnique({where:{id},include:{category:true,product:true}});
};
export const listCoupons=async(req,res)=>{
  const rows=await prisma.$queryRaw`SELECT c.*,cat.name as cat_name,cat.id as cat_id FROM "coupons" c LEFT JOIN "categories" cat ON cat.id=c.category_id ORDER BY c.created_at DESC`;
  res.json(rows.map(r=>({id:r.id,code:r.code,description:r.description,discountType:r.discount_type,value:Number(r.value),scope:r.scope,categoryId:r.category_id,minimumOrder:Number(r.minimum_order),maximumDiscount:r.maximum_discount===null?null:Number(r.maximum_discount),active:r.active,startsAt:r.starts_at,expiresAt:r.expires_at,usageLimit:r.usage_limit,usedCount:r.used_count,perCustomer:r.per_customer,category:r.cat_id?{id:r.cat_id,name:r.cat_name}:null})));
};
export const createCoupon=async(req,res)=>res.status(201).json(couponJson(await couponInsert(cleanDates(parse(couponSchema,req.body)))));
export const updateCoupon=async(req,res)=>{const data=cleanDates(parse(couponSchema,req.body));res.json(couponJson(await couponUpdateRaw(req.params.id,data)))};
export const deleteCoupon=async(req,res)=>{await prisma.coupon.delete({where:{id:req.params.id}});res.json({message:'Coupon deleted'})};
export const validateCoupon=async(req,res)=>{const items=await priceCart(req.body.items||[]);const result=await calculateCoupon(String(req.body.code||''),items,req.user?.id||null);res.json({code:result.coupon.code,subtotal:result.subtotal,discount:result.discount,total:result.total,description:result.coupon.description})};

export const listPublicCoupons=async(req,res)=>{
  const now=new Date();
  const coupons=await prisma.coupon.findMany({
    where:{
      active:true,
      AND:[
        { OR:[{startsAt:null},{startsAt:{lte:now}}] },
        { OR:[{expiresAt:null},{expiresAt:{gt:now}}] }
      ]
    },
    include:{
      category:{
        select:{id:true,name:true,slug:true}
      },
      product:{
        select:{id:true,name:true,slug:true}
      }
    },
    orderBy:{createdAt:'desc'}
  });

  const valid=coupons.filter(c=>c.usageLimit===null||c.usedCount<c.usageLimit);

  res.json(valid.map(c=>({
    id:c.id,
    code:c.code,
    description:c.description,
    discountType:c.discountType,
    value:Number(c.value),
    scope:c.scope,
    categoryId:c.categoryId,
    productId:c.productId,
    minimumOrder:Number(c.minimumOrder),
    maximumDiscount:c.maximumDiscount===null?null:Number(c.maximumDiscount),
    expiresAt:c.expiresAt,
    category:c.category,
    product:c.product
  })));
};

export const getSettings=async(req,res)=>{const list=await prisma.storeSetting.findMany();const dict={};list.forEach(s=>{dict[s.key]=s.value});res.json(dict)};
export const updateSettings=async(req,res)=>{const settings=req.body||{};const promises=Object.entries(settings).map(([key,value])=>prisma.storeSetting.upsert({where:{key},update:{value:String(value)},create:{key,value:String(value)}}));await Promise.all(promises);const list=await prisma.storeSetting.findMany();const dict={};list.forEach(s=>{dict[s.key]=s.value});res.json(dict)};

export const listFaqs=async(req,res)=>{const isAdmin=req.user?.role==='admin';res.json(await prisma.faq.findMany({where:isAdmin?{}:{active:true},orderBy:[{sortOrder:'asc'},{createdAt:'asc'}]}))};
export const createFaq=async(req,res)=>{const{question,answer,sortOrder=0,active=true}=req.body;if(!question||!answer)return res.status(400).json({message:'Question and answer are required'});res.status(201).json(await prisma.faq.create({data:{question,answer,sortOrder:Number(sortOrder),active}}))};
export const updateFaq=async(req,res)=>{const{question,answer,sortOrder,active}=req.body;const faq=await prisma.faq.findUnique({where:{id:req.params.id}});if(!faq)return res.status(404).json({message:'FAQ not found'});res.json(await prisma.faq.update({where:{id:req.params.id},data:{...(question!==undefined&&{question}),...(answer!==undefined&&{answer}),...(sortOrder!==undefined&&{sortOrder:Number(sortOrder)}),...(active!==undefined&&{active})}}))};
export const deleteFaq=async(req,res)=>{await prisma.faq.delete({where:{id:req.params.id}});res.json({message:'FAQ deleted'})};

