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
    pool: {
      min: 2, // Minimum number of connections in the pool
      max: 120, // Maximum number of connections in the pool
      acquireTimeoutMillis: 30000, // Time to wait for a connection before throwing an error
      createTimeoutMillis: 30000, // Time to wait for a new connection to be created before throwing an error
      idleTimeoutMillis: 30000, // Time to wait before closing idle connections
      reapIntervalMillis: 1000, // How often to check for idle connections
      log: (message) => console.log('Pool log:', message) // Optional logging function
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/migrations'
    }
  }
}

export default knexfile
