import { HelloWorldLookupService } from '../../src/helloworld-services/HelloWorldLookupService'
import { HelloWorldStorage } from '../../src/helloworld-services/HelloWorldStorage'
import { LookupQuestion } from '@bsv/overlay'
import { MongoClient, Db } from 'mongodb'


// Mock MongoDB client
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
} as Partial<Db>

const mockMongoClient = {
  db: jest.fn(() => mockDb as Db),
} as unknown as MongoClient

const DB_NAME = 'testDB'

// Mock HelloWorldStorage methods
const mockDeleteRecord = jest.fn()
const mockFindByMessage = jest.fn()

jest.mock('../../src/helloworld-services/HelloWorldStorage', () => {
  return {
    HelloWorldStorage: jest.fn().mockImplementation(() => {
      return {
        deleteRecord: mockDeleteRecord,
        findByMessage: mockFindByMessage,
      }
    }),
  }
})

describe('HelloWorldLookupService', () => {
  let storage: HelloWorldStorage
  let service: HelloWorldLookupService

  beforeEach(() => {
    storage = new HelloWorldStorage(mockMongoClient.db(DB_NAME))
    service = new HelloWorldLookupService(storage)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('outputSpent', () => {
    it('should delete the record if topic is "tm_helloworld"', async () => {
      await service.outputSpent?.('txid1', 0, 'tm_helloworld')
      expect(mockDeleteRecord).toHaveBeenCalledWith('txid1', 0)
    })

    it('should not delete the record if topic is not "tm_helloworld"', async () => {
      await service.outputSpent?.('txid1', 0, 'OtherTopic')
      expect(mockDeleteRecord).not.toHaveBeenCalled()
    })
  })

  describe('outputDeleted', () => {
    it('should delete the record if topic is "tm_helloworld"', async () => {
      await service.outputDeleted?.('txid2', 1, 'tm_helloworld')
      expect(mockDeleteRecord).toHaveBeenCalledWith('txid2', 1)
    })

    it('should not delete the record if topic is not "tm_helloworld"', async () => {
      await service.outputDeleted?.('txid2', 1, 'OtherTopic')
      expect(mockDeleteRecord).not.toHaveBeenCalled()
    })
  })

  describe('lookup', () => {
    it('should throw an error if query is undefined or null', async () => {
      await expect(service.lookup({ query: undefined } as LookupQuestion)).rejects.toThrow('A valid query must be provided!')
      await expect(service.lookup({ query: null } as LookupQuestion)).rejects.toThrow('A valid query must be provided!')
    })

    it('should return the result of findByMessage', async () => {
      mockFindByMessage.mockResolvedValue('result')
      await expect(service.lookup({ query: 'message', service: 'ls_helloworld' } as LookupQuestion)).resolves.toEqual('result')
      expect(mockFindByMessage).toHaveBeenCalledWith('message')
    })
  })

  describe('getMetaData', () => {
    it('should throw an error indicating the method is not implemented', async () => {
      await expect(service.getMetaData()).rejects.toThrow('Method not implemented.')
    })
  })
})