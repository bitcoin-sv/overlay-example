import type { Knex } from 'knex'

const knexfile: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'overlay'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  }
}

export default knexfile