import { TaggedBEEF } from '@bsv/overlay/TaggedBEEF.ts'
import pushdrop from 'pushdrop'
import { Ninja } from 'ninja-base'
import { toBEEFfromEnvelope } from '@babbage/sdk-ts'
import { Transaction, Script, PublicKey, PrivateKey } from '@bsv/sdk'
import { AdvertisementData, Advertiser } from '@bsv/overlay/Advertiser.ts'
import { getPaymentPrivateKey } from 'sendover'
import { Advertisement, LookupAnswer, LookupQuestion } from '@bsv/overlay'

const AD_TOKEN_VALUE = 1

type LookupFunction = (
  (lookupQuestion: LookupQuestion) => Promise<LookupAnswer>
)
/**
 * Implements the Advertiser interface for managing SHIP and SLAP advertisements using a Ninja.
 */
export class NinjaAdvertiser implements Advertiser {
  ninja: Ninja
  lookup: LookupFunction | undefined

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

  setLookupFunction(lookup: LookupFunction): void {
    this.lookup = lookup
  }

  /**
   * Utility function to create multiple advertisements in a single transaction.
   * @param privateKey The private key used to sign the transaction.
   * @param adsData Array of advertisement details.
   * @param ninja Ninja instance for transaction processing.
   * @param note A note attached to the transaction.
   * @returns A promise that resolves to an array of TaggedBEEF objects.
   * @throws Will throw an error if the locking key is invalid.
   */
  async createAdvertisements(
    adsData: AdvertisementData[]
  ): Promise<TaggedBEEF> {
    const identityKey = PublicKey.fromPrivateKey(new PrivateKey(this.privateKey, 'hex')).toString()

    const outputs = await Promise.all(adsData.map(async (ad) => {
      // Derive a locking private key using BRC-42 derivation scheme
      const derivedPrivateKey = getPaymentPrivateKey({
        recipientPrivateKey: this.privateKey,
        senderPublicKey: identityKey,
        invoiceNumber: `2-${ad.protocol}-1`,
        returnType: 'hex'
      })

      const lockingScript = await pushdrop.create({
        fields: [
          Buffer.from(ad.protocol),
          Buffer.from(identityKey, 'hex'),
          Buffer.from(this.hostingDomain),
          Buffer.from(ad.topicOrServiceName)
        ],
        key: derivedPrivateKey
      })

      return {
        satoshis: AD_TOKEN_VALUE,
        script: lockingScript
      }
    }))

    const tx = await this.ninja.getTransactionWithOutputs({
      outputs,
      note: 'SHIP/SLAP Advertisement Issuance',
      autoProcess: true
    })

    const beef = toBEEFfromEnvelope({
      rawTx: tx.rawTx as string,
      inputs: tx.inputs,
      txid: tx.txid
    }).beef

    return {
      beef,
      topics: [...new Set(adsData.map(ad => ad.protocol === 'SHIP' ? 'tm_ship' : 'tm_slap'))]
    }
  }

  /**
   * Finds all SHIP advertisements for a given topic.
   * @param topic - The topic name to search for.
   * @returns A promise that resolves to an array of SHIP advertisements.
   */
  async findAllAdvertisements(protocol: 'SHIP' | 'SLAP'): Promise<Advertisement[]> {
    if (this.lookup === undefined) {
      throw new Error('Advertiser must be configured with a advertisement lookup function.')
    }
    const advertisements: Advertisement[] = []
    const lookupAnswer = await this.lookup({
      service: protocol === 'SHIP' ? 'ls_ship' : 'ls_slap',
      query: 'findAll'
    })

    // Lookup will currently always return type output-list
    if (lookupAnswer.type === 'output-list') {
      lookupAnswer.outputs.forEach(output => {
        try {
          // Parse out the advertisements using the provided parser
          const tx = Transaction.fromBEEF(output.beef)
          const advertisement = this.parseAdvertisement(tx.outputs[output.outputIndex].lockingScript)
          if (advertisement !== undefined && advertisement !== null && advertisement.protocol === protocol) {
            advertisements.push({
              ...advertisement,
              beef: output.beef,
              outputIndex: output.outputIndex
            })
          }
        } catch (error) {
          console.error('Failed to parse advertisement output:', error)
        }
      })
    }

    return advertisements
  }

