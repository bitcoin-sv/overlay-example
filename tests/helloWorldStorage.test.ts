import { Db, Collection } from 'mongodb'
import { HelloWorldStorage } from '../src/helloworld-services/HelloWorldStorage'
import { HelloWorldRecord } from '../src/helloworld-services/types'

describe('HelloWorldStorage', () => {
  let mockDb: Partial<Db>
  let mockCollection: Partial<Collection<HelloWorldRecord>>
  let storage: HelloWorldStorage

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        project: jest.fn().mockReturnThis(),
        toArray: jest.fn(),
      }) as any
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection as Collection<HelloWorldRecord>),
    }

    storage = new HelloWorldStorage(mockDb as Db)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('storeRecord', () => {
    it('should insert a new record into the collection', async () => {
      const txid = 'test-txid'
      const outputIndex = 0
      const message = 'hello world'

      await storage.storeRecord(txid, outputIndex, message)

      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        txid,
        outputIndex,
        message,
        createdAt: expect.any(Date),
      })
    })
  })

  describe('deleteRecord', () => {
    it('should delete a record from the collection', async () => {
      const txid = 'test-txid'
      const outputIndex = 0

      await storage.deleteRecord(txid, outputIndex)

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ txid, outputIndex })
    })
  })

  describe('findByMessage', () => {
    it('should return matching UTXO references for a given message', async () => {
      const message = 'hello world'
      const mockResults = [
        { txid: 'test-txid1', outputIndex: 0 },
        { txid: 'test-txid2', outputIndex: 1 }
      ]

      const findMock = mockCollection.find?.() as any
      findMock.project().toArray = jest.fn().mockResolvedValue(mockResults)

      const result = await storage.findByMessage(message)

      expect(mockCollection.find).toHaveBeenCalledWith({ message })
      expect(result).toEqual(mockResults)
    })

    it('should return an empty array if message is empty or undefined', async () => {
      const emptyResults = await storage.findByMessage('')
      const undefinedResults = await storage.findByMessage(undefined as unknown as string)

      expect(emptyResults).toEqual([])
      expect(undefinedResults).toEqual([])
    })
  })

  describe('getFuzzyRegex', () => {
    it('should convert a string into a fuzzy regex pattern', () => {
      const input = 'hello'
      const regex = storage['getFuzzyRegex'](input)

      expect(regex).toEqual(/h.*e.*l.*l.*o/i)
    })
  })
})
