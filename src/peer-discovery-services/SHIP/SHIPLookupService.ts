import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { SHIPStorage } from './SHIPStorage.js'
import { Script } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { SHIPQuery } from 'src/types.js'
import { getDocumentation } from '../../utils/getDocumentation.js'

/**
 * Implements the SHIP lookup service
 *
 * The SHIP lookup service allows querying for overlay services hosting specific topics
 * within the overlay network.
 */
export class SHIPLookupService implements LookupService {
  constructor(public storage: SHIPStorage) { }

  /**
   * Handles the addition of a new output to the topic.
   * @param txid - The transaction ID containing the output.
   * @param outputIndex - The index of the output in the transaction.
   * @param outputScript - The script of the output to be processed.
   * @param topic - The topic associated with the output.
   */
  async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> {
    if (topic !== 'tm_ship') return

    const result = pushdrop.decode({
      script: outputScript.toHex(),
      fieldFormat: 'buffer'
    })

    const shipIdentifier = result.fields[0].toString()
    const identityKey = result.fields[1].toString('hex')
    const domain = result.fields[2].toString()
    const topicSupported = result.fields[3].toString()
    if (shipIdentifier !== 'SHIP') return

    await this.storage.storeSHIPRecord(txid, outputIndex, identityKey, domain, topicSupported)
  }

  /**
   * Handles the spending of an output in the topic.
   * @param txid - The transaction ID of the spent output.
   * @param outputIndex - The index of the spent output.
   * @param topic - The topic associated with the spent output.
   */
  async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_ship') return
    await this.storage.deleteSHIPRecord(txid, outputIndex)
  }

  /**
   * Handles the deletion of an output in the topic.
   * @param txid - The transaction ID of the deleted output.
   * @param outputIndex - The index of the deleted output.
   * @param topic - The topic associated with the deleted output.
   */
  async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_ship') return
    await this.storage.deleteSHIPRecord(txid, outputIndex)
  }

  /**
   * Answers a lookup query.
   * @param question - The lookup question to be answered.
   * @returns A promise that resolves to a lookup answer or formula.
   */
  async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> {
    if (question.query === undefined || question.query === null) {
      throw new Error('A valid query must be provided!')
    }
    if (question.service !== 'ls_ship') {
      throw new Error('Lookup service not supported!')
    }

    const { domain, topic } = question.query as SHIPQuery

    // Validate lookup query
    if (domain !== undefined && domain !== null && topic !== undefined && topic !== null) {
      // If both domain and topic are provided, construct a query with both
      const records = await this.storage.findRecord({ domain, topic })
      return records
    } else if (domain !== undefined && domain !== null) {
      const records = await this.storage.findRecord({ domain })
      return records
    } else if (topic !== undefined && topic !== null) {
      const records = await this.storage.findRecord({ topic })
      return records
    } else {
      throw new Error('A valid domain or topic must be provided in the query!')
    }
  }

  /**
   * Returns documentation specific to this overlay lookup service.
   * @returns A promise that resolves to the documentation string.
   */
  async getDocumentation(): Promise<string> {
    return await getDocumentation('./docs/SHIP/ship-lookup-service.md')
  }

  /**
   * Returns metadata associated with this lookup service.
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
      name: 'SHIP Lookup Service',
      shortDescription: 'Provides lookup capabilities for SHIP tokens.'
    }
  }
}
