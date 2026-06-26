import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const otpRequestSchema = z.object({ email: emailSchema });
export const otpVerifySchema = z.object({ email: emailSchema, otp: z.string().regex(/^\d{6}$/), phone: z.string().trim().optional() });
export const adminLoginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(200) });
export const imageSchema = z.object({ url: z.string().url(), publicId: z.string().min(1).max(255) }).nullable().optional();
export const productSchema = z.object({
  name: z.string().trim().min(2).max(120), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  family: z.string().trim().min(2).max(100), notes: z.array(z.string().trim().min(1)).max(20), accords: z.array(z.string().trim().min(1)).max(20),
  description: z.string().trim().min(10).max(3000), price: z.coerce.number().positive().max(10000000), size: z.string().trim().min(1).max(30),
  stock: z.coerce.number().int().min(0).max(1000000), imageUrl: z.string().url().or(z.literal('')).optional(), imagePublicId: z.string().max(255).nullable().optional(),
  imageAlt: z.string().trim().max(250).optional(), featured: z.boolean().optional(), premium: z.boolean().optional(), mostSelling: z.boolean().optional(), trending: z.boolean().optional(), loveReasons: z.array(z.string().trim().min(1)).max(10).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  sizes: z.array(z.object({
    size: z.string().trim().min(1).max(30),
    price: z.coerce.number().positive().max(10000000),
    stock: z.coerce.number().int().min(0).max(1000000)
  })).min(1).optional()
});
export const categorySchema = z.object({ name: z.string().trim().min(2).max(100), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(1000).optional().default(''), imageUrl: z.string().url().or(z.literal('')).optional().default(''), imagePublicId: z.string().max(255).nullable().optional(), active: z.boolean().optional().default(true), sortOrder: z.coerce.number().int().min(0).max(10000).optional().default(0) });
export const couponSchema = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/), description: z.string().trim().max(500).optional().default(''), discountType: z.enum(['percent','fixed']), value: z.coerce.number().positive().max(100), scope: z.enum(['all','category','product']), categoryId: z.string().uuid().nullable().optional(), productId: z.string().uuid().nullable().optional(), minimumOrder: z.coerce.number().min(0).max(10000000).optional().default(0), maximumDiscount: z.coerce.number().positive().max(10000000).nullable().optional(), active: z.boolean().optional().default(true), startsAt: z.string().datetime().nullable().optional(), expiresAt: z.string().datetime().nullable().optional(), usageLimit: z.coerce.number().int().positive().nullable().optional(), perCustomer: z.boolean().optional().default(false) }).superRefine((data,ctx)=>{ if(data.discountType==='percent'&&data.value>100)ctx.addIssue({code:z.ZodIssueCode.custom,path:['value'],message:'Percentage cannot exceed 100'}); if(data.scope==='category'&&!data.categoryId)ctx.addIssue({code:z.ZodIssueCode.custom,path:['categoryId'],message:'Choose a category'}); if(data.scope==='product'&&!data.productId)ctx.addIssue({code:z.ZodIssueCode.custom,path:['productId'],message:'Choose a product'}); });
export const heroSlideSchema = z.object({ title: z.string().trim().min(2).max(160), subtitle: z.string().trim().max(500).optional().default(''), imageUrl: z.string().url(), imagePublicId: z.string().max(255).nullable().optional(), ctaLabel: z.string().trim().min(1).max(60).optional().default('Shop now'), ctaUrl: z.string().trim().min(1).max(300).optional().default('/collection'), productId: z.string().uuid().nullable().optional(), active: z.boolean().optional().default(true), sortOrder: z.coerce.number().int().min(0).max(10000).optional().default(0) });
export const shippingSchema = z.object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(20), addressLine1: z.string().trim().min(5).max(200), addressLine2: z.string().trim().max(200).optional().default(''), city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100), postalCode: z.string().trim().min(3).max(20), country: z.string().trim().min(1).max(100).default('IN') });
export const checkoutSchema = z.object({ items: z.array(z.object({ productId: z.string().refine((value) => z.string().uuid().safeParse(value).success || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), 'Invalid product identifier'), size: z.string().trim().min(1).max(30), quantity: z.coerce.number().int().min(1).max(10) })).min(1).max(50), shippingDetails: shippingSchema, couponCode: z.string().trim().toUpperCase().max(30).optional().default('') });

export const parse = (schema, input) => {
  const result = schema.safeParse(input);
  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '));
    error.statusCode = 400;
    throw error;
  }
  return result.data;
};
