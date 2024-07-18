import { Knex } from 'knex'
import { KnexStorageMigrations } from '@bsv/overlay'

export async function up(knex: Knex): Promise<void> {
  const transactionsMigration = KnexStorageMigrations.default[2]
  await transactionsMigration.up(knex)
}

export async function down(knex: Knex): Promise<void> {
  const transactionsMigration = KnexStorageMigrations.default[2]
  await transactionsMigration.down(knex)
}
