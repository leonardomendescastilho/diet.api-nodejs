import { FastifyInstance } from 'fastify';
import knex from '../database';
import { randomUUID } from 'node:crypto';
import { checkSessionId } from '../middlewares/checking-session';
import { createUserSchema } from '../validations/users-validations';

export async function usersRoute(app: FastifyInstance) {
	app.post('/', async (request: any, reply) => {
		const { session_id } = request.cookies;

		if (!session_id) {
			const session_id = randomUUID();

			reply.setCookie('session_id', session_id, {
				path: '/',
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});
		}

		const { name, email } = createUserSchema.parse(request.body);

		const userExists = await knex('users').where({ session_id }).first();

		if (userExists) {
			reply.status(409).send({
				message: 'User already exists.',
			});
			return;
		}

		try {
			await knex('users').insert({
				id: randomUUID(),
				name,
				email,
				session_id,
			});
		} catch (error) {
			throw new Error('User not created.', { cause: error });
		}

		reply.status(201).send({
			message: 'User created.',
		});
	});

	app.put(
		'/',
		{
			preHandler: [checkSessionId],
		},
		async (request, reply) => {
			const { session_id } = request.cookies;

			const userSessionExist = await knex('users')
				.where('session_id', session_id)
				.first();

			if (!userSessionExist) {
				return;
			}

			const { name, email } = createUserSchema.parse(request.body);

			try {
				await knex('users')
					.where('session_id', session_id)
					.update({
						name: name || userSessionExist?.name,
						email: email || userSessionExist?.email,
					});
			} catch (error) {
				throw new Error('User not updated.', { cause: error });
			}

			reply.status(200).send({
				message: 'User updated.',
			});
		}
	);
}
