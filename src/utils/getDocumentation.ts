import { promises as fs } from 'fs'
import { resolve } from 'path'
/**
 * Returns documentation specific to the provided filename
 * @param {string} filePath - The path of the markdown file
 * @returns A promise that resolves to the documentation string
 */
async function getDocumentation(filePath: string): Promise<string> {
  try {
    const resolvedPath = resolve(process.cwd(), filePath)
    const data = await fs.readFile(resolvedPath, 'utf-8')
    return data
  } catch (error) {
    console.error('Error reading documentation file:', error)
    throw new Error('Failed to read documentation file')
  }
}

export { getDocumentation }
