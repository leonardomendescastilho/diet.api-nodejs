import supertest from 'supertest';
import app from '../src/app';
import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';

describe('Meals routes', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		console.log('Rolling back migrations...');
		execSync('npm run knex migrate:rollback --all');
		console.log('Running migrations...');
		execSync('npm run knex migrate:latest');
		console.log('Migrations completed.');
	});

	it.skip('should be able to create a new meal', async () => {
		await supertest(app.server)
			.post('/meals')
			.set('Cookie', 'session_id=123')
			.send({
				name: 'café com pão com ovo',
				description: 'café comum brasileiro',
				diet: true,
			})
			.expect(201);
	});

	it('should be to delete a meal', async () => {
		await supertest(app.server)
			.post('/meals')
			.set('Cookie', 'session_id=123')
			.send({
				name: 'café com pão com ovo',
				description: 'café comum brasileiro',
				diet: true,
			})
			.expect(201);

		const result = await supertest(app.server)
			.get('/meals')
			.set('Cookie', 'session_id=123');

		const { id } = result.body[0];

		console.log(id);
		await supertest(app.server)
			.delete(`/meals/meal/${id}`)
			.set('Cookie', 'session_id=123')
			.expect(204);
	});
});
