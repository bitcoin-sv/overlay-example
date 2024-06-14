import { Collection, Db } from 'mongodb'
import { SLAPRecord, UTXOReference } from 'src/types.js'

/**
 * Implements a storage engine for SLAP protocol
 */
export class SLAPStorage {
  private readonly slapRecords: Collection<SLAPRecord>

  /**
   * Constructs a new SLAPStorage instance
   * @param {Db} db - connected mongo database instance
   */
  constructor(private readonly db: Db) {
    this.slapRecords = db.collection<SLAPRecord>('slapRecords')
  }

  /**
   * Ensures the necessary indexes are created for the collections.
   */
  async ensureIndexes(): Promise<void> {
    await this.slapRecords.createIndex({ domain: 1, service: 1 })
  }

  /**
   * Stores a SLAP record
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   * @param {string} identityKey identity key
   * @param {string} domain domain name
   * @param {string} service service name
   */
  async storeSLAPRecord(txid: string, outputIndex: number, identityKey: string, domain: string, service: string): Promise<void> {
    await this.slapRecords.insertOne({
      txid,
      outputIndex,
      identityKey,
      domain,
      service,
      createdAt: new Date()
    })
  }

  /**
   * Deletes a SLAP record
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   */
  async deleteSLAPRecord(txid: string, outputIndex: number): Promise<void> {
    await this.slapRecords.deleteOne({ txid, outputIndex })
  }

  /**
   * Finds SLAP records based on a given query object.
   * @param {Object} query The query object which may contain properties for domain or service.
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  async findRecord(query: { domain?: string, service?: string }): Promise<UTXOReference[]> {
    return await this.slapRecords.find(query)
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex
      })))
  }
}
