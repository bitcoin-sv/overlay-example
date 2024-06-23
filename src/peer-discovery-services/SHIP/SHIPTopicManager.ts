import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { Transaction } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { verifyToken } from '../utils/verifyToken.js'
import { isValidDomain } from '../utils/isValidDomain.js'

/**
 * SHIP Topic Manager
 * Implements the TopicManager interface for SHIP (Service Host Interconnect Protocol) tokens.
 *
 * The SHIP Topic Manager identifies admissible outputs based on SHIP protocol requirements.
 * SHIP tokens facilitate the advertisement of nodes hosting specific topics within the overlay network.
 */
export class SHIPTopicManager implements TopicManager {
  /**
   * Identifies admissible outputs for SHIP tokens.
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

          if (result.fields.length !== 4) continue // SHIP tokens should have 4 fields

          const shipIdentifier = result.fields[0].toString()
          const identityKey = result.fields[1].toString('hex')
          const domain = result.fields[2].toString()
          // const topic = result.fields[3].toString()

          if (shipIdentifier !== 'SHIP') continue

          // Validate domain and service
          if (!isValidDomain(domain)) continue
          // if (!isValidTopicName(topic)) continue

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
   * Returns documentation specific to the SHIP topic manager.
   * @returns A promise that resolves to the documentation string.
   */
  async getDocumentation(): Promise<string> {
    return `
    SHIP Topic Manager:
    
    The SHIP (Service Host Interconnect Protocol) topic manager is responsible for managing SHIP tokens within the overlay network. SHIP tokens are used to advertise the availability of service hosts and their associated topics, facilitating decentralized service discovery.

    Functions:
    - Extracts and validates SHIP token fields.
    - Verifies the advertiser's identity using the BRC-31 identity key.
    - Ensures correct derivation of the locking key using BRC-42 with BRC-43 formatted invoice numbers.
    - Validates the token signature with the derived public key.
    - Admits valid SHIP tokens into the SHIP topic for network-wide visibility.

    The SHIP topic manager ensures the integrity and authenticity of service advertisements, playing a crucial role in decentralized service discovery and interconnectivity.
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
      name: 'SHIP Topic Manager',
      shortDescription: 'Manages SHIP tokens for service host interconnect.'
    }
  }
}
