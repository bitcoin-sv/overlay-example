import { Collection, Db } from 'mongodb'
import { UtxoRecord } from '../types.js'

/**
 * Implements a Storage Engine for Tokens Lookup
 */
export class UtxoStorage {
  private readonly records: Collection<UtxoRecord>

  /**
   * Constructs a new UtxoStorage instance
   * @param db - connected Mongo database instance
   */
  constructor(private readonly db: Db) {
    this.records = db.collection<UtxoRecord>('UtxoRecords')
  }

  /**
   * Stores a new Utxo record
   * @param txid the transactionId of the transaction this UTXO is a part of
   * @param outputIndex index of the output
   * 
   */
  async storeRecord(txid: string, outputIndex: number): Promise<void> {
    await this.records.insertOne({
      txid,
      outputIndex,
      spent: null
    })
  }

  /**
   * Sets the spent status of a UTXO
   * @param txid the transactionId of the transaction this UTXO is a part of
   * @param outputIndex index of the output
   * @param spent the txid of the transaction that spent this UTXO.
   * 
   */
  async markUTXOAsSpent(txid: string, outputIndex: number, spent: string): Promise<void> {
    await this.records.updateOne({ txid, outputIndex }, { $set: { spent } })
  }

  /**
   * Finds a Token record by txid and outputIndex
   * @param txid the transactionId of the UTXO
   * @param outputIndex the index of the UTXO
   * @returns matching UTXO reference
   */
  async findByTxidOutputIndex(txid: string, outputIndex: number): Promise<UtxoRecord[]> {
    // TODO: Validate query params

    return await this.records.find({ txid, outputIndex })
      .project<UtxoRecord>({ txid: 1, outputIndex: 1, spent: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex,
        spent: record.spent
      })))
  }

  /**
   * Finds all Token records
   * @returns array of UTXO references
   */
  async findAll(): Promise<UtxoRecord[]> {
    return await this.records.find({})
      .project<UtxoRecord>({ txid: 1, outputIndex: 1, spent: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex,
        spent: record.spent
      })))
  }
}
