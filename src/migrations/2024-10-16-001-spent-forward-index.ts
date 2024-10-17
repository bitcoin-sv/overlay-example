import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Change spent column type to string
  await knex.schema.alterTable('outputs', function (table) {
    table.string('spent').alter()
  })

  // Add index for outputs table
  await knex.schema.table('outputs', function (table) {
    table.index(['spent'], 'idx_outputs_spent')
  })
}

export async function down(knex: Knex): Promise<void> {
  // Revert spent column type to boolean
  await knex.schema.alterTable('outputs', function (table) {
    table.boolean('spent').alter()
  })

  // Drop index for outputs table
  await knex.schema.table('outputs', function (table) {
    table.dropIndex(['spent'], 'idx_outputs_spent')
  })
}
