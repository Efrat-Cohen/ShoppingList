import { z } from 'zod';

// A line is three ids and a number. Everything else about a product - its name, its unit,
// which category it belongs to - is looked up from the catalog on this side, so the client
// cannot name a product something the catalog does not call it.
const itemSchema = z.object({
  productId: z.int({ error: 'invalid_item' }).positive({ error: 'invalid_item' }),
  categoryId: z.int({ error: 'invalid_item' }).positive({ error: 'invalid_item' }),
  quantity: z.int({ error: 'invalid_quantity' }).positive({ error: 'invalid_quantity' }).max(99, { error: 'invalid_quantity' }),
});

export const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(80, { error: 'too_long' }),
    address: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(200, { error: 'too_long' }),
    email: z.email({ error: 'invalid_email' }).max(120, { error: 'too_long' }),
  }),
  items: z
    .array(itemSchema, { error: 'required' })
    .min(1, { error: 'empty_cart' })
    // One line per product. Without this, the per-line quantity cap is bypassed by
    // splitting a product across several lines.
    .refine((items) => new Set(items.map((item) => item.productId)).size === items.length, {
      error: 'duplicate_product',
    }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type OrderItemInput = z.infer<typeof itemSchema>;

export function toFieldErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    code: issue.message,
  }));
}
