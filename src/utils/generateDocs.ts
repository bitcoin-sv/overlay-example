import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'

const execPromise = promisify(exec)

interface DocConfig {
  input: string
  output: string
}

const docs: DocConfig[] = [
  {
    input: './src/helloworld-services/HelloWorldTopicManager.ts',
    output: './docs/HelloWorld/helloworld-topic-manager.md'
  },
  {
    input: './src/helloworld-services/HelloWorldLookupService.ts',
    output: './docs/HelloWorld/helloworld-lookup-service.md'
  },
  {
    input: './src/helloworld-services/HelloWorldStorage.ts',
    output: './docs/HelloWorld/helloworld-storage.md'
  },
  {
    input: './src/peer-discovery-services/SHIP/SHIPTopicManager.ts',
    output: './docs/SHIP/ship-topic-manager.md'
  },
  {
    input: './src/peer-discovery-services/SHIP/SHIPLookupService.ts',
    output: './docs/SHIP/ship-lookup-service.md'
  },
  {
    input: './src/peer-discovery-services/SHIP/SHIPStorage.ts',
    output: './docs/SHIP/ship-storage.md'
  },
  {
    input: './src/peer-discovery-services/SLAP/SLAPTopicManager.ts',
    output: './docs/SLAP/slap-topic-manager.md'
  },
  {
    input: './src/peer-discovery-services/SLAP/SLAPLookupService.ts',
    output: './docs/SLAP/slap-lookup-service.md'
  },
  {
    input: './src/peer-discovery-services/SLAP/SLAPStorage.ts',
    output: './docs/SLAP/slap-storage.md'
  },
  {
    input: './src/data-integrity-services/UHRPTopicManager.ts',
    output: './docs/UHRP/uhrp-topic-manager.md'
  },
  {
    input: './src/data-integrity-services/UHRPLookupService.ts',
    output: './docs/UHRP/uhrp-lookup-service.md'
  },
  {
    input: './src/data-integrity-services/UHRPStorage.ts',
    output: './docs/UHRP/uhrp-storage.md'
  }
]

// Helper function for generating updated documentation
const generateDocs = async () => {
  for (const doc of docs) {
    const command = `npx ts2md --inputFilename ${path.resolve(doc.input)} --outputFilename ${path.resolve(doc.output)} --firstHeadingLevel 2 --noTitle true --readmeMerge true`
    try {
      const { stdout, stderr } = await execPromise(command)
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
    } catch (error) {
      console.error(`Error generating documentation for ${doc.input}:`, error)
    }
  }
}

generateDocs().then(() => console.log('Documentation generation complete')).catch(error => console.error('Error:', error))
