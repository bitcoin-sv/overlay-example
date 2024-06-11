import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { SLAPStorage } from './SLAPStorage.js'
import { Script } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { SLAPQuery } from 'src/types.js'

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
    if (topic !== 'tm_slap_service_availability') return

    const result = pushdrop.decode({
      script: outputScript.toHex(),
      fieldFormat: 'buffer'
    })

    const [slapIdentifier, identityKey, domainName, serviceName] = result.fields.map((field: { toString: (arg: string) => string }) => field.toString('utf8'))
    if (slapIdentifier !== 'SLAP') return

    await this.storage.storeSLAPRecord(txid, outputIndex, identityKey, domainName, serviceName)
  }

  /**
   * Handles the spending of an output in the topic.
   * @param txid - The transaction ID of the spent output.
   * @param outputIndex - The index of the spent output.
   * @param topic - The topic associated with the spent output.
   */
  async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_slap_service_availability') return
    await this.storage.deleteSLAPRecord(txid, outputIndex)
  }

  /**
   * Handles the deletion of an output in the topic.
   * @param txid - The transaction ID of the deleted output.
   * @param outputIndex - The index of the deleted output.
   * @param topic - The topic associated with the deleted output.
   */
  async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_slap_service_availability') return
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
    if (question.service !== 'ls_slap_service_availability') {
      throw new Error('Lookup service not supported!')
    }

    const { domainName, serviceName } = question.query as SLAPQuery

    // Validate lookup query
    if (domainName !== undefined && domainName !== null && serviceName !== undefined && serviceName !== null) {
      // If both domainName and serviceName are provided, construct a query with both
      return await this.storage.findRecord({ domainName, serviceName })
    } else if (domainName !== undefined && domainName !== null) {
      return await this.storage.findRecord({ domainName })
    } else if (serviceName !== undefined && serviceName !== null) {
      return await this.storage.findRecord({ serviceName })
    } else {
      throw new Error('A valid domainName or serviceName must be provided in the query!')
    }
  }

  /**
   * Returns documentation specific to this overlay lookup service.
   * @returns A promise that resolves to the documentation string.
   */
  async getDocumentation(): Promise<string> {
    return `
    SLAP (Service Lookup Availability Protocol) Lookup Service

    Overview:
    The SLAP Lookup Service provides mechanisms for querying the availability 
    of various lookup services within the overlay network. This service enables 
    users and overlay services to discover and interact with lookup services that are 
    advertised across the network. SLAP ensures that nodes can efficiently find 
    relevant services without needing to be aware of every node in the network.

    Features:
    - Advertise Lookup Service Availability: Nodes can advertise the availability 
      of their lookup services using SLAP tokens.
    - Query Service Availability: Users and other overlay services can query the SLAP 
      service to discover available lookup services based on specific criteria.
    - Federated Discovery: SLAP facilitates a federated approach to 
      service discovery, enhancing the resilience and scalability of the overlay network.

    Implementation Details:
    - The SLAP service uses BRC-48 style Pay-to-Push-Drop tokens to encode and 
      advertise service availability.
    - Each SLAP token contains the following fields: 
      1. SLAP Identifier (must be "SLAP")
      2. Identity Key of the advertising node
      3. Domain Name of the service provider
      4. Service Name being advertised
    - The SLAP lookup service stores these tokens and allows querying based 
      on the domain name and service name.

    Usage:
    - Nodes can use the SLAP Topic Manager to handle the creation and validation 
      of SLAP tokens.
    - The SLAP Lookup Service can be queried to find available lookup services 
      using the findByServiceNameForSLAP method.

    Example:
    To advertise a new lookup service, a node creates a SLAP token with the relevant 
    details and submits it to the overlay network. Other overlay services or users can 
    then query the SLAP service to discover this newly advertised service.

    This service is a crucial component of the overlay network's peer discovery 
    and service availability mechanisms, ensuring efficient and scalable 
    interactions within the network.
  `
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
