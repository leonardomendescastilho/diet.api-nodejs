import { z } from 'zod';

export const createUserSchema = z.object({
	name: z.string(),
	email: z.string().email(),
});
