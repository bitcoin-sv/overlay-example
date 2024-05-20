import express from 'express'
import bodyparser from 'body-parser'
import { Engine, KnexStorage } from '@bsv/overlay'
import { defaultChainTracker } from '@bsv/sdk'
// Populate a Knexfile with your database credentials
import Knex from 'knex'
import knexfile from '../knexfile.js'
const knex = Knex(knexfile.development)
const app = express()
app.use(bodyparser.json({ limit: '1gb', type: 'application/json' }))

const engine = new Engine.default(
    {
        // hello: new HelloTopicManager()
    },
    {
        // hello: new HelloLookupService({
        //     storageEngine: new HelloStorageEngine({
        //         knex
        //     })
        // })
    },
    new KnexStorage.default(knex),
    defaultChainTracker()
)

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

// Serve a static documentstion site, if you have one.
app.use(express.static('public'))

// List hosted topic managers and lookup services
app.get('/listTopicManagers', async (req, res) => {
    try {
        const result = await engine.listTopicManagers()
        return res.status(200).json(result)
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            // code: error.code,
            // description: error.message
        })
    }
})
app.get('/listLookupServiceProviders', async (req, res) => {
    try {
        const result = await engine.listLookupServiceProviders()
        return res.status(200).json(result)
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            // code: error.code,
            // description: error.message
        })
    }
})

// Host documentation for the services
app.get('/getDocumentationForTopicManager', async (req, res) => {
    try {
        const result = await engine.getDocumentationForTopicManger(req.query.manager)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            // code: error.code,
            // description: error.message
        })
    }
})
app.get('/getDocumentationForLookupServiceProvider', async (req, res) => {
    try {
        const result = await engine.getDocumentationForLookupServiceProvider(req.query.lookupServices)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            // code: error.code,
            // description: error.message
        })
    }
})

// Submit transactions and facilitate lookup requests
app.post('/submit', async (req, res) => {
    try {
        const result = await engine.submit(req.body)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            // code: error.code,
            // description: error.message
        })
    }
})
app.post('/lookup', async (req, res) => {
    try {
        const result = await engine.lookup(req.body)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            // code: error.code,
            // description: error.message
        })
    }
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
app.listen(8080, () => {
    console.log('BSV Overlay Services Engine is listening on port', 8080)
})
