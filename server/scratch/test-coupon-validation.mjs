// Test the exact validation flow the controller uses
import { z } from 'zod';

const couponSchema = z.object({ 
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/), 
  description: z.string().trim().max(500).optional().default(''), 
  discountType: z.enum(['percent','fixed']), 
  value: z.coerce.number().positive().max(100), 
  scope: z.enum(['all','category','product']), 
  categoryId: z.string().uuid().nullable().optional(), 
  productId: z.string().uuid().nullable().optional(), 
  minimumOrder: z.coerce.number().min(0).max(10000000).optional().default(0), 
  maximumDiscount: z.coerce.number().positive().max(10000000).nullable().optional(), 
  active: z.boolean().optional().default(true), 
  startsAt: z.string().datetime().nullable().optional(), 
  expiresAt: z.string().datetime().nullable().optional(), 
  usageLimit: z.coerce.number().int().positive().nullable().optional(), 
  perCustomer: z.boolean().optional().default(false) 
}).superRefine((data, ctx) => { 
  if(data.discountType==='percent' && data.value>100) ctx.addIssue({code:z.ZodIssueCode.custom,path:['value'],message:'Percentage cannot exceed 100'}); 
  if(data.scope==='category' && !data.categoryId) ctx.addIssue({code:z.ZodIssueCode.custom,path:['categoryId'],message:'Choose a category'}); 
  if(data.scope==='product' && !data.productId) ctx.addIssue({code:z.ZodIssueCode.custom,path:['productId'],message:'Choose a product'}); 
});

// Exact body the frontend would send for a basic 10% coupon
const testBody = {
  code: 'FLAT10',
  description: '',
  discountType: 'percent',
  value: 10,
  scope: 'all',
  categoryId: null,
  productId: null,
  minimumOrder: 0,
  maximumDiscount: null,
  usageLimit: null,
  perCustomer: false,
  startsAt: null,
  expiresAt: null,
  active: true
};

const result = couponSchema.safeParse(testBody);
if (result.success) {
  console.log('Validation PASSED');
  console.log('Parsed data:', JSON.stringify(result.data, null, 2));
} else {
  console.error('Validation FAILED:');
  result.error.issues.forEach(issue => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
}
