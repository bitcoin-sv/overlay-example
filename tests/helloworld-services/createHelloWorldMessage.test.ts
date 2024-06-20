import { createHelloWorldMessage } from './createHelloWorldMessage'

/**
 * Requirements to run these example tests:
 * 1. Make sure your local .env file is configured correctly:
 *
 *    PORT=8080
 *    NODE_ENV='development'
 *    HOSTING_DOMAIN="http://localhost:8080"
 *    SERVER_PRIVATE_KEY='a valid private key here'
 *    MIGRATE_KEY="my-grate-key"
 *    DB_CONNECTION='mongodb connection string here'
 *    DB_NAME='staging_helloworld_lookupService'
 *
 * 2. Start your MySQL instance and run the DB migrations.
 * 3. Create your MongoDB db instance and make sure your connection string works.
 * 4. Start the local express server.
 *
 * You should now be ready to run the following integration tests.
 */

const HOSTING_URL = 'http://localhost:8080'

describe('createHelloWorldMessage', () => {
  it('should create and submit a HelloWorld message', async () => {
    const message = 'test002'
    const result = await createHelloWorldMessage(message, HOSTING_URL)
    console.log(result)
    // Ensure the server is running and can process the request correctly.
    // expect(result).toHaveProperty('status')
  })
  it('should lookup a HelloWorld message', async () => {
    const result = await fetch(`${HOSTING_URL}/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: 'ls_helloworld',
        query: 'test002'
      })
    })
    console.log(await result.json())
    // Ensure the server is running and can process the request correctly.
    // expect(result).toHaveProperty('status')
  })
})
