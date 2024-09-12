import z from 'zod';

export const createMealsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	created_at: z.date(),
	diet: z.boolean(),
	session_id: z.string(),
});
