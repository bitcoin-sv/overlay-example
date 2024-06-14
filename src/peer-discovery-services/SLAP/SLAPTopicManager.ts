import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { Transaction } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { verifyToken } from '../utils/verifyToken.js'
import { isValidDomain } from '../utils/isValidDomain.js'
import { isValidServiceName } from '../utils/isValidServiceName.js'

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
          verifyToken(identityKey, result.lockingPublicKey, result.fields, result.signature, 'SLAP')

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
    return `
    SLAP Topic Manager:
    
    The SLAP (Service Lookup Availability Protocol) topic manager is responsible for managing SLAP tokens within the overlay network. SLAP tokens are used to advertise the availability of lookup services and their associated domains, facilitating decentralized service discovery.

    Functions:
    - Extracts and validates SLAP token fields.
    - Verifies the advertiser's identity using the BRC-31 identity key.
    - Ensures correct derivation of the locking key using BRC-42 with BRC-43 formatted invoice numbers.
    - Validates the token signature with the derived public key.
    - Admits valid SLAP tokens into the SLAP topic for network-wide visibility.

    The SLAP topic manager ensures the integrity and authenticity of lookup service advertisements, playing a crucial role in decentralized service discovery and interconnectivity.
  `
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
