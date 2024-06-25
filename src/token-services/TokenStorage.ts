import { Collection, Db } from 'mongodb'
import { TokenRecord, UTXOReference } from '../types.js'

/**
 * Implements a Storage Engine for Tokens Lookup
 */
export class TokenStorage {
  private readonly records: Collection<TokenRecord>

  /**
   * Constructs a new TokenStorage instance
   * @param db - connected Mongo database instance
   */
  constructor(private readonly db: Db) {
    this.records = db.collection<TokenRecord>('tokenRecords')
  }

  /**
   * Stores a new Token record
   * @param txid the transactionId of the transaction this UTXO is a part of
   * @param outputIndex index of the output
   * @param amount the amount of the token
   * @param ownerKey the public key of the token owner
   * @param assetId the identifier of the asset
   */
  async storeRecord(txid: string, outputIndex: number, amount: number, ownerKey: string, assetId: string): Promise<void> {
    await this.records.insertOne({
      txid,
      outputIndex,
      amount,
      ownerKey,
      assetId,
      createdAt: new Date()
    })
  }

  /**
   * Deletes an existing Token record
   * @param txid the transactionId of the transaction this UTXO is a part of
   * @param outputIndex index of the output
   */
  async deleteRecord(txid: string, outputIndex: number): Promise<void> {
    await this.records.deleteOne({ txid, outputIndex })
  }

  /**
   * Finds a Token record by txid and outputIndex
   * @param txid the transactionId of the UTXO
   * @param outputIndex the index of the UTXO
   * @returns matching UTXO reference
   */
  async findByTxidOutputIndex(txid: string, outputIndex: number): Promise<UTXOReference[]> {
    // TODO: Validate query params

    return await this.records.find({ txid, outputIndex })
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex
      })))
  }

  /**
   * Finds all Token records
   * @returns array of UTXO references
   */
  async findAll(): Promise<UTXOReference[]> {
    return await this.records.find({})
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex
      })))
  }
}
