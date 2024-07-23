import fs from 'fs'
import path from 'path'
import pLimit from 'p-limit'

// Note: You may need the following command to execute this code to test transaction submission performance.
// node --loader ts-node/esm/transpile-only benchmark-submission.ts

const submitBEEF = async (beef: number[], hostingURL: string): Promise<boolean> => {
  // Example robust error handling in your submitBEEF function
  try {
    const result = await fetch(`${hostingURL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Topics': JSON.stringify(['tm_helloworld'])
      },
      body: new Uint8Array(beef)
    })
    return result.ok
  } catch (error) {
    console.error('Error submitting BEEF:', error)
    return false
  }
}

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

const readBeefsFromFile = (filePath: string): number[][] => {
  const beefs: number[][] = []
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const lines = fileContent.trim().split('\n')

  for (const line of lines) {
    if (line.trim() !== '') {
      const beef = Buffer.from(line, 'base64')
      beefs.push(Array.from(beef))
    }
  }

  return beefs
}

const benchmarkSubmission = async () => {
  const hostingURL = 'http://localhost:8080' // Replace with actual hosting URL

  const filePath = path.join(process.cwd(), 'beefs.json')
  const beefs: number[][] = readBeefsFromFile(filePath)

  // Variations in chunk size and concurrency limits may alter performance gains
  const chunkSize = 100
  const beefChunks = chunkArray(beefs, chunkSize)
  const limit = pLimit(50)

  const startTime = performance.now()

  const allPromises = beefChunks.map((chunk, i) => {
    const chunkStartTime = performance.now()
    const chunkPromises = chunk.map(beef => limit(() => submitBEEF(beef, hostingURL)))
    return Promise.all(chunkPromises).then(() => {
      const chunkEndTime = performance.now()
      console.log(`chunk_${i} took ${(chunkEndTime - chunkStartTime).toFixed(3)} ms`)
    })
  })
  await Promise.all(allPromises)

  // Linear test
  // beefChunks.map((chunk, i) => {
  //   const chunkStartTime = performance.now()
  //   chunk.map(async beef => await submitBEEF(beef, hostingURL))
  //   const chunkEndTime = performance.now()
  //   console.log(`chunk_${i} took ${(chunkEndTime - chunkStartTime).toFixed(3)} ms`)
  // })

  // Single tx submission test
  // await submitBEEF(beefs[4], hostingURL)

  const endTime = performance.now()
  const totalTime = endTime - startTime

  console.log(`totalTime: ${totalTime.toFixed(3)} ms`)

  // Calculate transactions per second (tx/sec)
  const totalTransactions = beefs.length
  const txPerSec = (totalTransactions / (totalTime / 1000)).toFixed(3)

  console.log(`Transactions per second (tx/sec): ${txPerSec}`)
}


benchmarkSubmission().catch(console.error)
