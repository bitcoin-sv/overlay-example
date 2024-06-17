import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { UHRPStorage } from './UHRPStorage.js'
import { Script } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { getURLForHash, normalizeURL } from 'uhrp-url'
import { UHRPQuery } from 'src/types.js'

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
  async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> {
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
  async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_uhrp') return
    await this.storage.deleteRecord(txid, outputIndex)
  }

  /**
   * Notifies the lookup service that an output has been deleted
   * @param txid - The transaction ID of the deleted output
   * @param outputIndex - The index of the deleted output
   * @param topic - The topic associated with the deleted output
   */
  async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> {
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
    return `
    # UHRP Overlay Lookup Service

    This service provides lookup functionality for UHRP (Universal Hash Resolution Protocol) tokens using BRC-48 style Pay-to-Push-Drop tokens.

    ## Methods

    ### outputAdded
    Decodes UHRP token fields from the output script and stores them.

    **Parameters:**
    - \`txid: string\` - The transaction ID containing the output.
    - \`outputIndex: number\` - The index of the output in the transaction.
    - \`outputScript: Script\` - The script of the output to be processed.
    - \`topic: string\` - The topic associated with the output.

    ### outputSpent
    Removes the corresponding record from the storage when an output is spent.

    **Parameters:**
    - \`txid: string\` - The transaction ID of the spent output.
    - \`outputIndex: number\` - The index of the spent output.
    - \`topic: string\` - The topic associated with the spent output.

    ### outputDeleted
    Removes the corresponding record from the storage when an output is deleted.

    **Parameters:**
    - \`txid: string\` - The transaction ID of the deleted output.
    - \`outputIndex: number\` - The index of the deleted output.
    - \`topic: string\` - The topic associated with the deleted output.

    ### lookup
    Answers a lookup query by searching the storage for records matching the query parameters.

    **Parameters:**
    - \`question: LookupQuestion\` - The lookup question to be answered.

    **Returns:**
    - A promise that resolves to a \`LookupAnswer\` or \`LookupFormula\`.

    ### getDocumentation
    Returns documentation specific to this overlay lookup service.

    **Returns:**
    - A promise that resolves to the documentation string.

    ### getMetaData
    Returns metadata associated with this lookup service.

    **Returns:**
    - A promise that resolves to an object containing metadata.

    ## Storage
    The UHRPLookupService relies on the \`UHRPStorage\` instance to manage records.

    ## Dependencies
    - \`@bsv/overlay\`
    - \`@bsv/sdk\`
    - \`pushdrop\`
    - \`uhrp-url\`

    ## Example Usage
    \`\`\`javascript
    const storage = new UHRPStorage();
    const lookupService = new UHRPLookupService(storage);

    const txid = 'some-transaction-id';
    const outputIndex = 0;
    const outputScript = new Script('some-script');
    const topic = 'tm_uhrp';

    lookupService.outputAdded(txid, outputIndex, outputScript, topic)
      .then(() => console.log('Output added successfully'))
      .catch(error => console.error('Error adding output:', error));
    \`\`\`
  `
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
