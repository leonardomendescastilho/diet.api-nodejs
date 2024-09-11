import { FastifyInstance, FastifyRequest } from 'fastify';
import knex from '../database';
import { unknown, z } from 'zod';
import { randomUUID } from 'node:crypto';
// import { checkSessionId } from '../middlewares/checking-session';
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

		const userExists = await knex('users').where({ email }).first();

		if (userExists) {
			reply.status(409).send({
				message: 'User already exists.',
			});
		} else {
			await knex('users').insert({
				id: randomUUID(),
				name,
				email,
				session_id,
			});

			reply.status(201).send({
				message: 'User created.',
			});
		}
	});
}
