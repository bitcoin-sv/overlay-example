import { Collection, Db, InsertOneResult, DeleteResult, ObjectId } from 'mongodb'
import { TokenStorage } from '../../src/token-services/TokenStorage'
import { TokenRecord } from '../../src/types'

// Mock the dependencies
jest.mock('mongodb')

describe('TokenStorage', () => {
  let db: jest.Mocked<Db>
  let collection: jest.Mocked<Collection<TokenRecord>>
  let storage: TokenStorage

  const mockInsertResult: InsertOneResult = { acknowledged: true, insertedId: new ObjectId() }
  const mockDeleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
  const mockResult: TokenRecord = {
    txid: 'txid1',
    outputIndex: 0,
    amount: 100,
    ownerKey: 'ownerKey',
    assetId: 'assetId',
    createdAt: new Date()
  }
  const mockResults: TokenRecord[] = [
    {
      txid: 'txid1',
      outputIndex: 0,
      amount: 100,
      ownerKey: 'ownerKey',
      assetId: 'assetId',
      createdAt: new Date()
    },
    {
      txid: 'txid2',
      outputIndex: 1,
      amount: 200,
      ownerKey: 'ownerKey2',
      assetId: 'assetId2',
      createdAt: new Date()
    }
  ]

  const createMockCursor = (data: TokenRecord[]) => ({
    project: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue(data)
  })

  beforeEach(() => {
    collection = {
      insertOne: jest.fn().mockResolvedValue(mockInsertResult),
      deleteOne: jest.fn().mockResolvedValue(mockDeleteResult),
      find: jest.fn().mockReturnValue(createMockCursor([mockResult]))
    } as unknown as jest.Mocked<Collection<TokenRecord>>

    db = {
      collection: jest.fn().mockReturnValue(collection)
    } as unknown as jest.Mocked<Db>

    storage = new TokenStorage(db)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should store a new token record', async () => {
    await storage.storeRecord('txid1', 0, 100, 'ownerKey', 'assetId')

    expect(collection.insertOne).toHaveBeenCalledWith({
      txid: 'txid1',
      outputIndex: 0,
      amount: 100,
      ownerKey: 'ownerKey',
      assetId: 'assetId',
      createdAt: expect.any(Date)
    })
  })

  it('should delete an existing token record', async () => {
    await storage.deleteRecord('txid1', 0)

    expect(collection.deleteOne).toHaveBeenCalledWith({ txid: 'txid1', outputIndex: 0 })
  })

  it('should find a token record by txid and outputIndex', async () => {
    const result = await storage.findByTxidOutputIndex('txid1', 0)

    expect(collection.find).toHaveBeenCalledWith({ txid: 'txid1', outputIndex: 0 })
    expect(collection.find().project).toHaveBeenCalledWith({ txid: 1, outputIndex: 1 })
    expect(result).toEqual([
      {
        txid: 'txid1',
        outputIndex: 0
      }
    ])
  })

  it('should find all token records', async () => {
    collection.find.mockReturnValue(createMockCursor(mockResults) as any)

    const results = await storage.findAll()

    expect(collection.find).toHaveBeenCalledWith({})
    expect(collection.find().project).toHaveBeenCalledWith({ txid: 1, outputIndex: 1 })
    expect(results).toEqual([
      { txid: 'txid1', outputIndex: 0 },
      { txid: 'txid2', outputIndex: 1 }
    ])
  })

  it('should handle no token records found', async () => {
    collection.find.mockReturnValue(createMockCursor([]) as any)

    const result = await storage.findByTxidOutputIndex('nonexistentTxid', 0)

    expect(result).toEqual([])
  })

  it('should handle storeRecord error', async () => {
    const errorMessage = 'Insert failed'
    collection.insertOne.mockRejectedValue(new Error(errorMessage))

    await expect(storage.storeRecord('txid1', 0, 100, 'ownerKey', 'assetId')).rejects.toThrow(errorMessage)
  })
})
