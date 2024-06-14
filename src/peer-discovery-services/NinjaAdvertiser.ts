import { TaggedBEEF } from '@bsv/overlay/TaggedBEEF.ts'
import pushdrop from 'pushdrop'
import { Ninja, NinjaGetTransactionOutputsResultApi } from 'ninja-base'
import { toBEEFfromEnvelope } from '@babbage/sdk-ts'
import { Transaction, Script } from '@bsv/sdk'
import { Advertiser } from '@bsv/overlay/Advertiser.ts'
import { SHIPAdvertisement } from '@bsv/overlay/SHIPAdvertisement.ts'
import { SLAPAdvertisement } from '@bsv/overlay/SLAPAdvertisement.ts'
import { createAdvertisement } from './utils/createAdvertisement.js'

/**
 * Implements the Advertiser interface for managing SHIP and SLAP advertisements using a Ninja.
 */
export class NinjaAdvertiser implements Advertiser {
  ninja: Ninja

  /**
   * Constructs a new NinjaAdvertiser instance.
   * @param privateKey - The private key used for signing transactions.
   * @param dojoURL - The URL of the dojo server for the Ninja.
   * @param hostingDomain - The base server URL for the NinjaAdvertiser.
   */
  constructor(
    public privateKey: string,
    public dojoURL: string,
    public hostingDomain: string
  ) {
    this.ninja = new Ninja({
      privateKey,
      config: {
        dojoURL
      }
    })
  }

  /**
   * Creates a new SHIP advertisement.
   * @param topic - The topic name for the SHIP advertisement.
   * @returns A promise that resolves to the created SHIP advertisement as TaggedBEEF.
   */
  async createSHIPAdvertisement(topic: string): Promise<TaggedBEEF> {
    return await createAdvertisement(
      this.privateKey,
      'SHIP',
      this.hostingDomain,
      topic,
      this.ninja,
      'SHIP Advertisement Issuance'
    )
  }

  /**
   * Creates a new SLAP advertisement.
   * @param service - The service name for the SLAP advertisement.
   * @returns A promise that resolves to the created SLAP advertisement as TaggedBEEF.
   */
  async createSLAPAdvertisement(service: string): Promise<TaggedBEEF> {
    return await createAdvertisement(
      this.privateKey,
      'SLAP',
      this.hostingDomain,
      service,
      this.ninja,
      'SLAP Advertisement Issuance'
    )
  }

  /**
   * Finds all SHIP advertisements for a given topic.
   * @param topic - The topic name to search for.
   * @returns A promise that resolves to an array of SHIP advertisements.
   */
  async findAllSHIPAdvertisements(topic: string): Promise<SHIPAdvertisement[]> {
    const advertisements: SHIPAdvertisement[] = []
    // Note: consider using tags
    const results = await this.ninja.getTransactionOutputs({
      basket: 'tm_ship',
      includeBasket: true,
      spendable: true
      // type: 'output',
      // tagQueryMode: 'all',
      // limit: 100 // Adjust as needed
    })

    results.forEach((output: NinjaGetTransactionOutputsResultApi) => {
      try {
        const beef = toBEEFfromEnvelope({
          rawTx: output.envelope?.rawTx as string,
          proof: output.envelope?.proof,
          inputs: output.envelope?.inputs,
          txid: output.txid
        }).beef

        const fields = pushdrop.decode({
          script: output.outputScript,
          fieldFormat: 'buffer'
        }).fields

        // Make sure we only return those that match the topic.
        if (fields.length >= 4 && fields[3].toString() === topic) {
          advertisements.push({
            protocol: fields[0].toString(),
            identityKey: fields[1].toString('hex'),
            domain: fields[2].toString(),
            topic: fields[3].toString(),
            beef,
            outputIndex: output.vout
          })
        }
      } catch (error) {
        console.error('Failed to parse SHIP token')
      }
    })

    return advertisements
  }

  /**
   * Finds all SLAP advertisements for a given service.
   * @param service - The service name to search for.
   * @returns A promise that resolves to an array of SLAP advertisements.
   */
  async findAllSLAPAdvertisements(service: string): Promise<SLAPAdvertisement[]> {
    const results = await this.ninja.getTransactionOutputs({
      basket: 'tm_slap',
      includeBasket: true,
      spendable: true
    })

    const advertisements: SLAPAdvertisement[] = []
    results.forEach((output: NinjaGetTransactionOutputsResultApi) => {
      const beef = toBEEFfromEnvelope({
        rawTx: output.envelope?.rawTx as string,
        inputs: output.envelope?.inputs,
        proof: output.envelope?.proof,
        txid: output.txid
      }).beef

      const fields = pushdrop.decode({
        script: output.outputScript,
        fieldFormat: 'buffer'
      }).fields

      // Make sure we only return those that match the topic.
      if (fields.length >= 4 && fields[3].toString() === service) {
        advertisements.push({
          protocol: fields[0].toString(),
          identityKey: fields[1].toString('hex'),
          domain: fields[2].toString(),
          service: fields[3].toString(),
          beef,
          outputIndex: output.vout
        })
      }
    })
    return advertisements
  }

