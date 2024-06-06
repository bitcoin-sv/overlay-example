import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { PublicKey, Signature, Transaction, } from '@bsv/sdk'
import pushdrop from 'pushdrop'

export class HelloWorldTopicManager implements TopicManager {
  /**
   * Identify if the outputs are admissible depending on the particular protocol requirements
   * @param beef - The transaction data in BEEF format
   * @param previousCoins - The previous coins to consider
   * @returns A promise that resolves with the admittance instructions
   */
  async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
    const outputsToAdmit: number[] = []
    try {
      const parsedTransaction = Transaction.fromBEEF(beef)

      // Try to decode and validate transaction outputs
      for (const [i, output] of parsedTransaction.outputs.entries()) {
        try {
          const result = pushdrop.decode({
            script: output.lockingScript.toHex(),
            fieldFormat: 'buffer'
          })

          // Validate expected data according to the HelloWorld protocol
          // 1. Must have 1 field
          // 2. Must have a message greater than 2 characters
          if (result.fields.length !== 1) continue

          const helloWorldMessage = result.fields[0].toString('utf8')
          if (helloWorldMessage.length < 2) continue

          // Verify the signature
          const pubKey = new PublicKey(result.lockingPublicKey)
          const hasValidSignature = pubKey.verify(
            Array.from(Buffer.concat(result.fields)),
            Signature.fromDER(result.signature)
          )

          if (!hasValidSignature) throw new Error('Invalid signature!')
          outputsToAdmit.push(i)
        } catch (error) {
          console.error('Error processing output:', error)
          // Continue processing other outputs
        }
      }
      if (outputsToAdmit.length === 0) {
        console.warn('No outputs admitted!')
        // throw new ERR_BAD_REQUEST('No outputs admitted!')
      }
    } catch (error) {
      console.error('Error identifying admissible outputs:', error)
    }

    return {
      outputsToAdmit,
      coinsToRetain: []
    }
  }

  /**
   * Get the documentation associated with this topic manager
   * @returns A promise that resolves to a string containing the documentation
   */
  async getDocumentation(): Promise<string> {
    return 'This is a HelloWorld topic manager!'
  }

  /**
   * Get metadata about the topic manager
   * @returns A promise that resolves to an object containing metadata
   * @throws An error indicating the method is not implemented
   */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    throw new Error('Method not implemented.')
  }
}
