// Implements Storage for HelloWorld lookup service
import { Collection, Db } from 'mongodb'

interface HelloWorldRecord {
  txid: string
  outputIndex: number
  message: string
  createdAt: Date
}
interface Query {
  $and: Array<{ [key: string]: any }>
}
// Implements a Lookup StorageEngine for HelloWorld
export class HelloWorldStorageEngine {
  private readonly records: Collection<HelloWorldRecord>

  /**
   * Constructs a new SigniaStorageEngine instance
   * @param {Db} db - connected mongo database instance
   */
  constructor(private db: Db) {
    this.records = db.collection<HelloWorldRecord>('helloWorldRecords')
    // this.records.createIndex({ "searchableAttributes": "text" })
  }

  /**
   * Stores record of certification
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   * @param {Certificate} certificate certificate record to store
   */
  async storeRecord(txid: string, outputIndex: number, message: string): Promise<void> {
    // Insert new record
    await this.records.insertOne({
      txid,
      outputIndex,
      message,
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

  // Helper function to convert a string into a regex pattern for fuzzy search
  private getFuzzyRegex(input: string): RegExp {
    const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(escapedInput.split('').join('.*'), 'i')
  }

  // TODO: Custom search functions can be added here.
}
