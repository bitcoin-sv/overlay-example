import { UHRPLookupService } from '../../src/data-integrity-services/UHRPLookupService'
import { UHRPStorage } from '../../src/data-integrity-services/UHRPStorage'
import { Script } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { getURLForHash, normalizeURL } from 'uhrp-url'
import { LookupQuestion } from '@bsv/overlay'

// Mock dependencies
jest.mock('pushdrop')
jest.mock('uhrp-url', () => ({
  getURLForHash: jest.fn(),
  normalizeURL: jest.fn(),
}))

describe('UHRPLookupService', () => {
  let storage: jest.Mocked<UHRPStorage>
  let service: UHRPLookupService

  beforeEach(() => {
    storage = {
      storeRecord: jest.fn(),
      deleteRecord: jest.fn(),
      findByUHRPUrl: jest.fn(),
      findByRetentionPeriod: jest.fn(),
    } as unknown as jest.Mocked<UHRPStorage>

    service = new UHRPLookupService(storage)
  })

  describe('outputAdded', () => {
    it('should store a record when topic is "tm_uhrp"', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const outputScript = {
        toHex: jest.fn().mockReturnValue('sampleHex'),
      } as unknown as Script
      const topic = 'tm_uhrp'
      const decodedFields = {
        fields: {
          [2]: Buffer.from('sampleURL'),
          [5]: Buffer.from('3600'),
        }
      };

      (pushdrop.decode as jest.Mock).mockReturnValue(decodedFields);
      (getURLForHash as jest.Mock).mockReturnValue('sampleURL')

      await service.outputAdded(txid, outputIndex, outputScript, topic)

      expect(pushdrop.decode).toHaveBeenCalledWith({
        script: 'sampleHex',
        fieldFormat: 'buffer',
      })
      expect(getURLForHash).toHaveBeenCalledWith(decodedFields.fields[2])
      expect(storage.storeRecord).toHaveBeenCalledWith(
        txid,
        outputIndex,
        'sampleURL',
        '3600'
      )
    })

    it('should not store a record when topic is not "tm_uhrp"', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const outputScript = {} as Script
      const topic = 'other_topic'

      await service.outputAdded(txid, outputIndex, outputScript, topic)
      expect(storage.storeRecord).not.toHaveBeenCalled()
    })

    it('should throw an error if storing record fails', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const outputScript = {
        toHex: jest.fn().mockReturnValue('sampleHex'),
      } as unknown as Script
      const topic = 'tm_uhrp'
      const decodedFields = {
        fields: {
          [2]: Buffer.from('sampleURL'),
          [5]: Buffer.from('3600'),
        }
      };

      (pushdrop.decode as jest.Mock).mockReturnValue(decodedFields);
      (getURLForHash as jest.Mock).mockReturnValue('sampleURL')
      storage.storeRecord.mockRejectedValue(new Error('Storage error'))

      await expect(service.outputAdded(txid, outputIndex, outputScript, topic))
        .rejects
        .toThrow('Storage error')
    })
  })

  describe('outputSpent', () => {
    it('should delete a record when topic is "tm_uhrp"', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const topic = 'tm_uhrp'

      await service.outputSpent(txid, outputIndex, topic)
      expect(storage.deleteRecord).toHaveBeenCalledWith(txid, outputIndex)
    })

    it('should not delete a record when topic is not "tm_uhrp"', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const topic = 'other_topic'

      await service.outputSpent(txid, outputIndex, topic)
      expect(storage.deleteRecord).not.toHaveBeenCalled()
    })
  })

  describe('outputDeleted', () => {
    it('should delete a record when topic is "tm_uhrp"', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const topic = 'tm_uhrp'

      await service.outputDeleted(txid, outputIndex, topic)
      expect(storage.deleteRecord).toHaveBeenCalledWith(txid, outputIndex)
    })

    it('should not delete a record when topic is not "tm_uhrp"', async () => {
      const txid = 'sampleTxid'
      const outputIndex = 0
      const topic = 'other_topic'

      await service.outputDeleted(txid, outputIndex, topic)
      expect(storage.deleteRecord).not.toHaveBeenCalled()
    })
  })

  describe('lookup', () => {
    it('should throw an error if query is not provided', async () => {
      const question = {
        query: undefined,
        service: 'ls_uhrp',
      } as LookupQuestion

      await expect(service.lookup(question))
        .rejects
        .toThrow('A valid query must be provided!')
    })

    it('should throw an error if service is not "ls_uhrp"', async () => {
      const question = {
        query: {},
        service: 'other_service',
      } as LookupQuestion

      await expect(service.lookup(question))
        .rejects
        .toThrow('Lookup service not supported!')
    })

    it('should return results for valid UHRPUrl', async () => {
      const question = {
        query: { UHRPUrl: 'sampleURL' },
        service: 'ls_uhrp',
      } as LookupQuestion
      const normalizedURL = 'normalizedURL'
      const expectedResult = [{ txid: 'sampleTxid', outputIndex: 0 }];

      (normalizeURL as jest.Mock).mockReturnValue(normalizedURL)
      storage.findByUHRPUrl.mockResolvedValue(expectedResult)

      const result = await service.lookup(question)

      expect(normalizeURL).toHaveBeenCalledWith('sampleURL')
      expect(storage.findByUHRPUrl).toHaveBeenCalledWith(normalizedURL)
      expect(result).toBe(expectedResult)
    })

    it('should return results for valid retentionPeriod', async () => {
      const question = {
        query: { retentionPeriod: 3600 },
        service: 'ls_uhrp',
      } as LookupQuestion
      const expectedResult = [{ txid: 'sampleTxid', outputIndex: 0 }]

      storage.findByRetentionPeriod.mockResolvedValue(expectedResult)

      const result = await service.lookup(question)

      expect(storage.findByRetentionPeriod).toHaveBeenCalledWith(3600)
      expect(result).toBe(expectedResult)
    })

    it('should throw an error if neither UHRPUrl nor retentionPeriod is provided', async () => {
      const question = {
        query: {},
        service: 'ls_uhrp',
      } as LookupQuestion

      await expect(service.lookup(question))
        .rejects
        .toThrow('Query parameters must include UHRPUrl or retentionPeriod!')
    })
  })

  // describe('getDocumentation', () => {
  // TODO: Fix unresolved errors with jest config and __dirname issues.
  // it('should return documentation content', async () => {
  //   const docContent = 'Documentation content';
  //   (getDocumentation as jest.Mock).mockResolvedValue(docContent)

  //   const result = await service.getDocumentation()

  //   expect(getDocumentation).toHaveBeenCalledWith('../../docs/UHRP/uhrp-lookup-service.md')
  //   expect(result).toBe(docContent)
  // })
  // })

  describe('getMetaData', () => {
    it('should throw an error indicating the method is not implemented', async () => {
      await expect(service.getMetaData())
        .rejects
        .toThrow('Method not implemented.')
    })
  })
})
