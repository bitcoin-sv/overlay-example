import { Knex } from 'knex'
import { KnexStorageMigrations } from '@bsv/overlay'

export async function up (knex: Knex): Promise<void> {
  KnexStorageMigrations.default[0].up(knex)
  knex.schema.createTable('lookup_data', t => {
    t.string('txid')
    t.integer('outputIndex')
    t.binary('script')
  })
}

export async function down (knex: Knex): Promise<void> {
  knex.schema.dropTable('lookup_data')
  KnexStorageMigrations.default[0].down(knex)
}
