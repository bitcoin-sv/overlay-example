import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { Transaction } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { verifyToken } from '../utils/verifyToken.js'
import { isValidDomain } from '../utils/isValidDomain.js'
import { isValidServiceName } from '../utils/isValidServiceName.js'
import { getDocumentation } from '../../utils/getDocumentation.js'

/**
 * SLAP Topic Manager
 * Implements the TopicManager interface for SLAP (Service Lookup Availability Protocol) tokens.
 *
 * The SLAP Topic Manager identifies admissible outputs based on SLAP protocol requirements.
 * SLAP tokens facilitate the advertisement of lookup services availability within the overlay network.
 */
export class SLAPTopicManager implements TopicManager {
  /**
   * Identifies admissible outputs for SLAP tokens.
   * @param beef - The transaction data in BEEF format.
   * @param previousCoins - The previous coins to consider.
   * @returns A promise that resolves with the admittance instructions.
   */
  async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
    const outputsToAdmit: number[] = []
    try {
      const parsedTransaction = Transaction.fromBEEF(beef)

      for (const [i, output] of parsedTransaction.outputs.entries()) {
        try {
          const result = pushdrop.decode({
            script: output.lockingScript.toHex(),
            fieldFormat: 'buffer'
          })

          if (result.fields.length !== 4) continue // SLAP tokens should have 4 fields

          const slapIdentifier = result.fields[0].toString()
          const identityKey = result.fields[1].toString('hex')
          // const domain = result.fields[2].toString()
          const service = result.fields[3].toString()
          if (slapIdentifier !== 'SLAP') continue

          // Validate domain and service
          // if (isValidDomain(domain) !== true) continue
          if (!isValidServiceName(service)) continue

          // Verify the token locking key and signature
          verifyToken(identityKey, result.lockingPublicKey, result.fields, result.signature)

          outputsToAdmit.push(i)
        } catch (error) {
          console.error('Error processing output:', error)
        }
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
   * Returns documentation specific to the SLAP topic manager.
   * @returns A promise that resolves to the documentation string.
   */
  async getDocumentation(): Promise<string> {
    return await getDocumentation('../../docs/SLAP/slap-lookup-service.md')
  }

  /**
   * Returns metadata associated with this topic manager.
   * @returns A promise that resolves to an object containing metadata.
   */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'SLAP Topic Manager',
      shortDescription: 'Manages SLAP tokens for service lookup availability.',
    }
  }
}
