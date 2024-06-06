import express from 'express'
import bodyparser from 'body-parser'
import { Engine, KnexStorage } from '@bsv/overlay'
import { defaultChainTracker } from '@bsv/sdk'
// Populate a Knexfile with your database credentials
import Knex from 'knex'
import knexfile from '../knexfile.js'
import { HelloWorldTopicManager } from './HelloWorldTopicManager.js'
import { HelloWorldLookupService } from './HelloWorldLookupService.js'
import { HelloWorldStorage } from './HelloWorldStorage.js'
import { MongoClient } from 'mongodb'
const knex = Knex(knexfile.development)
const app = express()
app.use(bodyparser.json({ limit: '1gb', type: 'application/json' }))

let engine: Engine
// Initialization function
const initialization = async () => {
  console.log('Starting initialization...')
  const mongoClient = new MongoClient('mongodb://localhost:27017')

  try {
    await mongoClient.connect()
    console.log('Connected to MongoDB')

    // Create a new overlay Engine configured with:
    // - a topic manger
    // - a lookup service, configured with MongoDB storage client
    // - the default Knex storage provider for the Engine
    // - the default chaintracker for merkle proof validation
    console.log('Initializing Engine...')
    try {
      engine = new Engine(
        {
          hello: new HelloWorldTopicManager()
        },
        {
          hello: new HelloWorldLookupService(
            new HelloWorldStorage(mongoClient.db('staging_helloworld_lookupService'))
          )
        },
        new KnexStorage(knex),
        defaultChainTracker()
      )
    } catch (engineError) {
      console.error('Error during Engine initialization:', engineError)
      throw engineError
    }
    console.log('Engine initialized successfully')
  } catch (error) {
    console.error('Initialization failed:', error)
    throw error
  } finally {
    await mongoClient.close()
  }
}

// This allows the API to be used everywhere when CORS is enforced
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Expose-Headers', '*')
  res.header('Access-Control-Allow-Private-Network', 'true')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Serve a static documentation site, if you have one.
app.use(express.static('public'))

// List hosted topic managers and lookup services
app.get('/listTopicManagers', (req, res) => {
  (async () => {
    try {
      const result = await engine.listTopicManagers()
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({
        status: 'error'
        // code: error.code,
        // description: error.message
      })
    }
  })().catch(() => {
    // This catch is for any unforeseen errors in the async IIFE itself
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error'
      // code: error.code,
      // description: error.message
    })
  })
})

app.get('/listLookupServiceProviders', (req, res) => {
  (async () => {
    try {
      const result = await engine.listLookupServiceProviders()
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({
        status: 'error'
        // code: error.code,
        // description: error.message
      })
    }
  })().catch(() => {
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error'
      // code: error.code,
      // description: error.message
    })
  })
})

// Host documentation for the services
app.get('/getDocumentationForTopicManager', (req, res) => {
  (async () => {
    try {
      const result = await engine.getDocumentationForTopicManager(req.query.manager)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({
        status: 'error'
        // code: error.code,
        // description: error.message
      })
    }
  })().catch(() => {
    // This catch is for any unforeseen errors in the async IIFE itself
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error'
      // code: error.code,
      // description: error.message
    })
  })
})

app.get('/getDocumentationForLookupServiceProvider', (req, res) => {
  (async () => {
    try {
      const result = await engine.getDocumentationForLookupServiceProvider(req.query.lookupServices)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({
        status: 'error'
        // code: error.code,
        // description: error.message
      })
    }
  })().catch(() => {
    // This catch is for any unforeseen errors in the async IIFE itself
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error'
      // code: error.code,
      // description: error.message
    })
  })
})

// Submit transactions and facilitate lookup requests
app.post('/submit', (req, res) => {
  (async () => {
    try {
      const result = await engine.submit(req.body)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({
        status: 'error'
        // code: error.code,
        // description: error.message
      })
    }
  })().catch(() => {
    // This catch is for any unforeseen errors in the async IIFE itself
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error'
      // code: error.code,
      // description: error.message
    })
  })
})

app.post('/lookup', (req, res) => {
  (async () => {
    try {
      const result = await engine.lookup(req.body)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(400).json({
        status: 'error'
        // code: error.code,
        // description: error.message
      })
    }
  })().catch(() => {
    // This catch is for any unforeseen errors in the async IIFE itself
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error'
      // code: error.code,
      // description: error.message
    })
  })
})

// 404, all other routes are not found.
app.use((req, res) => {
  console.log('404', req.url)
  res.status(404).json({
    status: 'error',
    code: 'ERR_ROUTE_NOT_FOUND',
    description: 'Route not found.'
  })
})

// Start your Engines!
initialization()
  .then(() => {
    app.listen(8080, () => {
      console.log(`BSV Overlay Services Engine is listening on port ${8080}`)
    })
  })
  .catch((error) => {
    console.error('Failed to initialize:', error)
    process.exit(1)
  })