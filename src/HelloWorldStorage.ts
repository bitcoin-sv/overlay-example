// Implements Storage for HelloWorld lookup service
import { Collection, Db } from "mongodb"
export class HelloWorldStorage implements Storage {

  private records: Collection<SigniaRecord>

  /**
   * Constructs a new SigniaStorageEngine instance
   * @param {Db} db - connected mongo database instance
   */
  constructor(private db: Db) {
    // this.records = db.collection<SigniaRecord>("signiaRecords")
    // this.records.createIndex({ "searchableAttributes": "text" })
  }

  [name: string]: any
  length: number

  clear(): void {
    throw new Error("Method not implemented.");
  }

  getItem(key: string): string | null {
    throw new Error("Method not implemented.");
  }

  key(index: number): string | null {
    throw new Error("Method not implemented.");
  }

  removeItem(key: string): void {
    throw new Error("Method not implemented.");
  }

  setItem(key: string, value: string): void {
    // Insert new record
    await this.records.insertOne({
      txid,
      vout,
      certificate,
      createdAt: new Date(),
      searchableAttributes: Object.entries(certificate.fields)
        .filter(([key]) => key !== 'profilePhoto' && key !== 'icon')
        .map(([, value]) => value)
        .join(' ')
    })
  }
}