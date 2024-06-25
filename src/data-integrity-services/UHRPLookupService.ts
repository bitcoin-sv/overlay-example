import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { UHRPStorage } from './UHRPStorage.js'
import { Script } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { getURLForHash, normalizeURL } from 'uhrp-url'
import { UHRPQuery } from 'src/types.js'
import { getDocumentation } from '../utils/getDocumentation.js'

const UHRP_URL_INDEX = 2
const EXPIRY_TIME_INDEX = 5

/**
 * Implements an example UHRP lookup service
 *
 * Note: The PushDrop package is used to decode BRC-48 style Pay-to-Push-Drop tokens.
 *
 * @public
 */
export class UHRPLookupService implements LookupService {
  /**
   * Constructs a new UHRPLookupService instance
   * @param storage - The storage instance to use for managing records
   */
  constructor(public storage: UHRPStorage) { }

  /**
   * Notifies the lookup service of a new output added.
   *
   * @param {string} txid - The transaction ID containing the output.
   * @param {number} outputIndex - The index of the output in the transaction.
   * @param {Script} outputScript - The script of the output to be processed.
   * @param {string} topic - The topic associated with the output.
   *
   * @returns {Promise<void>} A promise that resolves when the processing is complete.
   * @throws Will throw an error if there is an issue with storing the record in the storage engine.
   */
  async outputAdded(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> {
    if (topic !== 'tm_uhrp') return
    // Decode the UHRP token fields from the Bitcoin outputScript
    const result = pushdrop.decode({
      script: outputScript.toHex(),
      fieldFormat: 'buffer'
    })

    // UHRP Fields to store
    // Note: UHRPUrl is converted to a Base58 encoded string
    const UHRPUrl = getURLForHash(result.fields[UHRP_URL_INDEX])
    const retentionPeriod = result.fields[EXPIRY_TIME_INDEX].toString('utf8')

    // Store the token fields for future lookup
    await this.storage.storeRecord(
      txid,
      outputIndex,
      UHRPUrl,
      retentionPeriod
    )
  }

  /**
   * Notifies the lookup service that an output was spent
   * @param txid - The transaction ID of the spent output
   * @param outputIndex - The index of the spent output
   * @param topic - The topic associated with the spent output
   */
  async outputSpent(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_uhrp') return
    await this.storage.deleteRecord(txid, outputIndex)
  }

  /**
   * Notifies the lookup service that an output has been deleted
   * @param txid - The transaction ID of the deleted output
   * @param outputIndex - The index of the deleted output
   * @param topic - The topic associated with the deleted output
   */
  async outputDeleted(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_uhrp') return
    await this.storage.deleteRecord(txid, outputIndex)
  }

  /**
   * Answers a lookup query
   * @param question - The lookup question to be answered
   * @returns A promise that resolves to a lookup answer or formula
   */
  async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> {
    if (question.query === undefined || question.query === null) {
      throw new Error('A valid query must be provided!')
    }
    if (question.service !== 'ls_uhrp') {
      throw new Error('Lookup service not supported!')
    }

    const { UHRPUrl, retentionPeriod } = question.query as UHRPQuery

    if (UHRPUrl !== undefined) {
      const normalizedUHRPUrl = normalizeURL(UHRPUrl)
      return await this.storage.findByUHRPUrl(normalizedUHRPUrl)
    } else if (retentionPeriod !== undefined) {
      return await this.storage.findByRetentionPeriod(retentionPeriod)
    } else {
      throw new Error('Query parameters must include UHRPUrl or retentionPeriod!')
    }
  }

  /**
   * Returns documentation specific to this overlay lookup service
   * @returns A promise that resolves to the documentation string
   */
  async getDocumentation(): Promise<string> {
    return await getDocumentation('../../docs/UHRP/uhrp-lookup-service.md')
  }

  /**
   * Returns metadata associated with this lookup service
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
