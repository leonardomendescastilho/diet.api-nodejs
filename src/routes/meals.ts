import { FastifyInstance } from 'fastify';
import knex from '../database';
import { randomUUID } from 'node:crypto';
import { checkSessionId } from '../middlewares/checking-session';
import { createMealsSchema } from '../validations/meals-validation';
import { resourceUsage } from 'node:process';

export async function mealsRoute(app: FastifyInstance) {
	app.post(
		'/',
		{ preHandler: [checkSessionId] },
		async (request: any, reply) => {
			const { session_id } = request.cookies;

			try {
				await knex('users').where('session_id', session_id).first();
			} catch (error) {
				console.error(error);
				return reply.status(401).send({
					message: 'Unauthorized',
				});
			}

			const meals = {
				id: randomUUID(),
				name: request.body.name,
				description: request.body.description,
				created_at: new Date(),
				diet: request.body.diet,
				session_id: session_id,
			};

			const result = createMealsSchema.parse(meals);

			try {
				await knex('meals').insert(result);
			} catch (error) {
				console.error(error);
			}

			reply.status(201).send({
				message: 'Meal created.',
			});
		}
	);
}
