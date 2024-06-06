import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { HelloWorldStorage } from './HelloWorldStorage.js'

/**
 * Implements an example hello world lookup service
 * @public
 */
export class HelloWorldLookupService implements LookupService {
  /**
   * Constructs a new Hello World Lookup Service instance
   * @param storage
   */
  constructor(public storage: HelloWorldStorage) { }

  /**
   * Notifies a lookup service that an output was spent
   * @param txid
   * @param outputIndex
   * @param topic
   */
  async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'HelloWorld') return
    await this.storage.deleteRecord(txid, outputIndex)
  }

  /**
   * Notifies a lookup service that an output has been deleted
   * @param txid 
   * @param outputIndex 
   * @param topic 
   */
  async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'HelloWorld') return
    await this.storage.deleteRecord(txid, outputIndex)
  }

  /**
   * Answers a lookup query
   * @param question
   */
  async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> {
    console.log(`Running lookup for ${question.query as string} for the service ${question.service as string}`)
    // TODO: Run actual query against storage
    return {
      type: 'output-list',
      outputs: [{
        beef: [0],
        outputIndex: 0
      }]
    }
  }

  /**
   * Returns documentation specific to this overlay lookup service
   * @returns 
   */
  async getDocumentation(): Promise<string> {
    return 'This is the HelloWorld overlay service!'
  }

  // Returns metadata associated with this lookup service
  async getMetaData(): Promise<{ name: string; shortDescription: string; iconURL?: string | undefined; version?: string | undefined; informationURL?: string | undefined }> {
    throw new Error('Method not implemented.')
  }
}
