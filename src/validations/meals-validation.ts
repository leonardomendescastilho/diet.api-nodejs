import z from 'zod';

export const createMealsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	created_at: z.date(),
	diet: z.boolean(),
	session_id: z.string(),
});

export const updateMealsSchema = z.object({
	name: z.string(),
	description: z.string(),
	diet: z.boolean(),
});
