import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { SLAPStorage } from './SLAPStorage.js'
import { Script } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { SLAPQuery } from 'src/types.js'
import { getDocumentation } from 'src/utils/getDocumentation.js'

/**
 * Implements the SLAP lookup service
 *
 * The SLAP lookup service allows querying for service availability within the
 * overlay network. This service listens for SLAP-related UTXOs and stores relevant
 * records for lookup purposes.
 */
export class SLAPLookupService implements LookupService {
  constructor(public storage: SLAPStorage) { }

  /**
   * Handles the addition of a new output to the topic.
   * @param txid - The transaction ID containing the output.
   * @param outputIndex - The index of the output in the transaction.
   * @param outputScript - The script of the output to be processed.
   * @param topic - The topic associated with the output.
   */
  async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> {
    if (topic !== 'tm_slap') return

    const result = pushdrop.decode({
      script: outputScript.toHex(),
      fieldFormat: 'buffer'
    })

    const protocol = result.fields[0].toString()
    const identityKey = result.fields[1].toString('hex')
    const domain = result.fields[2].toString()
    const service = result.fields[3].toString()

    if (protocol !== 'SLAP') return

    await this.storage.storeSLAPRecord(txid, outputIndex, identityKey, domain, service)
  }

  /**
   * Handles the spending of an output in the topic.
   * @param txid - The transaction ID of the spent output.
   * @param outputIndex - The index of the spent output.
   * @param topic - The topic associated with the spent output.
   */
  async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_slap') return
    await this.storage.deleteSLAPRecord(txid, outputIndex)
  }

  /**
   * Handles the deletion of an output in the topic.
   * @param txid - The transaction ID of the deleted output.
   * @param outputIndex - The index of the deleted output.
   * @param topic - The topic associated with the deleted output.
   */
  async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_slap') return
    await this.storage.deleteSLAPRecord(txid, outputIndex)
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
    if (question.service !== 'ls_slap') {
      throw new Error('Lookup service not supported!')
    }

    const { domain, service } = question.query as SLAPQuery

    // Validate lookup query
    if (domain !== undefined && domain !== null && service !== undefined && service !== null) {
      // If both domain and service are provided, construct a query with both
      return await this.storage.findRecord({ domain, service })
    } else if (domain !== undefined && domain !== null) {
      return await this.storage.findRecord({ domain })
    } else if (service !== undefined && service !== null) {
      return await this.storage.findRecord({ service })
    } else {
      throw new Error('A valid domain or service must be provided in the query!')
    }
  }

  /**
   * Returns documentation specific to this overlay lookup service.
   * @returns A promise that resolves to the documentation string.
   */
  async getDocumentation(): Promise<string> {
    return await getDocumentation('../../../../docs/SHIP/ship-lookup-service.md')
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
      name: 'SLAP Lookup Service',
      shortDescription: 'Provides lookup capabilities for SLAP tokens.'
    }
  }
}
