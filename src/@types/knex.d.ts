import knex from 'knex';
// import { UUID } from 'node:crypto';

declare module 'knex/types/tables' {
	export interface Tables {
		users: {
			id: string;
			name: string;
			email: string;
			session_id: string;
		};
	}

	export interface Meals {
		id: string;
		name: string;
		description: string;
		created_at: Date;
		diet: boolean;
		session_id: string;
	}
}
