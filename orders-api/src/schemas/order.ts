import { z } from 'zod';

// Validation messages are stable codes rather than prose: the UI is Hebrew and all of its
// text lives in the client's strings file, so the server has no business shipping copy.
const itemSchema = z.object({
  productId: z.int().positive(),
  productName: z.string().min(1),
  categoryId: z.int().positive(),
  categoryName: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.int().positive().max(99),
});

export const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(80, { error: 'too_long' }),
    address: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(200, { error: 'too_long' }),
    email: z.email({ error: 'invalid_email' }).max(120, { error: 'too_long' }),
  }),
  items: z.array(itemSchema, { error: 'required' }).min(1, { error: 'empty_cart' }),
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
