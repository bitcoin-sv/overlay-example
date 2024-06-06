import { Engine, KnexStorage } from "@bsv/overlay";
import { HelloWorldTopicManager } from '../src/HelloWorldTopicManager.js';
import { HelloWorldLookupService } from '../src/HelloWorldLookupService.js';
import { HelloWorldStorage } from '../src/HelloWorldStorage.js';
import { MongoClient } from "mongodb";
import { defaultChainTracker } from "@bsv/sdk";
import Knex from 'knex';
import knexfile from '../knexfile.js';

const knex = Knex(knexfile.development);
knex.migrate.latest()
const initialization = async () => {
  console.log('Starting initialization...');
  const mongoClient = new MongoClient('mongodb://localhost:27017');

  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB');

    // Log the imported values
    console.log('Engine:', Engine);
    console.log('HelloWorldTopicManager:', HelloWorldTopicManager);
    console.log('HelloWorldLookupService:', HelloWorldLookupService);
    console.log('HelloWorldStorage:', HelloWorldStorage);
    console.log('KnexStorage:', KnexStorage);

    // Validate HelloWorldTopicManager initialization
    console.log('Initializing HelloWorldTopicManager...');
    const helloWorldTopicManager = new HelloWorldTopicManager();
    console.log('HelloWorldTopicManager initialized:', helloWorldTopicManager);

    console.log('Initializing HelloWorldLookupService...');
    const helloWorldLookupService = new HelloWorldLookupService(
      new HelloWorldStorage(mongoClient.db('staging_helloworld_lookupService'))
    );
    console.log('HelloWorldLookupService initialized:', helloWorldLookupService);

    console.log('Initializing KnexStorage...');
    const knexStorage = new KnexStorage(knex);
    console.log('KnexStorage initialized:', knexStorage);

    // Create a new overlay Engine
    console.log('Initializing Engine...');
    const engine = new Engine(
      {
        hello: helloWorldTopicManager
      },
      {
        hello: helloWorldLookupService
      },
      knexStorage,
      defaultChainTracker()
    );
    console.log('Engine initialized successfully:', engine);
  } catch (error) {
    console.error('Initialization failed:', error);
    throw error;
  } finally {
    await mongoClient.close();
    console.log('MongoDB connection closed');
  }
};

initialization().catch((error) => {
  console.error('Uncaught error during initialization:', error);
  process.exit(1); // Optionally exit the process with an error code
});
