import type { Knex } from 'knex'

const knexfile: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'overlayAdmin',
      password: 'overlay123',
      database: 'overlay'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/migrations'
    }
  }
}

export default knexfile
