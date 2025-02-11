import { FastifyInstance } from 'fastify';
import knex from '../database';
import { randomUUID } from 'node:crypto';
import { checkSessionId } from '../middlewares/checking-session';
import {
	createMealsSchema,
	updateMealsSchema,
} from '../validations/meals-validation';

export async function mealsRoute(app: FastifyInstance) {
	app.post(
		'/',
		{ preHandler: [checkSessionId] },
		async (request: any, reply) => {
			const { session_id } = request.cookies;

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
				return;
			}

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
	);

	app.put(
		'/meal/:id',
		{ preHandler: [checkSessionId] },
		async (request: any, reply) => {
			const { session_id } = request.cookies;
			const { id } = request.params;

			const { name, description, diet } = updateMealsSchema.parse(request.body);

			try {
				const currentMeal = await knex('meals')
					.select('*')
					.where('session_id', session_id)
					.andWhere('id', id);

				console.log(currentMeal[0]);

				if (currentMeal.length === 0) {
					reply.status(404).send({
						message: 'Meal not found.',
					});
					return;
				}

				const newMeal = {
					...currentMeal[0],
					name: name ?? currentMeal[0].name,
					description: description ?? currentMeal[0].description,
					diet: diet ?? currentMeal[0].diet,
				};

				await knex('meals')
					.update(newMeal)
					.where('session_id', session_id)
					.andWhere('id', id);

				reply.status(200).send({
					message: 'Meal updated.',
				});
			} catch (error) {
				console.error(error);
			}
		}
	);

	app.delete(
		'/meal/:id',
		{
			preHandler: [checkSessionId],
		},
		async (request: any, reply) => {
			const { session_id } = request.cookies;
			const { id } = request.params;

			if (!id) {
				reply.status(400).send({
					message: 'Meal not found. Need an id parameter to search.',
				});
				return;
			}

			try {
				await knex('meals')
					.where('session_id', session_id)
					.andWhere('id', id)
					.del();
				reply.status(204).send({
					message: 'Meal deleted.',
				});
			} catch (error) {
				console.error(error);
			}
		}
	);

	app.get(
		'/diet',
		{
			preHandler: [checkSessionId],
		},
		async (request, reply) => {
			const { session_id } = request.cookies;

			try {
				const mealsOnDiet = await knex('meals')
					.where('session_id', session_id)
					.andWhere('diet', true)
					.count('* as on_diet');

				const mealsOffDiet = await knex('meals')
					.where('session_id', session_id)
					.andWhere('diet', false)
					.count('* as off_diet');

				const allMeals = await knex('meals')
					.where('session_id', session_id)
					.count('* as total');

				const orderedMealsByData = await knex('meals')
					.where('session_id', session_id)
					.orderBy('created_at', 'desc')
					.select('diet');

				let maxStreak = 0;
				let currentStreak = 0;

				orderedMealsByData.forEach((meal) => {
					if (meal.diet) {
						currentStreak++;
					} else {
						if (currentStreak > maxStreak) {
							maxStreak = currentStreak;
						}
						currentStreak = 0;
					}
				});

				reply.status(200).send({
					registeredMeals: Number(allMeals[0].total),
					onDiet: Number(mealsOnDiet[0].on_diet),
					offDiet: Number(mealsOffDiet[0].off_diet),
					maxStreakOnDiet: maxStreak,
				});
			} catch (error) {
				console.error(error);
			}
		}
	);
}
