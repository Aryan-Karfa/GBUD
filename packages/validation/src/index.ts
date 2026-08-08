import { z } from 'zod';

export { z };

export const testBodySchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
});

export type TestBodyInput = z.infer<typeof testBodySchema>;
