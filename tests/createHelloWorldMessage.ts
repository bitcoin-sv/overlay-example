import pushdrop from 'pushdrop'
import { createAction, toBEEFfromEnvelope } from '@babbage/sdk-ts'
import { LookupAnswer, LookupFormula } from '@bsv/overlay'

/**
 * Demonstrates a simple HelloWorld token creation and submission to the overlay service.
 * 
 * In this example, we are using the Babbage SDK to generate Bitcoin transactions.
 * However, you can use the SPV Wallet implementation as an alternative.
 * 
 * The PushDrop package is used to generate BRC-48 style Pay-to-Push-Drop tokens.
 * This is not a requirement and is just used to simplify the process.
 * 
 * @param message - the HelloWorld message to post.
 * @returns - The response from the overlay
 */
export const createHelloWorldMessage = async (message: string): Promise<LookupAnswer | LookupFormula> => {
  // Create the Bitcoin Output Script
  const bitcoinOutputScript = await pushdrop.create({
    fields: [
      Buffer.from(message) // HelloWorld message
    ],
    protocolID: 'HelloWorld',
    keyID: '1'
  })

  // Create a new transaction
  const tx = await createAction({
    outputs: [{
      satoshis: Number(1000),
      script: bitcoinOutputScript,
      basket: 'HelloWorld',
      description: 'New HelloWorld message'
    }],
    description: `Create a HelloWorld token`
  })

  // Convert the transaction to BEEF format
  const beef = toBEEFfromEnvelope({
    rawTx: tx.rawTx as string,
    inputs: tx.inputs,
    txid: tx.txid
  }).beef

  // Submit the transaction to the HelloWorld overlay service
  const result = await fetch('http://localhost:8080/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Topics': JSON.stringify(['HelloWorld'])
    },
    body: new Uint8Array(beef)
  })
  return await result.json()
}
