import { z } from 'zod';

// Validation messages are stable codes rather than prose: the UI is Hebrew and all of its
// text lives in the client's strings file, so the server has no business shipping copy.
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
    // One line per product, otherwise the per-line quantity cap is bypassed by splitting it.
    .refine((items) => new Set(items.map((item) => item.productId)).size === items.length, {
      error: 'duplicate_product',
    }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type OrderItem = z.infer<typeof itemSchema>;

export type FieldError = { field: string; code: string };

export function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    code: issue.message,
  }));
}
