import { promises as fs } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Returns documentation specific to the provided filename
 * @param {string} filename - The name of the markdown file
 * @returns A promise that resolves to the documentation string
 */
async function getDocumentation(filename: string): Promise<string> {
  const filePath = join(__dirname, filename)
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return data
  } catch (error) {
    console.error('Error reading documentation file:', error)
    throw new Error('Failed to read documentation file')
  }
}

export { getDocumentation }
