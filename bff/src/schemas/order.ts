import { z } from 'zod';

// The cart is built from the catalog the client already loaded, so an item arrives complete.
// This is the boundary check, not a lookup: the orders service validates again on its side.
const itemSchema = z.object({
  productId: z.int({ error: 'invalid_item' }).positive({ error: 'invalid_item' }),
  productName: z.string({ error: 'invalid_item' }).min(1, { error: 'invalid_item' }),
  categoryId: z.int({ error: 'invalid_item' }).positive({ error: 'invalid_item' }),
  categoryName: z.string({ error: 'invalid_item' }).min(1, { error: 'invalid_item' }),
  unit: z.string({ error: 'invalid_item' }).min(1, { error: 'invalid_item' }),
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

export type OrderItem = z.infer<typeof itemSchema>;

export function toFieldErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    code: issue.message,
  }));
}
