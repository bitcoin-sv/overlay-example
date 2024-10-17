import pushdrop from 'pushdrop'
import { Transaction } from '@bsv/sdk'
import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'

/**
 * Implements a topic manager for token management
 * @public
 */
export class UtxoTopicManager implements TopicManager {
  /**
   * Identifies admissible outputs from a given transaction based on previous UTXOs.
   * @param beef - The transaction data in BEEF format
   * @param previousCoins - The previous coins to consider given as input indexes of the current transaction
   * @returns {Promise<AdmittanceInstructions>} A promise that resolves with the admittance instructions
   */
  async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
    const coinsToRetain: number[] = previousCoins
    const parsedTransaction = Transaction.fromBEEF(beef)
    const outputsToAdmit: number[] = parsedTransaction.outputs.map((_, idx) => idx) 
    return {
      outputsToAdmit,
      coinsToRetain
    }
  }

  /**
   * Returns a Markdown-formatted documentation string for the topic manager.
   * @returns {Promise<string>} A promise that resolves to a documentation string.
   */
  async getDocumentation(): Promise<string> {
    return `# Utxo

    There are no rules for admittance, all outputs are admitted.`
  }

  /**
  * Returns a metadata object that can be used to identify the topic manager.
  * @returns {Promise<object>} A promise that resolves to a metadata object containing the name, short description,
  *          and optional properties such as icon URL, version, and information URL.
  */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'UtxoTopicManager',
      shortDescription: 'A topic manager for any transaction.',
      iconURL: 'https://example.com/icon.png',
      version: '1.0.0',
      informationURL: 'https://example.com/info'
    }
  }
}