  /**
   * Revokes an existing advertisement.
   * @param advertisement - The advertisement to revoke, either SHIP or SLAP.
   * @returns A promise that resolves to the revoked advertisement as TaggedBEEF.
   */
  async revokeAdvertisement(advertisement: SHIPAdvertisement | SLAPAdvertisement): Promise<TaggedBEEF> {
    if (advertisement.beef === undefined || advertisement.outputIndex == undefined) {
      throw new Error('Advertisement to revoke must contain tagged beef!')
    }
    // Parse the transaction and UTXO to spend
    const advertisementTx = Transaction.fromBEEF(advertisement.beef)
    const outputToRedeem = advertisementTx.outputs[advertisement.outputIndex]
    const unlockingScript = await pushdrop.redeem({
      key: this.privateKey,
      prevTxId: advertisementTx.id().toString(),
      outputIndex: advertisement.outputIndex,
      lockingScript: outputToRedeem.lockingScript.toHex(),
      outputAmount: outputToRedeem.satoshis
    })

    // Create a new transaction that spends the SHIP or SLAP advertisement issuance token
    const revokeTx = await this.ninja.getTransactionWithOutputs({
      outputs: [{
        satoshis: outputToRedeem.satoshis ?? 1,
        script: unlockingScript
      }],
      labels: [],
      note: 'Revoke advertisement',
      autoProcess: true
    })

    const beef = toBEEFfromEnvelope({
      rawTx: revokeTx.rawTx as string,
      inputs: revokeTx.inputs,
      txid: revokeTx.txid
    }).beef

    // Determine if there is an associated topic
    // SLAP tokens are not associated with a topic
    const topics = []
    if ((advertisement as SHIPAdvertisement).topic !== undefined) {
      topics.push((advertisement as SHIPAdvertisement).topic)
    }

    return {
      beef,
      topics
    }
  }

  /**
   * Finds all SHIP advertisements for the given topics and maps them to their associated unique domains.
   * @param topics - An array of topic names to lookup advertisements for.
   * @returns A promise that resolves to a map where the key is the topic name and the value is a set of unique domain names associated with that topic.
   */
  async findAdvertisementsForTopics(topics: string[]): Promise<Map<string, Set<string>>> {
    const topicToDomainsMap = new Map<string, Set<string>>()
    for (const topic of topics) {
      try {
        const shipAdvertisements = await this.findAllSHIPAdvertisements(topic)
        if (shipAdvertisements !== undefined && shipAdvertisements.length > 0) {
          shipAdvertisements.forEach((advertisement: SHIPAdvertisement) => {
            if (!topicToDomainsMap.has(topic)) {
              topicToDomainsMap.set(topic, new Set<string>())
            }
            topicToDomainsMap.get(topic)?.add(advertisement.domain)
          })
        }
      } catch (error) {
        console.error(`Error looking up topic ${String(topic)}:`, error)
      }
    }
    return topicToDomainsMap
  }

  /**
   * Parses an advertisement from the provided output script.
   * @param outputScript - The output script to parse.
   * @returns A SHIPAdvertisement or SLAPAdvertisement if the script matches the expected format, otherwise null.
   */
  parseAdvertisement(outputScript: Script): SHIPAdvertisement | SLAPAdvertisement | null {
    try {
      const result = pushdrop.decode({
        script: outputScript.toHex(),
        fieldFormat: 'buffer'
      })

      const [protocol, identityKey, domain, topicOrServiceName] = result.fields.map((field: { toString: (arg: string) => string }) => field.toString('utf8'))

      if (protocol === 'SHIP') {
        return {
          protocol: 'SHIP',
          identityKey,
          domain,
          topic: topicOrServiceName
        }
      } else if (protocol === 'SLAP') {
        return {
          protocol: 'SLAP',
          identityKey,
          domain,
          service: topicOrServiceName
        }
      } else {
        return null
      }
    } catch (error) {
      console.error('Error parsing advertisement:', error)
      return null
    }
  }
}
