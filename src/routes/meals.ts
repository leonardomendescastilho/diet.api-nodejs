import { FastifyInstance } from 'fastify';
import knex from '../database';
import { randomUUID } from 'node:crypto';
import { checkSessionId } from '../middlewares/checking-session';
import { createMealsSchema } from '../validations/meals-validation';

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

			if (!result) {
				reply.status(400).send({
					message: 'Invalid meal data.',
				});
				return;
			}

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

	app.get(
		'/',
		{
			preHandler: [checkSessionId],
		},
		async (request, reply) => {
			const { session_id } = request.cookies;

			try {
				const result = await knex('meals')
					.where('session_id', session_id)
					.select('*');

				reply.status(200).send(result);
			} catch (error) {
				console.error(error);
			}
		}
	);

	app.get(
		'/meal/:id',
		{ preHandler: [checkSessionId] },
		async (request: any, reply) => {
			const { session_id } = request.cookies;

			const { id } = request.params;

			if (!id) {
				reply.status(400).send({
					message: 'Meal not found. Need an id parameter to search.',
				});
			} else {
				try {
					const resultedMeal = await knex('meals')
						.select('*')
						.where('session_id', session_id)
						.andWhere('id', id)
						.first();

					return reply.status(200).send(resultedMeal);
				} catch (error) {
					console.error(error);
				}
			}
		}
	);
}
