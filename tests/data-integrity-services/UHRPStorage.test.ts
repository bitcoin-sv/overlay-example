import { Db, Collection } from 'mongodb'
import { UHRPStorage } from '../../src/data-integrity-services/UHRPStorage'
import { UHRPRecord } from '../../src/types'

describe('UHRPStorage', () => {
  let db: jest.Mocked<Db>
  let collection: jest.Mocked<Collection<UHRPRecord>>
  let storage: UHRPStorage

  beforeEach(() => {
    collection = {
      insertOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
      project: jest.fn(),
      toArray: jest.fn(),
    } as unknown as jest.Mocked<Collection<UHRPRecord>>

    db = {
      collection: jest.fn().mockReturnValue(collection),
    } as unknown as jest.Mocked<Db>

    storage = new UHRPStorage(db)
  })

  describe('storeRecord', () => {
    it('should store a new record successfully', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const uhrpURL = 'sampleURL'
      const retentionPeriod = 3600

      await storage.storeRecord(txid, outputIndex, uhrpURL, retentionPeriod)

      expect(collection.insertOne).toHaveBeenCalledWith({
        txid,
        outputIndex,
        uhrpURL,
        retentionPeriod,
        createdAt: expect.any(Date),
      })
    })

    it('should throw an error if storing the record fails', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const uhrpURL = 'sampleURL'
      const retentionPeriod = 3600
      collection.insertOne.mockRejectedValue(new Error('Insert failed'))

      await expect(storage.storeRecord(txid, outputIndex, uhrpURL, retentionPeriod)).rejects.toThrow('Insert failed')
    })
  })

  describe('deleteRecord', () => {
    it('should delete a record successfully', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0

      await storage.deleteRecord(txid, outputIndex)

      expect(collection.deleteOne).toHaveBeenCalledWith({ txid, outputIndex })
    })

    it('should throw an error if deleting the record fails', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      collection.deleteOne.mockRejectedValue(new Error('Delete failed'))

      await expect(storage.deleteRecord(txid, outputIndex)).rejects.toThrow('Delete failed')
    })
  })

  describe('findByUHRPUrl', () => {
    it('should return matching records for a valid URL', async () => {
      const uhrpURL = 'sampleURL'
      const results = [{ txid: 'sampleTxid', outputIndex: 0 }]
      collection.find.mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(results),
        }),
      } as any)

      const result = await storage.findByUHRPUrl(uhrpURL)

      expect(collection.find).toHaveBeenCalledWith({ uhrpURL })
      expect(result).toEqual(results)
    })

    it('should return an empty array if no matching records are found', async () => {
      const uhrpURL = 'sampleURL'
      collection.find.mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      } as any)

      const result = await storage.findByUHRPUrl(uhrpURL)

      expect(collection.find).toHaveBeenCalledWith({ uhrpURL })
      expect(result).toEqual([])
    })

    it('should return an empty array for an invalid URL', async () => {
      const uhrpURL = '   '
      const result = await storage.findByUHRPUrl(uhrpURL)

      expect(collection.find).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should throw an error if finding the records fails', async () => {
      const uhrpURL = 'sampleURL'
      collection.find.mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('Find failed')),
        }),
      } as any)

      await expect(storage.findByUHRPUrl(uhrpURL)).rejects.toThrow('Find failed')
    })
  })

  describe('findByRetentionPeriod', () => {
    it('should return matching records for a valid retention period', async () => {
      const retentionPeriod = 3600
      const results = [{ txid: 'sampleTxid', outputIndex: 0 }]
      collection.find.mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(results),
        }),
      } as any)

      const result = await storage.findByRetentionPeriod(retentionPeriod)

      expect(collection.find).toHaveBeenCalledWith({ retentionPeriod })
      expect(result).toEqual(results)
    })

    it('should throw an error for a negative retention period', async () => {
      const retentionPeriod = -1
      await expect(storage.findByRetentionPeriod(retentionPeriod)).rejects.toThrow('Invalid retention period. It must be a non-negative number.')
    })

    it('should throw an error if finding the records fails', async () => {
      const retentionPeriod = 3600
      collection.find.mockReturnValue({
        project: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('Find failed')),
        }),
      } as any)

      await expect(storage.findByRetentionPeriod(retentionPeriod)).rejects.toThrow('Find failed')
    })
  })
})