  /**
   * Revokes an existing advertisement.
   * @param advertisements - The advertisements to revoke, either SHIP or SLAP.
   * @returns A promise that resolves to the revoked advertisement as TaggedBEEF.
   */
  async revokeAdvertisements(advertisements: Advertisement[]): Promise<TaggedBEEF> {
    if (advertisements.length === 0) {
      throw new Error('Must provide advertisements to revoke!')
    }
    const inputsByTxid: { [txid: string]: { rawTx: string, outputsToRedeem: Array<{ index: number, unlockingScript: string }> } } = {}
    for (const advertisement of advertisements) {
      if (advertisement.beef === undefined || advertisement.outputIndex === undefined) {
        throw new Error('Advertisement to revoke must contain tagged beef!')
      }
      // Parse the transaction and UTXO to spend
      const advertisementTx = Transaction.fromBEEF(advertisement.beef)
      const adTxid = advertisementTx.id('hex')
      const outputToRedeem = advertisementTx.outputs[advertisement.outputIndex]
      const identityKey = PublicKey.fromPrivateKey(new PrivateKey(this.privateKey, 'hex')).toString()

      // Derive a unlocking private key using BRC-42 derivation scheme
      const derivedPrivateKey = getPaymentPrivateKey({
        recipientPrivateKey: this.privateKey,
        senderPublicKey: identityKey,
        invoiceNumber: `2-${advertisement.protocol}-1`,
        returnType: 'hex'
      })

      const unlockingScript = await pushdrop.redeem({
        key: derivedPrivateKey,
        prevTxId: adTxid,
        outputIndex: advertisement.outputIndex,
        lockingScript: outputToRedeem.lockingScript.toHex(),
        outputAmount: outputToRedeem.satoshis
      })

      const constructedRedeem = {
        index: advertisement.outputIndex,
        unlockingScript
      }

      // Group outputs by their transaction ID
      if (inputsByTxid[adTxid] === undefined) {
        inputsByTxid[adTxid] = {
          rawTx: advertisementTx.toHex(),
          outputsToRedeem: [constructedRedeem]
        }
      } else {
        inputsByTxid[adTxid].outputsToRedeem.push(constructedRedeem)
      }
    }

    // Create a new transaction that spends the SHIP or SLAP advertisement issuance token
    const revokeTx = await this.ninja.getTransactionWithOutputs({
      inputs: inputsByTxid,
      outputs: [],
      labels: [],
      note: 'Revoked SHIP/SLAP advertisements',
      autoProcess: true
    })

    const beef = toBEEFfromEnvelope({
      rawTx: revokeTx.rawTx as string,
      inputs: revokeTx.inputs,
      txid: revokeTx.txid
    }).beef

    return {
      beef,
      topics: [...new Set(advertisements.map(ad => ad.protocol === 'SHIP' ? 'tm_ship' : 'tm_slap'))]
    }
  }

  /**
   * Parses an advertisement from the provided output script.
   * @param outputScript - The output script to parse.
   * @returns An Advertisement object if the script matches the expected format, otherwise throws an error.
   */
  parseAdvertisement(outputScript: Script): Advertisement {
    try {
      const result = pushdrop.decode({
        script: outputScript.toHex(),
        fieldFormat: 'buffer'
      })

      if (result.fields.length < 4) {
        throw new Error('Invalid SHIP/SLAP advertisement!')
      }

      const protocol = result.fields[0].toString()
      if (protocol !== 'SHIP' && protocol !== 'SLAP') {
        throw new Error('Invalid protocol type!')
      }

      const identityKey = result.fields[1].toString('hex')
      const domain = result.fields[2].toString()
      const topicOrService = result.fields[3].toString()

      // Construct a unified Advertisement object
      return {
        protocol: protocol as 'SHIP' | 'SLAP',
        identityKey,
        domain,
        topicOrService
      }
    } catch (error) {
      console.error('Error parsing advertisement:', error)
      throw new Error('Error parsing advertisement!')
    }
  }
}
