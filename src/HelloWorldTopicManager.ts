import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { ECDSA, Hash, PublicKey, Signature, Transaction } from '@bsv/sdk'
import pushdrop from 'pushdrop'

export class HelloWorldTopicManager implements TopicManager {
  /**
   * Identify if the outputs are admissible depending on the particular protocol requirements
   * @param beef
   * @param previousCoins
   */
  async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
    try {
      const outputsToAdmit: number[] = []
      const parsedTransaction = Transaction.fromBEEF(beef)

      // Try to decode and validate transaction outputs
      for (const [i, output] of parsedTransaction.outputs.entries()) {
        // Decode the HelloWorld fields
        try {
          const result = pushdrop.decode({
            script: output.lockingScript.toHex(),
            fieldFormat: 'buffer'
          })

          // TODO: Validate expected data according to the HelloWorld protocol
          const data = result.fields[0]

          // const sha256Hasher = new Hash.SHA256()
          // sha256Hasher.update(Array.from(Buffer.concat(result.fields)))
          // const hashedMessage = sha256Hasher.digestHex()

          // const hasValidSignature = ECDSA.verify(
          //   hashedMessage,
          //   new Signature.fromDER(result.signature),
          //   new PublicKey(result.lockingPublicKey)
          // )

          // Use ECDSA to verify signature
          // if (!hasValidSignature) throw new Error('Invalid signature!')
          outputsToAdmit.push(i)
        } catch (error) {
          console.error(error)
          // Probably not a PushDrop token so do nothing
          // console.log(error)
        }
      }
      if (outputsToAdmit.length === 0) {
        // throw new ERR_BAD_REQUEST('No outputs admitted!')
      }

      // Returns an array of vouts admitted
      // And previousOutputsRetained (none by default)
      return {
        outputsToAdmit,
        coinsToRetain: []
      }
    } catch (error) {
      console.error(error)
      return {
        outputsToAdmit: [],
        coinsToRetain: []
      }
    }
  }

  // Returns the documentation associated with this topic manager
  async getDocumentation(): Promise<string> {
    return 'This is a HelloWorld topic manager!'
  }

  /**
   * Get information about stuff
   */
  async getMetaData(): Promise<{ name: string; shortDescription: string; iconURL?: string | undefined; version?: string | undefined; informationURL?: string | undefined; }> {
    throw new Error('Method not implemented.')
  }
}
