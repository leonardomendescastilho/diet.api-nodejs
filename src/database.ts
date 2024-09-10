import { knex as knexSetup, Knex } from 'knex';
import { env } from './env';

export const config: Knex.Config = {
	client: env?.DATABASE_CLIENT,
	connection:
		env?.DATABASE_CLIENT === 'pg'
			? env?.DATABASE_URL
			: {
					filename: env?.DATABASE_URL,
			  },
	useNullAsDefault: true,
	migrations: {
		extension: 'ts',
		directory: './database/migrations',
	},
};

const knex = knexSetup(config);

export default knex;
