import { PublicKey, Signature } from '@bsv/sdk'
import { getPaymentAddress } from 'sendover'

/**
 * Verifies the BRC-48 locking key and the signature.
 * @param identityKey - The BRC-31 identity key of the advertiser.
 * @param lockingPublicKey - The public key used in the output's locking script.
 * @param fields - The fields of the token.
 * @param signature - The signature over the token fields.
 * @param protocolId - The protocol ID (e.g., 'SHIP' or 'SLAP').
 * @throws Will throw an error if the locking key or signature is invalid.
 */
export const verifyToken = (
  identityKey: string,
  lockingPublicKey: string,
  fields: Buffer[],
  signature: string,
  protocolId: string
): void => {
  const expectedPublicKey = getPaymentAddress({
    senderPrivateKey: '0000000000000000000000000000000000000000000000000000000000000001',
    recipientPublicKey: identityKey,
    invoiceNumber: `2-${protocolId}-1`, // BRC-43 formatted invoice number
    returnType: 'publicKey'
  })

  if (expectedPublicKey !== lockingPublicKey) {
    throw new Error('Invalid locking key!')
  }

  const pubKey = PublicKey.fromString(lockingPublicKey)
  const hasValidSignature = pubKey.verify(
    Array.from(Buffer.concat(fields)),
    Signature.fromDER(signature, 'hex')
  )

  if (!hasValidSignature) throw new Error('Invalid signature!')
}
