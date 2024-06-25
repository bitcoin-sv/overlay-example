import { toBEEFfromEnvelope } from '@babbage/sdk-ts'
import pushdrop from 'pushdrop'
import dotenv from 'dotenv'
import { Hash, PrivateKey, PublicKey } from '@bsv/sdk'
import { Ninja } from 'ninja-base'

/**
 * Requirements to run these example tests:
 * 1. Make sure your local .env file is configured correctly:
 *
 *    PORT=8080
 *    NODE_ENV='development'
 *    HOSTING_DOMAIN="http://localhost:8080"
 *    SERVER_PRIVATE_KEY='a valid funded private key here'
 *    MIGRATE_KEY="my-grate-key"
 *    DB_CONNECTION='mongodb connection string here'
 *    DB_NAME='staging_uhrp_lookupService'
 *
 * 2. Start your MySQL instance and run the DB migrations.
 * 3. Create your MongoDB db instance and make sure your connection string works.
 * 4. Start the local express server.
 *
 * You should now be ready to run the following integration tests.
 */

dotenv.config()

const { SERVER_PRIVATE_KEY, HOSTING_DOMAIN, DOJO_URL } = process.env

describe('createUHRPToken', () => {

  it('requires that a Ninja private key be funded for this example integration test', () => {
    // Once complete, uncomment and run the tests below.
    expect(true)
  })

  // it('should create and submit a UHRP token', async () => {

  //   const ninja = new Ninja({
  //     privateKey: SERVER_PRIVATE_KEY,
  //     config: {
  //       dojoURL: DOJO_URL as string
  //     }
  //   })
  //   const address = PublicKey.fromPrivateKey(new PrivateKey(SERVER_PRIVATE_KEY, 'hex')).toAddress().toString()

  //   // Mock data for file 
  //   const hash = new Hash.SHA256().update('some file data you host and want to create an advertisement for').digest()
  //   const url = 'https://yourMockServerURL.com'
  //   const expiryTime = 90000000000
  //   const contentLength = 100

  //   // Create the Bitcoin Output Script
  //   const outputScript = await pushdrop.create({
  //     fields: [
  //       Buffer.from('1UHRPYnMHPuQ5Tgb3AF8JXqwKkmZVy5hG', 'utf8'),
  //       Buffer.from(address, 'utf8'),
  //       Buffer.from(hash),
  //       Buffer.from('advertise', 'utf8'),
  //       Buffer.from(url, 'utf8'),
  //       Buffer.from('' + expiryTime, 'utf8'),
  //       Buffer.from('' + contentLength, 'utf8')
  //     ],
  //     key: SERVER_PRIVATE_KEY,
  //     protocolID: '', // Should be optional since not used in this case!
  //     keyID: '' // Should be optional!
  //   })

  //   const tx = await ninja.getTransactionWithOutputs({
  //     outputs: [{
  //       satoshis: 1,
  //       script: outputScript
  //     }],
  //     note: 'UHRP Availability Advertisement',
  //     autoProcess: true
  //   })

  //   // Convert the transaction to BEEF format
  //   const beef = toBEEFfromEnvelope({
  //     rawTx: tx.rawTx as string,
  //     inputs: tx.inputs,
  //     txid: tx.txid
  //   }).beef

  //   // Submit the transaction to the HelloWorld overlay service
  //   const result = await fetch(`${HOSTING_DOMAIN}/submit`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/octet-stream',
  //       'X-Topics': JSON.stringify(['tm_uhrp'])
  //     },
  //     body: new Uint8Array(beef)
  //   })
  //   console.log(await result.json())
  // }, 300000)

  // it('should lookup a UHRP advertisement', async () => {
  //   const result = await fetch(`${HOSTING_DOMAIN}/lookup`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       service: 'ls_uhrp',
  //       query: {
  //         UHRPUrl: 'XUTTtwob9QD6aJ6UCrKcaL79WsuPDLPpwjenc3VTWEyjUbTHchzu' // Example file UHRP URL we want to look up
  //       }
  //     })
  //   })
  //   console.log(await result.json())
  //   // Ensure the server is running and can process the request correctly.
  //   // expect(result).toHaveProperty('status')
  // }, 300000)
})
