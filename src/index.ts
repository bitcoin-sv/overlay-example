import dotenv from 'dotenv'
import express from 'express'
import bodyparser from 'body-parser'
import { Engine, KnexStorage, STEAK, TaggedBEEF } from '@bsv/overlay'
import { WhatsOnChain, NodejsHttpClient, ARC, ArcConfig, MerklePath, Broadcaster } from '@bsv/sdk'
import { MongoClient } from 'mongodb'
import https from 'https'
import Knex from 'knex'
import knexfile from '../knexfile.js'
import { HelloWorldTopicManager } from './helloworld-services/HelloWorldTopicManager.js'
import { HelloWorldLookupService } from './helloworld-services/HelloWorldLookupService.js'
import { HelloWorldStorage } from './helloworld-services/HelloWorldStorage.js'
import { SHIPLookupService } from './peer-discovery-services/SHIP/SHIPLookupService.js'
import { SLAPLookupService } from './peer-discovery-services/SLAP/SLAPLookupService.js'
import { SHIPStorage } from './peer-discovery-services/SHIP/SHIPStorage.js'
import { SLAPStorage } from './peer-discovery-services/SLAP/SLAPStorage.js'
import { NinjaAdvertiser } from './peer-discovery-services/NinjaAdvertiser.js'
import { SHIPTopicManager } from './peer-discovery-services/SHIP/SHIPTopicManager.js'
import { SLAPTopicManager } from './peer-discovery-services/SLAP/SLAPTopicManager.js'
import { UHRPStorage } from './data-integrity-services/UHRPStorage.js'
import { UHRPTopicManager } from './data-integrity-services/UHRPTopicManager.js'
import { UHRPLookupService } from './data-integrity-services/UHRPLookupService.js'
import { SyncConfiguration } from '@bsv/overlay/SyncConfiguration.ts'
import CombinatorialChainTracker from './CombinatorialChainTracker.js'
import { UtxoStorage } from './spend-status-services/UtxoStorage.js'
import { UtxoTopicManager } from './spend-status-services/UtxoTopicManager.js'
import { UtxoLookupService } from './spend-status-services/UtxoLookupService.js'
const knex = Knex(knexfile.development)
const app = express()
dotenv.config()
app.use(bodyparser.json({ limit: '1gb', type: 'application/json' }))
app.use(bodyparser.raw({ limit: '1gb', type: 'application/octet-stream' }))

// Load environment variables
const {
  PORT,
  DB_CONNECTION,
  NODE_ENV,
  HOSTING_DOMAIN,
  TAAL_API_KEY,
  SERVER_PRIVATE_KEY,
  DOJO_URL,
  MIGRATE_KEY
} = process.env

// Configure with custom URLs specific to your supported topics.
const knownDeployedOSN = `https://${NODE_ENV === 'production' ? '' : 'staging-'}overlay.babbage.systems`
const SLAP_TRACKERS = [knownDeployedOSN]
const SHIP_TRACKERS = [knownDeployedOSN]
const SYNC_CONFIGURATION: SyncConfiguration = {
  tm_helloworld: [knownDeployedOSN],
  tm_uhrp: false
}

// Initialization the overlay engine
let engine: Engine
let ninjaAdvertiser: NinjaAdvertiser
const initialization = async () => {
  console.log('Starting initialization...')
  try {
    const mongoClient = new MongoClient(DB_CONNECTION as string)
    await mongoClient.connect()
    const db = mongoClient.db(`${NODE_ENV as string}_overlay_lookup_services`)

    // Create a new overlay Engine configured with:
    // - a topic manager
    // - a lookup service, configured with MongoDB storage client
    // - the default Knex storage provider for the Engine
    // - the default chaintracker for merkle proof validation
    console.log('Initializing Engine...')
    try {
      // Configuration for ARC
      const arcConfig: ArcConfig = {
        deploymentId: '1',
        apiKey: TAAL_API_KEY,
        callbackUrl: `${HOSTING_DOMAIN as string}/arc-ingest`,
        callbackToken: 'fredFlinstones',
        httpClient: new NodejsHttpClient(https)
      }

      // Create storage instances
      const helloStorage = new HelloWorldStorage(db)
      const uhrpStorage = new UHRPStorage(db)
      const shipStorage = new SHIPStorage(db)
      const slapStorage = new SLAPStorage(db)
      const utxoStorage = new UtxoStorage(db)

      ninjaAdvertiser = new NinjaAdvertiser(
        SERVER_PRIVATE_KEY as string,
        DOJO_URL as string,
        HOSTING_DOMAIN as string
      )

      engine = new Engine(
        {
          tm_helloworld: new HelloWorldTopicManager(),
          tm_uhrp: new UHRPTopicManager(),
          tm_ship: new SHIPTopicManager(),
          tm_slap: new SLAPTopicManager(),
          tm_utxo: new UtxoTopicManager()
        },
        {
          ls_helloworld: new HelloWorldLookupService(helloStorage),
          ls_uhrp: new UHRPLookupService(uhrpStorage),
          ls_ship: new SHIPLookupService(shipStorage),
          ls_slap: new SLAPLookupService(slapStorage),
          ls_utxo: new UtxoLookupService(utxoStorage)
        },
        new KnexStorage(knex),
        new CombinatorialChainTracker([
          new WhatsOnChain(
            NODE_ENV === 'production' ? 'main' : 'test',
            {
              httpClient: new NodejsHttpClient(https)
            })
        ]),
        HOSTING_DOMAIN as string,
        SHIP_TRACKERS,
        SLAP_TRACKERS,
        new ARC('https://arc.taal.com', arcConfig),
        ninjaAdvertiser,
        SYNC_CONFIGURATION
      )
      ninjaAdvertiser.setLookupEngine(engine)
      console.log('Engine initialized successfully')
    } catch (engineError) {
      console.error('Error during Engine initialization:', engineError)
      throw engineError
    }
  } catch (error) {
    console.error('Initialization failed:', error)
    throw error
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

// Add this function at the top of your file, after imports
function asyncHandler(fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.log(error)
      if (!res.headersSent) {
        next(error);
      }
    });
  };
}

