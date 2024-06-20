import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { PublicKey, Signature, Transaction } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { getDocumentation } from '../utils/getDocumentation.js'

// UHRP Fields Template for Reference from BRC-26
// fields: [
//   Buffer.from('1UHRPYnMHPuQ5Tgb3AF8JXqwKkmZVy5hG', 'utf8'),
//   Buffer.from(address, 'utf8'),
//   hash,
//   Buffer.from('advertise', 'utf8'),
//   Buffer.from(url, 'utf8'),
//   Buffer.from('' + expiryTime, 'utf8'),
//   Buffer.from('' + contentLength, 'utf8')
// ]

// Uniquely identifies the Universal Hash Resolution Protocol
const UHRP_PROTOCOL_ADDRESS = '1UHRPYnMHPuQ5Tgb3AF8JXqwKkmZVy5hG'

/**
 * Note: The PushDrop package is used to decode BRC-48 style Pay-to-Push-Drop tokens.
 */
export class UHRPTopicManager implements TopicManager {
  /**
   * Identify if the outputs are admissible depending on the particular protocol requirements
   * @param beef - The transaction data in BEEF format
   * @param previousCoins - The previous coins to consider
   * @returns A promise that resolves with the admittance instructions
   */
  async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
    const outputsToAdmit: number[] = []
    try {
      const parsedTransaction = Transaction.fromBEEF(beef)

      // Try to decode and validate transaction outputs
      for (const [i, output] of parsedTransaction.outputs.entries()) {
        try {
          const result = pushdrop.decode({
            script: output.lockingScript.toHex(),
            fieldFormat: 'buffer'
          })

          if (result.fields.length !== 6) {
            throw new Error('This transaction output does not conform to the UHRP!')
          }

          // Verify compliance with the Universal Hash Resolution Protocol (UHRP)
          if (result.fields[0].toString() !== UHRP_PROTOCOL_ADDRESS) {
            throw new Error('This transaction is not a valid UHRP advertisement!')
          }

          // Hash field must be a valid SHA256 hex (all content hashes are SHA256 hashes)
          const hashBuf = Buffer.from(result.fields[2], 'hex')
          if (hashBuf.byteLength !== 32) {
            throw new Error(`Invalid hash length, must be 32 bytes but this value is ${hashBuf.byteLength}`)
          }

          if (result.fields[3].toString('utf8') !== 'advertise' || result.fields[3].toString('utf8') !== 'revoke') {
            throw new Error('Identifies this token as a UHRP advertisement or revocation.')
          }

          // The URL must start with "https://"
          const url = result.fields[4].toString('utf8')
          if (url.startsWith('https://') === false) {
            throw new Error('URL does not start with "https://"')
          }

          // The URL must contain a "."
          if (url.indexOf('.') === -1) {
            throw new Error('URL does not contain a dot')
          }

          // The URL must not contain a " "
          if (url.indexOf(' ') !== -1) {
            throw new Error('URL contains a space')
          }

          // The timestamp must be an integer
          const expiryTimestamp = Number(result.fields[5].toString('utf8'))
          if (!Number.isInteger(expiryTimestamp)) {
            throw new Error('Timestamp must be an integer')
          }

          // Timestamp must be greater than 1600000000
          if (expiryTimestamp < 1600000000) {
            throw new Error('Timestamp is too small')
          }

          // Timestamp must be less than 100000000000
          if (expiryTimestamp > 100000000000) {
            throw new Error('Timestamp is too large')
          }

          // Content length  must be an integer
          const contentLength = Number(result.fields[6])
          if (!Number.isInteger(contentLength)) {
            throw new Error('Content length must be an integer')
          }

          // Content length must be greater than 0
          if (contentLength <= 0) {
            throw new Error(`Content length must be a positive value: ${contentLength}`)
          }

          // Current architecture should support up to about 11 gigabyte files
          // If this changes, the limit should be re-evaluated.
          // Content length  must be less than 100000000000
          if (contentLength > 11000000000) {
            throw new Error(`Currently, the maximum supported file size is 11000000000 bytes:${contentLength}.`)
          }

          // Verify the signature
          const pubKey = PublicKey.fromString(result.lockingPublicKey)
          const hasValidSignature = pubKey.verify(
            Array.from(Buffer.concat(result.fields)),
            Signature.fromDER(result.signature, 'hex')
          )

          if (!hasValidSignature) throw new Error('Invalid signature!')
          outputsToAdmit.push(i)
        } catch (error) {
          console.error('Error processing output:', error)
          // Continue processing other outputs
        }
      }
      if (outputsToAdmit.length === 0) {
        console.warn('No outputs admitted!')
      }
    } catch (error) {
      console.error('Error identifying admissible outputs:', error)
    }

    return {
      outputsToAdmit,
      coinsToRetain: []
    }
  }

  /**
   * Get the documentation associated with this topic manager
   * TODO: Extract docs to external import
   * @returns A promise that resolves to a string containing the documentation
   */
  async getDocumentation(): Promise<string> {
    return await getDocumentation('../../docs/UHRP/uhrp-lookup-service.md')
  }

  /**
   * Get metadata about the topic manager
   * @returns A promise that resolves to an object containing metadata
   * @throws An error indicating the method is not implemented
   */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    throw new Error('Method not implemented.')
  }
}
