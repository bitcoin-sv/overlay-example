import { Collection, Db } from 'mongodb'
import { UHRPRecord, UTXOReference } from 'src/types.js'

// Implements a Lookup StorageEngine for UHRP
export class UHRPStorage {
  private readonly records: Collection<UHRPRecord>

  /**
   * Constructs a new UHRPStorage instance
   * @param {Db} db - connected mongo database instance
   */
  constructor(private readonly db: Db) {
    this.records = db.collection<UHRPRecord>('uhrpRecords')
  }

  /**
   * Stores record of certification
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   * @param {string} uhrpURL
   * @param {number} retentionPeriod
   */
  async storeRecord(txid: string, outputIndex: number, uhrpURL: string, retentionPeriod: number): Promise<void> {
    // Insert new record
    await this.records.insertOne({
      txid,
      outputIndex,
      uhrpURL,
      retentionPeriod,
      createdAt: new Date()
    })
  }

  /**
   * Delete a matching Signia record
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   */
  async deleteRecord(txid: string, outputIndex: number): Promise<void> {
    await this.records.deleteOne({ txid, outputIndex })
  }

  /**
   * Finds matching records by identity key, and optional certifiers
   * @param {string} message
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  async findByUHRPUrl(uhrpURL: string): Promise<UTXOReference[]> {
    // Validate search query param
    if (uhrpURL === '' || uhrpURL === undefined) {
      return []
    }

    // Return matching records based on the query
    return await this.records.find({ uhrpURL })
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex
      })))
  }

  /**
   * Look up a UHRP record by the retentionPeriod
   * @param retentionPeriod
   */
  async findByRetentionPeriod(retentionPeriod: number): Promise<UTXOReference[]> {
    // TODO: Validate search query param

    // Return matching records based on the query
    return await this.records.find({ retentionPeriod })
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex
      })))
  }
}
