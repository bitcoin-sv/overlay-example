import { PublicKey, Transaction } from '@bsv/sdk'
import { HelloWorldTopicManager } from '../src/helloworld-services/HelloWorldTopicManager'

jest.mock('@bsv/sdk', () => ({
  PublicKey: jest.fn().mockImplementation(() => ({
    verify: jest.fn().mockReturnValue(true)
  })),
  Signature: {
    fromDER: jest.fn().mockImplementation(() => ({}))
  },
  Transaction: {
    fromBEEF: jest.fn().mockImplementation(() => ({
      outputs: [
        {
          lockingScript: {
            toHex: jest.fn().mockReturnValue('mockedHexScript')
          }
        }
      ]
    }))
  }
}))

jest.mock('pushdrop', () => ({
  decode: jest.fn().mockImplementation(() => ({
    fields: [Buffer.from('Hello')],
    lockingPublicKey: 'mockedPublicKey',
    signature: 'mockedSignature'
  }))
}))

describe('HelloWorldTopicManager', () => {
  let topicManager: HelloWorldTopicManager

  beforeEach(() => {
    topicManager = new HelloWorldTopicManager()
  })

  describe('identifyAdmissibleOutputs', () => {
    it('should return admittance instructions with admitted outputs', async () => {
      const beef = [1, 2, 3]
      const previousCoins = [1, 2, 3]

      const result = await topicManager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result).toEqual({
        outputsToAdmit: [0],
        coinsToRetain: []
      })
    })

    it('should handle errors and return empty admittance instructions', async () => {
      (Transaction.fromBEEF as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Mocked Error')
      })

      const beef = [1, 2, 3]
      const previousCoins = [1, 2, 3]

      const result = await topicManager.identifyAdmissibleOutputs(beef, previousCoins)

      expect(result).toEqual({
        outputsToAdmit: [],
        coinsToRetain: []
      })
    })

    it('should log an error if the signature is invalid', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockVerify = jest.fn().mockReturnValue(false)
        // eslint-disable-next-line no-unexpected-multiline
        (PublicKey as unknown as jest.Mock).mockImplementation(() => ({
          verify: mockVerify
        }))

      const beef = [1, 2, 3]
      const previousCoins = [1, 2, 3]

      await topicManager.identifyAdmissibleOutputs(beef, previousCoins)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing output:', new Error('Invalid signature!'))
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getDocumentation', () => {
    it('should return the documentation string', async () => {
      const result = await topicManager.getDocumentation()
      expect(result).toBe('This is a HelloWorld topic manager!')
    })
  })

  describe('getMetaData', () => {
    it('should throw an error indicating the method is not implemented', async () => {
      await expect(topicManager.getMetaData()).rejects.toThrow('Method not implemented.')
    })
  })
})
