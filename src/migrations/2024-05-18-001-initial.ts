import { Knex } from 'knex'
import { KnexStorageMigrations } from '@bsv/overlay'

export async function up(knex: Knex): Promise<void> {
  const migrations = KnexStorageMigrations.default
  for (const migration of migrations) {
    await migration.up(knex)
  }
}

export async function down(knex: Knex): Promise<void> {
  const migrations = KnexStorageMigrations.default
  // Run these in reverse order for down migrations
  for (let i = migrations.length - 1; i >= 0; i--) {
    await migrations[i].down(knex)
  }
}