// Now, update your route handlers like this:

app.get('/listTopicManagers', asyncHandler(async (req, res) => {
  const result = await engine.listTopicManagers();
  res.status(200).json(result);
}));

app.get('/listLookupServiceProviders', asyncHandler(async (req, res) => {
  const result = await engine.listLookupServiceProviders();
  res.status(200).json(result);
}));

// Host documentation for the services
app.get('/getDocumentationForTopicManager', asyncHandler(async (req, res) => {
  const result = await engine.getDocumentationForTopicManager(req.query.manager);
  res.setHeader('Content-Type', 'text/markdown');
  res.status(200).send(result);
}));

app.get('/getDocumentationForLookupServiceProvider', asyncHandler(async (req, res) => {
  const result = await engine.getDocumentationForLookupServiceProvider(req.query.lookupServices);
  res.status(200).json(result);
}));

// Submit transactions and facilitate lookup requests
app.post('/submit', asyncHandler(async (req, res) => {
  const topics = JSON.parse(req.headers['x-topics'] as string);
  const taggedBEEF: TaggedBEEF = {
    beef: Array.from(req.body as number[]),
    topics
  };

  console.log({taggedBEEF});

  await engine.submit(taggedBEEF, (steak: STEAK) => {
    res.status(200).json(steak);
  });
}));

app.post('/lookup', asyncHandler(async (req, res) => {
  const result = await engine.lookup(req.body);
  res.status(200).json(result);
}));

app.post('/arc-ingest', asyncHandler(async (req, res) => {
  const merklePath = MerklePath.fromHex(req.body.merklePath);
  await engine.handleNewMerkleProof(req.body.txid, merklePath, req.body.blockHeight);
  res.status(200).json({ status: 'success', message: 'transaction status updated' });
}));

app.post('/requestSyncResponse', asyncHandler(async (req, res) => {
  const topic = req.headers['x-bsv-topic'] as string;
  const response = await engine.provideForeignSyncResponse(req.body, topic);
  res.status(200).json(response);
}));

app.post('/requestForeignGASPNode', asyncHandler(async (req, res) => {
  console.log(req.body);
  const { graphID, txid, outputIndex, metadata } = req.body;
  const response = await engine.provideForeignGASPNode(graphID, txid, outputIndex);
  res.status(200).json(response);
}));

app.post('/migrate', asyncHandler(async (req, res) => {
  if (
    typeof MIGRATE_KEY === 'string' &&
    MIGRATE_KEY.length > 10 &&
    req.body.migratekey === MIGRATE_KEY
  ) {
    const result = await knex.migrate.latest();
    res.status(200).json({
      status: 'success',
      result
    });
  } else {
    res.status(401).json({
      status: 'error',
      code: 'ERR_UNAUTHORIZED',
      description: 'Access with this key was denied.'
    });
  }
}));

// 404, all other routes are not found.
app.use((req, res) => {
  console.log('404', req.url)
  res.status(404).json({
    status: 'error',
    code: 'ERR_ROUTE_NOT_FOUND',
    description: 'Route not found.'
  })
})

// At the end of your file, add a global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'An unexpected error occurred'
    });
  }
});

// Start your Engines!
initialization()
  .then(() => {
    console.log(PORT)
    app.listen(PORT, () => {
      (async () => {
        console.log(`BSV Overlay Services Engine is listening on port ${PORT as string}`)
        // Make sure we have advertisements for all the topics / lookup services we support.
        try {
          await engine.syncAdvertisements()
        } catch (error) {
          console.error('Failed to sync advertisements:', error)
        }
        try {
          await engine.startGASPSync()
        } catch (error) {
          console.error('Failed to complete GASP sync:', error)
        }
      })().catch((error) => {
        console.error('Unexpected error occurred:', error)
      })
    })
  })
  .catch((error) => {
    console.error('Failed to initialize:', error)
    process.exit(1)
  })
