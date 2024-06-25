import { HelloWorldTopicManager } from '../../src/helloworld-services/HelloWorldTopicManager'
import { PublicKey, Signature, Transaction } from '@bsv/sdk'
import pushdrop from 'pushdrop'

// Mock dependencies
jest.mock('@bsv/sdk')
jest.mock('pushdrop')

describe('HelloWorldTopicManager', () => {
  let helloWorldTopicManager: HelloWorldTopicManager

  beforeEach(() => {
    helloWorldTopicManager = new HelloWorldTopicManager()
  })

  describe('identifyAdmissibleOutputs', () => {
    it('should correctly identify admissible outputs', async () => {
      const beef = [1, 2, 3]
      const previousCoins = [1, 2]
      const parsedTransaction = {
        outputs: [
          {
            lockingScript: {
              toHex: jest.fn().mockReturnValue('mockScriptHex')
            }
          }
        ]
      };

      (Transaction.fromBEEF as jest.Mock).mockReturnValue(parsedTransaction);

      (pushdrop.decode as jest.Mock).mockReturnValue({
        fields: [Buffer.from('Hello')],
        lockingPublicKey: 'mockPublicKey',
        signature: 'mockSignature'
      })

      const mockPubKey = {
        verify: jest.fn().mockReturnValue(true),
      };
      (PublicKey.fromString as jest.Mock).mockReturnValue(mockPubKey);
      (Signature.fromDER as jest.Mock).mockReturnValue('mockSignatureDER')

      const result = await helloWorldTopicManager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result.outputsToAdmit).toEqual([0])
      expect(result.coinsToRetain).toEqual([])
      expect(Transaction.fromBEEF).toHaveBeenCalledWith(beef)
      expect(pushdrop.decode).toHaveBeenCalledWith({
        script: 'mockScriptHex',
        fieldFormat: 'buffer'
      })
      expect(mockPubKey.verify).toHaveBeenCalledWith(
        Array.from(Buffer.concat([Buffer.from('Hello')])),
        'mockSignatureDER'
      )
    })

    it('should handle outputs with invalid signature', async () => {
      const beef = [1, 2, 3];
      const previousCoins = [1, 2];
      const parsedTransaction = {
        outputs: [
          {
            lockingScript: {
              toHex: jest.fn().mockReturnValue('mockScriptHex'),
            },
          },
        ],
      };

      (Transaction.fromBEEF as jest.Mock).mockReturnValue(parsedTransaction);

      (pushdrop.decode as jest.Mock).mockReturnValue({
        fields: [Buffer.from('Hello')],
        lockingPublicKey: 'mockPublicKey',
        signature: 'mockSignature',
      });

      const mockPubKey = {
        verify: jest.fn().mockReturnValue(false),
      };
      (PublicKey.fromString as jest.Mock).mockReturnValue(mockPubKey);
      (Signature.fromDER as jest.Mock).mockReturnValue('mockSignatureDER');

      const result = await helloWorldTopicManager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result.outputsToAdmit).toEqual([])
      expect(result.coinsToRetain).toEqual([])
    })

    it('should handle transaction parsing errors', async () => {
      const beef = [1, 2, 3];
      const previousCoins = [1, 2];

      (Transaction.fromBEEF as jest.Mock).mockImplementation(() => {
        throw new Error('Parsing error');
      });

      const result = await helloWorldTopicManager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result.outputsToAdmit).toEqual([])
      expect(result.coinsToRetain).toEqual([])
    })

    it('should handle outputs with invalid message length', async () => {
      const beef = [1, 2, 3];
      const previousCoins = [1, 2];
      const parsedTransaction = {
        outputs: [
          {
            lockingScript: {
              toHex: jest.fn().mockReturnValue('mockScriptHex'),
            },
          },
        ],
      };

      (Transaction.fromBEEF as jest.Mock).mockReturnValue(parsedTransaction);

      (pushdrop.decode as jest.Mock).mockReturnValue({
        fields: [Buffer.from('H')],
        lockingPublicKey: 'mockPublicKey',
        signature: 'mockSignature'
      })

      const result = await helloWorldTopicManager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result.outputsToAdmit).toEqual([])
      expect(result.coinsToRetain).toEqual([])
    })
  })

  describe('getMetaData', () => {
    it('should throw an error indicating the method is not implemented', async () => {
      await expect(helloWorldTopicManager.getMetaData()).rejects.toThrow('Method not implemented.')
    })
  })
})
