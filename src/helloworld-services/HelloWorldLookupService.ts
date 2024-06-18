import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { HelloWorldStorage } from './HelloWorldStorage.js'
import { Script } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { getDocumentation } from 'src/utils/getDocumentation.js'

/**
 * Implements an example HelloWorld lookup service
 *
 * Note: The PushDrop package is used to decode BRC-48 style Pay-to-Push-Drop tokens.
 *
 * @public
 */
export class HelloWorldLookupService implements LookupService {
  /**
   * Constructs a new HelloWorldLookupService instance
   * @param storage - The storage instance to use for managing records
   */
  constructor(public storage: HelloWorldStorage) { }

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
    if (topic !== 'tm_helloworld') return
    // Decode the HelloWorld token fields from the Bitcoin outputScript
    const result = pushdrop.decode({
      script: outputScript.toHex(),
      fieldFormat: 'buffer'
    })

    // Parse out the message field
    const helloMessage = result.fields[0].toString('utf8')

    // Store the token fields for future lookup
    await this.storage.storeRecord(
      txid,
      outputIndex,
      helloMessage
    )
  }

  /**
   * Notifies the lookup service that an output was spent
   * @param txid - The transaction ID of the spent output
   * @param outputIndex - The index of the spent output
   * @param topic - The topic associated with the spent output
   */
  async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_helloworld') return
    await this.storage.deleteRecord(txid, outputIndex)
  }

  /**
   * Notifies the lookup service that an output has been deleted
   * @param txid - The transaction ID of the deleted output
   * @param outputIndex - The index of the deleted output
   * @param topic - The topic associated with the deleted output
   */
  async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_helloworld') return
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
    if (question.service !== 'ls_helloworld') {
      throw new Error('Lookup service not supported!')
    }

    // Simple example which does a query by the message
    return await this.storage.findByMessage(question.query as string)
  }

  /**
   * Returns documentation specific to this overlay lookup service
   * @returns A promise that resolves to the documentation string
   */
  async getDocumentation(): Promise<string> {
    return await getDocumentation('../../../../docs/HelloWorld/helloworld-lookup-service.md')
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
