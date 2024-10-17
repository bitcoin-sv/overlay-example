import pushdrop from 'pushdrop'
import { Script } from '@bsv/sdk'
import { LookupAnswer, LookupFormula, LookupQuestion, LookupService } from '@bsv/overlay'
import { UtxoStorage } from './UtxoStorage.js'
import { UtxoQuery } from 'src/types.js'

/**
 * Implements a lookup service for tokens
 * @public
 */
export class UtxoLookupService implements LookupService {
  constructor(
    public storageEngine: UtxoStorage
  ) { }

  /**
   * Notifies the lookup service of a new output added.
   * @param {string} txid - The transaction ID of the transaction this UTXO is a part of
   * @param {number} outputIndex - The index of the output
   * @param {Script} outputScript - The output script data for the given UTXO
   * @param {string} topic - The topic this UTXO is part of
   * @returns {Promise<void>} A promise that resolves when the processing is complete.
   * @throws Will throw an error if there is an issue with storing the record in the storage engine.
   */
  async outputAdded(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> {
    await this.storageEngine.storeRecord(
      txid,
      outputIndex
    )
  }

  /**
   * Deletes the output record once the UTXO has been spent.
   * @param {string} txid - The transaction ID of the transaction this UTXO is part of
   * @param {number} outputIndex - The index of the given UTXO
   * @param {string} topic - The topic this UTXO is part of
   * @returns {Promise<void>} A promise that resolves when the record is deleted
   */
  async outputSpent(txid: string, outputIndex: number, spent: string): Promise<void> {
    await this.storageEngine.markUTXOAsSpent(txid, outputIndex, spent)
  }

  /**
   * Queries the lookup service for information.
   * @param {LookupQuestion} question - The question to be answered by the lookup service
   * @returns {Promise<LookupAnswer | LookupFormula>} The data matching the query
   * @throws Will throw an error if the query is invalid
   */
  async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> {
    // Validate Query
    if (question.query === undefined || question.query === null) {
      throw new Error('A valid query must be provided!')
    }
    if (question.service !== 'ls_token') {
      throw new Error('Lookup service not supported!')
    }

    const { txid, outputIndex, findAll } = question.query as UtxoQuery

    if (txid !== undefined && typeof outputIndex !== 'undefined') {
      return await this.storageEngine.findByTxidOutputIndex(
        txid,
        outputIndex
      )
    } else if (findAll) {
      return await this.storageEngine.findAll()
    } else {
      throw new Error('Query parameters must include either a txid + outputIndex or "findAll = \'true\'".')
    }
  }

  /**
  * Returns a Markdown-formatted documentation string for the lookup service.
  * @returns {Promise<string>} A promise that resolves to a documentation string.
  */
  async getDocumentation(): Promise<string> {
    return 'This is a Token lookup service.'
  }

  /**
   * Returns a metadata object that can be used to identify the lookup service.
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
      name: 'UtxoLookupService',
      shortDescription: 'A lookup service for any transaction.',
      iconURL: 'https://example.com/icon.png',
      version: '1.0.0',
      informationURL: 'https://example.com/info'
    }
  }
}
