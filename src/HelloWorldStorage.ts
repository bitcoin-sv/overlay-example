import { Collection, Db } from 'mongodb'

interface HelloWorldRecord {
  txid: string
  outputIndex: number
  message: string
  createdAt: Date
}
interface UTXOReference {
  txid: string
  outputIndex: number
}

// Implements a Lookup StorageEngine for HelloWorld
export class HelloWorldStorage {
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

  /**
   * Finds matching records by identity key, and optional certifiers
   * @param {string} message
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  async findByMessage(message: string): Promise<UTXOReference[]> {
    // Validate search query param
    if (message === '' || message === undefined) {
      return []
    }

    // Return matching records based on the query
    return await this.records.find({ message })
      .project<UTXOReference>({ txid: 1, outputIndex: 1 })
      .toArray()
      .then(results => results.map(record => ({
        txid: record.txid,
        outputIndex: record.outputIndex
      })))
  }

  // Additional custom query functions can be added here. ---------------------------------------------
}
