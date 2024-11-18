import dotenv from 'dotenv'
import type { Knex } from 'knex'
dotenv.config()

const config: Knex.Config = {
  client: 'mysql2',
  connection: process.env.KNEX_DB_CONNECTION || undefined,  // No need to parse the connection string
  useNullAsDefault: true,
  migrations: {
    directory: './dist/src/migrations'
  },
  pool: {
    min: 0,
    max: 7,
    idleTimeoutMillis: 15000
  }
}

const knexfile: { [key: string]: Knex.Config } = {
  development: config,
  staging: config,
  production: config
}

export default knexfile
