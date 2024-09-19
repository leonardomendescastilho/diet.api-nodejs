import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('meals', (table) => {
		table.renameColumn('name', 'old_name');
	});

	await knex.schema.alterTable('meals', (table) => {
		table.string('name').nullable().after('id');
	});

	await knex('meals').update({ name: knex.ref('old_name') });

	await knex.schema.alterTable('meals', (table) => {
		table.dropColumn('old_name');
	});

	await knex.schema.alterTable('meals', (table) => {
		table.string('name').notNullable().alter();
	});
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.string('old_name').nullable();
  });

  await knex('meals').update({ old_name: knex.ref('name') });

  await knex.schema.alterTable('meals', (table) => {
    table.dropColumn('name');
    table.renameColumn('old_name', 'name');
  });
}
