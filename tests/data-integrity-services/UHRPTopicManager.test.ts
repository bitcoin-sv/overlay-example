import { PublicKey, Signature, Transaction } from '@bsv/sdk'
import pushdrop from 'pushdrop'
import { UHRPTopicManager } from '../../src/data-integrity-services/UHRPTopicManager'

jest.mock('pushdrop')
jest.mock('@bsv/sdk', () => ({
  PublicKey: {
    fromString: jest.fn()
  },
  Signature: {
    fromDER: jest.fn()
  },
  Transaction: {
    fromBEEF: jest.fn()
  }
}))

describe('UHRPTopicManager', () => {
  let manager: UHRPTopicManager

  beforeEach(() => {
    manager = new UHRPTopicManager()
  })

  describe('identifyAdmissibleOutputs', () => {
    it('should correctly identify admissible outputs for valid transaction outputs', async () => {
      const beef: number[] = [1, 2, 3, 4] // mocked BEEF data
      const previousCoins: number[] = []
      const parsedTransaction = {
        outputs: [
          {
            lockingScript: {
              toHex: jest.fn().mockReturnValue('sampleHex')
            }
          }
        ]
      }
      const decodedFields = {
        fields: [
          Buffer.from('1UHRPYnMHPuQ5Tgb3AF8JXqwKkmZVy5hG', 'utf8'), // Protocol address
          Buffer.from('sampleAddress', 'utf8'), // Address
          Buffer.from('a'.repeat(64), 'hex'), // Valid hash
          Buffer.from('advertise', 'utf8'), // Valid operation
          Buffer.from('https://example.com', 'utf8'), // Valid URL
          Buffer.from('1610000000', 'utf8'), // Valid timestamp
          Buffer.from('100', 'utf8') // Valid content length
        ]
      }
      const publicKey = {
        verify: jest.fn().mockReturnValue(true)
      };
      (Transaction.fromBEEF as jest.Mock).mockReturnValue(parsedTransaction);
      (pushdrop.decode as jest.Mock).mockReturnValue(decodedFields);
      (PublicKey.fromString as jest.Mock).mockReturnValue(publicKey);
      (Signature.fromDER as jest.Mock).mockReturnValue('mockedSignature')

      const result = await manager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result.outputsToAdmit).toEqual([0])
      expect(result.coinsToRetain).toEqual([])
    })

    it('should skip outputs with invalid protocol address', async () => {
      const beef: number[] = [1, 2, 3, 4] // mocked BEEF data
      const previousCoins: number[] = []
      const parsedTransaction = {
        outputs: [
          {
            lockingScript: {
              toHex: jest.fn().mockReturnValue('sampleHex')
            }
          }
        ]
      }
      const decodedFields = {
        fields: [
          Buffer.from('invalidProtocolAddress', 'utf8'), // Invalid protocol address
          Buffer.from('sampleAddress', 'utf8'), // Address
          Buffer.from('a'.repeat(64), 'hex'), // Valid hash
          Buffer.from('advertise', 'utf8'), // Valid operation
          Buffer.from('https://example.com', 'utf8'), // Valid URL
          Buffer.from('1610000000', 'utf8'), // Valid timestamp
          Buffer.from('100', 'utf8') // Valid content length
        ]
      };
      (Transaction.fromBEEF as jest.Mock).mockReturnValue(parsedTransaction);
      (pushdrop.decode as jest.Mock).mockReturnValue(decodedFields)

      const result = await manager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result.outputsToAdmit).toEqual([])
      expect(result.coinsToRetain).toEqual([])
    })

    it('should not admit outputs with invalid signature', async () => {
      const beef: number[] = [1, 2, 3, 4]
      const previousCoins: number[] = []
      const parsedTransaction = {
        outputs: [
          {
            lockingScript: {
              toHex: jest.fn().mockReturnValue('sampleHex')
            }
          }
        ]
      }
      const decodedFields = {
        fields: [
          Buffer.from('1UHRPYnMHPuQ5Tgb3AF8JXqwKkmZVy5hG', 'utf8'), // Protocol address
          Buffer.from('sampleAddress', 'utf8'), // Address
          Buffer.from('a'.repeat(64), 'hex'), // Valid hash
          Buffer.from('advertise', 'utf8'), // Valid operation
          Buffer.from('https://example.com', 'utf8'), // Valid URL
          Buffer.from('1610000000', 'utf8'), // Valid timestamp
          Buffer.from('100', 'utf8') // Valid content length
        ]
      }
      // Mock signature verification that false
      const publicKey = {
        verify: jest.fn().mockReturnValue(false)
      };
      (Transaction.fromBEEF as jest.Mock).mockReturnValue(parsedTransaction);
      (pushdrop.decode as jest.Mock).mockReturnValue(decodedFields);
      (PublicKey.fromString as jest.Mock).mockReturnValue(publicKey);
      (Signature.fromDER as jest.Mock).mockReturnValue('mockedSignature')

      const result = await manager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result.outputsToAdmit).toEqual([])
      expect(result.coinsToRetain).toEqual([])
    })

    it('should handle errors in decoding transaction outputs', async () => {
      const beef: number[] = [1, 2, 3, 4]
      const previousCoins: number[] = []
      const parsedTransaction = {
        outputs: [
          {
            lockingScript: {
              toHex: jest.fn().mockReturnValue('sampleHex')
            }
          }
        ]
      };
      (Transaction.fromBEEF as jest.Mock).mockReturnValue(parsedTransaction);
      (pushdrop.decode as jest.Mock).mockImplementation(() => {
        throw new Error('Decoding error')
      })

      const result = await manager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result.outputsToAdmit).toEqual([])
      expect(result.coinsToRetain).toEqual([])
    })

    it('should handle errors in transaction processing', async () => {
      const beef: number[] = [1, 2, 3, 4]
      const previousCoins: number[] = [];
      (Transaction.fromBEEF as jest.Mock).mockImplementation(() => {
        throw new Error('Transaction processing error')
      })

      console.error = jest.fn()
      const result = await manager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(console.error).toHaveBeenCalledWith('Error identifying admissible outputs:', new Error('Transaction processing error'))
      expect(result.outputsToAdmit).toEqual([])
      expect(result.coinsToRetain).toEqual([])
    })
  })

  // TODO: Fix issues with jest __dirname resolution.
  // describe('getDocumentation', () => {
  // it('should return documentation content', async () => {
  //   const docContent = 'Documentation content';
  //   (getDocumentation as jest.Mock).mockResolvedValue(docContent)

  //   const result = await manager.getDocumentation()

  //   expect(getDocumentation).toHaveBeenCalledWith('../../docs/UHRP/uhrp-lookup-service.md')
  //   expect(result).toBe(docContent)
  // })
  // })

  describe('getMetaData', () => {
    it('should throw an error indicating the method is not implemented', async () => {
      await expect(manager.getMetaData()).rejects.toThrow('Method not implemented.')
    })
  })
})
