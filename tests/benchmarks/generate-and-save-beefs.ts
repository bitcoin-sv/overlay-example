import pushdrop from 'pushdrop'
import { toBEEFfromEnvelope } from '@babbage/sdk-ts'
import { Ninja } from 'ninja-base'
import fs from 'fs'
import path from 'path'

const TEST_PRIVATE_KEY = 'your-private-key-here'
// Add a funded key here to generate your own transaction data.
const ninja = new Ninja({
  privateKey: TEST_PRIVATE_KEY,
  config: {
    dojoURL: 'https://dojo.babbage.systems'
  }
})

// Creates a 1 sat token compliant with the HelloWorld TopicManager
const createHelloWorldToken = async (createTask: string) => {
  const bitcoinOutputScript = await pushdrop.create({
    fields: [
      Buffer.from(createTask)
    ],
    key: TEST_PRIVATE_KEY
  })

  const tx = await ninja.getTransactionWithOutputs({
    outputs: [{
      satoshis: 1,
      script: bitcoinOutputScript,
      description: 'New HelloWorld item'
    }],
    note: 'Create a HelloWorld token',
    autoProcess: true
  })

  const beef = toBEEFfromEnvelope({
    rawTx: tx.rawTx as string,
    inputs: tx.inputs,
    txid: tx.txid
  }).beef

  return beef
}

// Generates HelloWorld 1 sat transactions and saves the BEEF data
const generateAndSaveBEEFs = async () => {
  const createTask = 'benchmarkToken'
  const filePath = path.join(process.cwd(), 'beefs.json')

  // Initialize or read existing BEEFs from file
  let existingBeefs: string[] = []
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    existingBeefs = fileContent.trim().split('\n')
  }

  for (let i = existingBeefs.length; i <= 100; i++) {
    try {
      const beef = await createHelloWorldToken(`${createTask}_${i}`)

      // Convert beef data to base64 and append to file
      const beefBase64 = Buffer.from(beef).toString('base64')
      fs.appendFileSync(filePath, `${beefBase64}\n`)
      console.log(`Saved ${i + 1} BEEFs to ${filePath}`)
    } catch (error) {
      console.error(`Failed to create token ${createTask}_${i}:`, error)
    }
  }
}

generateAndSaveBEEFs().catch(console.error)
