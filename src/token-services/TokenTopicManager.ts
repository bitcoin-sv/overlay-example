import pushdrop from 'pushdrop'
import { Transaction } from '@bsv/sdk'
import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'

/**
 * Implements a topic manager for token management
 * @public
 */
export class TokenTopicManager implements TopicManager {
  /**
   * Identifies admissible outputs from a given transaction based on previous UTXOs.
   * @param beef - The transaction data in BEEF format
   * @param previousCoins - The previous coins to consider
   * @returns {Promise<AdmittanceInstructions>} A promise that resolves with the admittance instructions
   */
  async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
    const outputsToAdmit: number[] = []
    const coinsToRetain: number[] = []

    try {
      const parsedTransaction = Transaction.fromBEEF(beef)

      // First, build an object with the assets allowed to be spent
      const maxNumberOfEachAsset: { [key: string]: { amount: number, metadata: string } } = {}
      for (const inputIndex of previousCoins) {
        const input = parsedTransaction.inputs[inputIndex]
        if (input.sourceTransaction !== undefined) {
          // Get the output from the source transaction that this transaction is consuming
          const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex]

          // Decode the locking script to get the asset details
          const decoded = pushdrop.decode({
            script: sourceOutput.lockingScript.toHex(),
            fieldFormat: 'utf8'
          })

          // Get the asset ID; if the asset is an issuance, create a unique ID
          let assetId = decoded.fields[0]
          if (assetId === 'ISSUE') {
            assetId = `${input.sourceTXID as string}.${input.sourceOutputIndex}`
          }

          // Initialize the asset data if it doesn't exist in the map
          if (maxNumberOfEachAsset[assetId] === undefined) {
            maxNumberOfEachAsset[assetId] = {
              amount: Number(decoded.fields[1]),
              metadata: decoded.fields[2]
            }
          } else {
            maxNumberOfEachAsset[assetId].amount += Number(decoded.fields[1])
          }
        }
      }

      // Track totals for each asset in the current transaction
      const assetTotals: { [key: string]: number } = {}
      for (const [i, o] of parsedTransaction.outputs.entries()) {
        try {
          const decoded = pushdrop.decode({
            script: o.lockingScript.toHex(),
            fieldFormat: 'utf8'
          })

          const assetId = decoded.fields[0]

          if (assetId === 'ISSUE') {
            outputsToAdmit.push(i)
            continue
          }

          if (assetTotals[assetId] === undefined) {
            assetTotals[assetId] = 0
          }

          assetTotals[assetId] += Number(decoded.fields[1])

          if (maxNumberOfEachAsset[assetId] === undefined || assetTotals[assetId] > maxNumberOfEachAsset[assetId].amount || maxNumberOfEachAsset[assetId].metadata !== decoded.fields[2]) {
            continue
          } else {
            outputsToAdmit.push(i)
          }
        } catch (e) {
          console.error(e)
        }
      }

      for (const inputIndex of previousCoins) {
        const input = parsedTransaction.inputs[inputIndex]
        if (input.sourceTransaction !== undefined) {
          const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex]
          const decodedPrevious = pushdrop.decode({
            script: sourceOutput.lockingScript.toHex(),
            fieldFormat: 'utf8'
          })

          let assetId = decodedPrevious.fields[0]
          if (assetId === 'ISSUE') {
            assetId = `${input.sourceTXID as string}.${input.sourceOutputIndex}`
          }

          const assetInOutputs = parsedTransaction.outputs.some((x, i) => {
            if (!outputsToAdmit.includes(i)) return false

            const decodedCurrent = pushdrop.decode({
              script: x.lockingScript.toHex(),
              fieldFormat: 'utf8'
            })

            return decodedCurrent.fields[0] === assetId
          })

          if (assetInOutputs) {
            coinsToRetain.push(input.sourceOutputIndex)
          }
        }
      }

      return {
        outputsToAdmit,
        coinsToRetain
      }
    } catch (error) {
      console.error('Error identifying admissible outputs:', error)
      return {
        outputsToAdmit: [],
        coinsToRetain: []
      }
    }
  }

  /**
   * Returns a Markdown-formatted documentation string for the topic manager.
   * @returns {Promise<string>} A promise that resolves to a documentation string.
   */
  async getDocumentation(): Promise<string> {
    return `# Tokens

    These tokens are defined by a UTXO-based protocol on top of PushDrop.

    First the asset ID is pushed, in the format <txid>.<outputIndex> (hex dot dec) or 'ISSUE" for new assets.

    Then the amount is pushed.

    Optionally, metadata is pushed. If pushed in the issuance, it must be maintained in all future outputs.

    Then the fields are dropped and the P2PK locking script follows.

    You can start a new coin by ISSUEing an amount. Then in a subsequent transaction, spend the output as an input, and include the asset ID in any outputs.

    The rule is that you cannot have outputs with amounts that total to more than the inputs you are spending from, for any given asset.

    The number of satoshis in each output must be at least 1, but beyond that it is not considered.`
  }

  /**
  * Returns a metadata object that can be used to identify the topic manager.
  * @returns {Promise<object>} A promise that resolves to a metadata object containing the name, short description,
  *          and optional properties such as icon URL, version, and information URL.
  */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'TokenTopicManager',
      shortDescription: 'A topic manager for token transactions.',
      iconURL: 'https://example.com/icon.png',
      version: '1.0.0',
      informationURL: 'https://example.com/info'
    }
  }
}
