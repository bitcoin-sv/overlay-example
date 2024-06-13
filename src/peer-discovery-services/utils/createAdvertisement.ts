import { getPaymentAddress } from 'sendover'
import pushdrop from 'pushdrop'
import { Ninja } from 'ninja-base'
import { TaggedBEEF } from '@bsv/overlay'
import { toBEEFfromEnvelope } from '@babbage/sdk-ts'
import { PrivateKey, PublicKey } from '@bsv/sdk'

/**
 * Utility function to create an advertisement.
 * @returns A promise that resolves to a TaggedBEEF object.
 * @throws Will throw an error if the locking key is invalid.
 */
export async function createAdvertisement(
  privateKey: string,
  protocol: 'SHIP' | 'SLAP',
  domainName: string,
  topicOrServiceName: string,
  ninja: Ninja,
  note: string
): Promise<TaggedBEEF> {
  const lockingScript = await pushdrop.create({
    fields: [
      Buffer.from(protocol), // SHIP | SLAP
      Buffer.from(PublicKey.fromPrivateKey(new PrivateKey(privateKey, 'hex')).toString(), 'hex'),
      Buffer.from(domainName),
      Buffer.from(topicOrServiceName)
    ],
    key: privateKey
  })

  const expectedPublicKey = getPaymentAddress({
    senderPrivateKey: '0000000000000000000000000000000000000000000000000000000000000001',
    recipientPublicKey: privateKey,
    invoiceNumber: `2-${protocol}-1`,
    returnType: 'publicKey'
  })

  if (lockingScript.toString('hex') !== expectedPublicKey) {
    throw new Error('Invalid locking key!')
  }

  // Put in a basket if we want to track it.
  const tx = await ninja.getTransactionWithOutputs({
    outputs: [{
      satoshis: 1,
      script: lockingScript,
      basket: `tm_${protocol}` // Put it in a basket for easy lookup
    }],
    note,
    autoProcess: true
  })

  const beef = toBEEFfromEnvelope({
    rawTx: tx.rawTx as string,
    inputs: tx.inputs
  }).beef

  return {
    beef,
    topics: [`tm_${protocol}`] // tm_ship | tm_slap
  }
}
