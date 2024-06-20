import { MongoClient, Db } from 'mongodb'
import { TokenLookupService } from '../../src/token-services/TokenLookupService'
import { TokenStorage } from '../../src/token-services/TokenStorage'
import { Script } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { LookupQuestion } from '@bsv/overlay'

// Mock the dependencies
jest.mock('@bsv/sdk')
jest.mock('pushdrop')

// Mock MongoDB client
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  insertOne: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
} as Partial<Db>

const mockMongoClient = {
  db: jest.fn(() => mockDb as Db),
} as unknown as MongoClient

const DB_NAME = 'testDB'

// Mock TokenStorage methods
const mockStoreRecord = jest.fn()
const mockDeleteRecord = jest.fn()
const mockFindByTxidOutputIndex = jest.fn()
const mockFindAll = jest.fn()

jest.mock('../../src/token-services/TokenStorage', () => {
  return {
    TokenStorage: jest.fn().mockImplementation(() => {
      return {
        storeRecord: mockStoreRecord,
        deleteRecord: mockDeleteRecord,
        findByTxidOutputIndex: mockFindByTxidOutputIndex,
        findAll: mockFindAll,
      }
    }),
  }
})

describe('TokenLookupService', () => {
  let storage: TokenStorage
  let service: TokenLookupService
  const topics = ['token_topic']

  beforeEach(() => {
    storage = new TokenStorage(mockMongoClient.db(DB_NAME))
    service = new TokenLookupService(storage, topics);

    // Mock Script.fromHex to return an object with a toHex method
    (Script.fromHex as jest.Mock).mockReturnValue({
      toHex: jest.fn().mockReturnValue('76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac')
    });

    // Mock pushdrop.decode to return the expected result
    (pushdrop.decode as jest.Mock).mockReturnValue({
      fields: [
        Buffer.from('mock_assid'),
        Buffer.from('100')
      ],
      lockingPublicKey: 'mock_public_key'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockOutputScript = () => Script.fromHex('76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac')

  it('should store token fields in storage engine when output is added', async () => {
    const txid = 'test_txid'
    const outputIndex = 0
    const topic = 'token_topic'
    const outputScript = mockOutputScript()

    await service.outputAdded(txid, outputIndex, outputScript, topic)

    expect(mockStoreRecord).toHaveBeenCalledWith(
      txid,
      outputIndex,
      100,
      'mock_assid',
      'mock_public_key'
    )
  })

  it('should not store token fields if topic does not match', async () => {
    const txid = 'test_txid'
    const outputIndex = 0
    const topic = 'non_matching_topic'
    const outputScript = mockOutputScript()

    await service.outputAdded(txid, outputIndex, outputScript, topic)

    expect(mockStoreRecord).not.toHaveBeenCalled()
  })

  it('should delete the record when output is spent', async () => {
    const txid = 'test_txid'
    const outputIndex = 0
    const topic = 'token_topic'

    await service.outputSpent(txid, outputIndex, topic)

    expect(mockDeleteRecord).toHaveBeenCalledWith(txid, outputIndex)
  })

  it('should not delete the record if topic does not match when output is spent', async () => {
    const txid = 'test_txid'
    const outputIndex = 0
    const topic = 'non_matching_topic'

    await service.outputSpent(txid, outputIndex, topic)

    expect(mockDeleteRecord).not.toHaveBeenCalled()
  })

  it('should delete the record when output is deleted', async () => {
    const txid = 'test_txid'
    const outputIndex = 0
    const topic = 'token_topic'

    await service.outputDeleted(txid, outputIndex, topic)

    expect(mockDeleteRecord).toHaveBeenCalledWith(txid, outputIndex)
  })

  it('should not delete the record if topic does not match when output is deleted', async () => {
    const txid = 'test_txid'
    const outputIndex = 0
    const topic = 'non_matching_topic'

    await service.outputDeleted(txid, outputIndex, topic)

    expect(mockDeleteRecord).not.toHaveBeenCalled()
  })

  it('should return a record for a valid txid and output index query', async () => {
    const question: LookupQuestion = {
      service: 'ls_token',
      query: {
        txid: 'test_txid',
        outputIndex: 0
      }
    }

    const mockAnswer = [{ txid: 'test_txid', outputIndex: 0 }]
    mockFindByTxidOutputIndex.mockResolvedValue(mockAnswer)

    const answer = await service.lookup(question)

    expect(answer).toEqual(mockAnswer)
  })

  it('should throw an error for an invalid service in the query', async () => {
    const question: LookupQuestion = {
      service: 'invalid_service',
      query: {}
    }

    await expect(service.lookup(question)).rejects.toThrow('Lookup service not supported!')
  })

  it('should return all records for a findAll query', async () => {
    const question: LookupQuestion = {
      service: 'ls_token',
      query: {
        findAll: true
      }
    }

    const mockAnswer = [
      { txid: 'test_txid1', outputIndex: 0, amount: 100, assetId: 'mock_assid1', lockingPublicKey: 'mock_public_key1' },
      { txid: 'test_txid2', outputIndex: 1, amount: 200, assetId: 'mock_assid2', lockingPublicKey: 'mock_public_key2' }
    ]
    mockFindAll.mockResolvedValue(mockAnswer)

    const answer = await service.lookup(question)

    expect(answer).toEqual(mockAnswer)
  })

  it('should throw an error for invalid query parameters', async () => {
    const question: LookupQuestion = {
      service: 'ls_token',
      query: {}
    }

    await expect(service.lookup(question)).rejects.toThrow('Query parameters must include either a txid + outputIndex or "findAll = \'true\'".')
  })

  it('should return documentation for the service', async () => {
    const doc = await service.getDocumentation()
    expect(doc).toEqual('This is a Token lookup service.')
  })

  it('should return metadata for the service', async () => {
    const meta = await service.getMetaData()
    expect(meta).toEqual({
      name: 'TokenLookupService',
      shortDescription: 'A lookup service for token transactions.',
      iconURL: 'https://example.com/icon.png',
      version: '1.0.0',
      informationURL: 'https://example.com/info'
    })
  })
})
