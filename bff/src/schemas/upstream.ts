import { z } from 'zod';
import type { Category, FieldError, Product } from '../types';

// What the two services behind this one are allowed to answer with. Client input is checked
// in order.ts; this file checks the other direction, so a service that starts answering
// something else fails here rather than somewhere deep inside a route.
//
// The z.ZodType<...> annotations keep types.ts the source of truth: a schema that drifts away
// from the type it describes stops compiling.

export const categoriesSchema: z.ZodType<Category[]> = z.array(z.object({
  id: z.int(),
  name: z.string(),
}));

export const productsSchema: z.ZodType<Product[]> = z.array(z.object({
  id: z.int(),
  name: z.string(),
  unit: z.string(),
  categoryId: z.int(),
}));

export const createdOrderSchema: z.ZodType<{ orderId: string }> = z.object({
  orderId: z.string().min(1),
});

export const errorBodySchema: z.ZodType<{ errors: FieldError[] }> = z.object({
  errors: z.array(z.object({
    field: z.string(),
    code: z.string(),
  })),
});
