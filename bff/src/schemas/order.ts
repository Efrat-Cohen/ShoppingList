import { z } from 'zod';

// The browser is only trusted for the customer details and for which product, how many.
// Everything else about a product is looked up from the catalog service.
export const orderDraftSchema = z.object({
  customer: z.object({
    fullName: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(80, { error: 'too_long' }),
    address: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(200, { error: 'too_long' }),
    email: z.email({ error: 'invalid_email' }).max(120, { error: 'too_long' }),
  }),
  items: z
    .array(
      z.object({
        productId: z.int().positive(),
        quantity: z.int().positive().max(99),
      }),
      { error: 'required' },
    )
    .min(1, { error: 'empty_cart' }),
});

export type OrderDraft = z.infer<typeof orderDraftSchema>;

export function toFieldErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    code: issue.message,
  }));
}
