import supertest from 'supertest';
import app from '../src/app';
import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';

describe('Users routes', () => {
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

	it.skip('should be able to create a new user', async () => {
		await supertest(app.server)
			.post('/users')
			.send({
				name: 'leonardo',
				email: 'l@l.com',
			})
			.expect(201);
	});

	it('should be able to create a new meal', async () => {
		await supertest(app.server)
			.post('/meals')
			.send({
				name: 'café com pão com ovo',
				description: 'café comum brasileiro',
				diet: true,
			}).expect(201);
	});
});
