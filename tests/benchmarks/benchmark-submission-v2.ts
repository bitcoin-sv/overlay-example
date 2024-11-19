import fs from 'fs'
import path from 'path'
import pLimit from 'p-limit'
import { Pool } from 'undici' // High-performance HTTP client

const submitBEEF = async (beef: Buffer, pool: Pool): Promise<boolean> => {
  try {
    const { statusCode } = await pool.request({
      path: '/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Topics': JSON.stringify(['tm_helloworld']),
      },
      body: beef,
    })

    if (statusCode >= 200 && statusCode < 300) {
      console.log('Successfully submitted BEEF with status code:', statusCode)
      return true
    } else {
      console.warn('Failed to submit BEEF with status code:', statusCode)
      return false
    }
  } catch (error) {
    console.error('Error submitting BEEF:', error)
    return false
  }
}

const readBeefsFromFile = (filePath: string): Buffer[] => {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const lines = fileContent.trim().split('\n')
  return lines
    .filter(line => line.trim() !== '')
    .map(line => Buffer.from(line, 'base64'))
}

const benchmarkSubmission = async () => {
  // The overlay service node you want to submit transactions to
  const hostingURL = 'http://localhost:8080'

  const filePath = path.join(process.cwd(), 'beefs.json')
  const beefs: Buffer[] = readBeefsFromFile(filePath)

  // Adjust concurrency limit based on testing and system capabilities
  const concurrencyLimit = 50
  const limit = pLimit(concurrencyLimit)

  // Use a connection pool for efficient HTTP requests
  const pool = new Pool(hostingURL, {
    connections: concurrencyLimit,
    pipelining: 1,
    keepAliveTimeout: 60000,
    keepAliveMaxTimeout: 90000,
  })

  const startTime = performance.now()

  const results = await Promise.all(
    beefs.map(beef =>
      limit(async () => {
        let success = await submitBEEF(beef, pool)
        // Implement retry logic if needed
        let retries = 0
        while (!success && retries < 3) {
          retries++
          await new Promise(resolve => setTimeout(resolve, retries * 1000)) // Exponential backoff
          success = await submitBEEF(beef, pool)
        }
        return success
      })
    )
  )

  const endTime = performance.now()
  const totalTime = endTime - startTime

  console.log(`Total time: ${totalTime.toFixed(3)} ms`)

  // Calculate transactions per second (tx/sec)
  const totalTransactions = beefs.length
  const successfulTransactions = results.filter(result => result).length
  const txPerSec = (successfulTransactions / (totalTime / 1000)).toFixed(3)

  console.log(`Transactions per second (tx/sec): ${txPerSec}`)
  console.log(`Successful transactions: ${successfulTransactions}/${totalTransactions}`)

  // Clean up the connection pool
  await pool.close()
}

benchmarkSubmission().catch(console.error)
