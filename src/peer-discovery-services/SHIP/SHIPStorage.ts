import { Collection, Db } from 'mongodb'
import { SHIPRecord, UTXOReference } from '../../types.js'

/**
 * Implements a storage engine for SHIP protocol
 */
export class SHIPStorage {
  private readonly shipRecords: Collection<SHIPRecord>

  /**
   * Constructs a new SHIPStorage instance
   * @param {Db} db - connected mongo database instance
   */
  constructor(private readonly db: Db) {
    this.shipRecords = db.collection<SHIPRecord>('shipRecords')
  }

  /**
   * Ensures the necessary indexes are created for the collections.
   */
  async ensureIndexes(): Promise<void> {
    await this.shipRecords.createIndex({ domain: 1, topic: 1 })
  }

  /**
   * Stores a SHIP record
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   * @param {string} identityKey identity key
   * @param {string} domain domain name
   * @param {string} topic topic name
   */
  async storeSHIPRecord(txid: string, outputIndex: number, identityKey: string, domain: string, topic: string): Promise<void> {
    await this.shipRecords.insertOne({
      txid,
      outputIndex,
      identityKey,
      domain,
      topic,
      createdAt: new Date()
    })
  }

  /**
   * Deletes a SHIP record
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   */
  async deleteSHIPRecord(txid: string, outputIndex: number): Promise<void> {
    await this.shipRecords.deleteOne({ txid, outputIndex })
  }

  /**
   * Finds SHIP records based on a given query object.
   * @param {Object} query The query object which may contain properties for domain or topics.
   * @returns {Promise<UTXOReference[]>} Returns matching UTXO references.
   */
  async findRecord(query: { domain?: string; topics?: string[] }): Promise<UTXOReference[]> {
    const mongoQuery: any = {}

    // Add domain to the query if provided
    if (query.domain) {
      mongoQuery.domain = query.domain
    }

    // Add topics to the query if provided
    if (query.topics && Array.isArray(query.topics)) {
      mongoQuery.topic = { $in: query.topics }
    }

    return await this.shipRecords
      .find(mongoQuery)
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then((results) =>
        results.map((record) => ({
          txid: record.txid,
          outputIndex: record.outputIndex,
        }))
      )
  }

  /**
 * Returns all results tracked by the overlay
 * @returns {Promise<UTXOReference[]>} returns matching UTXO references
 */
  async findAll(): Promise<UTXOReference[]> {
    return await this.shipRecords.find({})
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then(results => results.map(shipRecords => ({
        txid: shipRecords.txid,
        outputIndex: shipRecords.outputIndex
      })))
  }
}
