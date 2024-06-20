# Overlay Example

This repository contains an example deployment of the BSV Overlay Services Engine. It demonstrates a basic configuration that can be modified, extended, and customized to fit various use cases.

## Overview

The Overlay Services Engine enables dynamic tracking and management of UTXO-based systems on top of the BSV blockchain. This example project includes:

- Usage of the Overlay Services Engine for transaction processing.
- A basic HelloWorld Topic Manager and Lookup Service to track/query all submitted transactions.
- A Node HTTP server with Express, wrapping the Engine with an HTTP API.
- Utilization of Knex and the default Overlay Services Knex Storage Engine for database management.
- A basic Knexfile configured for use with a local MySQL database for easy testing and customization.
- Endpoints for transaction submission, lookup, and metadata about the various hosted Overlay Services.
- Service-specific documentation to guide users on interacting with the system.
- A simple setup for local development and maximum customizability.
- Adherence to BRC standards for endpoint interoperability and synchronization with other hosts.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js
- MySQL
- MongoDB

Make sure MySQL and MongoDB are running as services on your machine, or on a remote server you have access to.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bitcoin-sv/overlay-example.git
   cd overlay-example

2. Install dependencies:

```bash
npm install
```

3. Configure a local .env file with the following variables as needed:

```
PORT=8080
NODE_ENV='development'
HOSTING_DOMAIN="http://localhost:8080"
SERVER_PRIVATE_KEY='your_private_key'
MIGRATE_KEY="your_migration_key"
DB_CONNECTION='your_mongodb_connection_string'
DB_NAME='staging_helloworld_lookupService'
TAAL_API_KEY='example_key_xyz'
```

4. Start your MySQL instance, and create a new database/user
```
-- Log in to your MySQL server
mysql -u root -p

-- Create a new database
CREATE DATABASE overlay;

-- Create a new user and grant all privileges on the new database
CREATE USER 'overlayAdmin'@'localhost' IDENTIFIED BY 'overlay123';
GRANT ALL PRIVILEGES ON overlay.* TO 'overlayAdmin'@'localhost';

-- Apply the privilege changes
FLUSH PRIVILEGES;
```

5. Run the database migrations

`npm run migrate`

6. Start your MongoDB instance and ensure your connection string works.
7. Start the local Express server:
`npm run start`

8. Ensure you have the stageline MetaNet Client running, which is required for this example.

You should now be ready to run the integration tests and start developing with the Overlay Services Engine.

## Example Usage

Here are some examples of how to interact with the Hello World Overlay Service:

```ts
// Example Lookup Query using the Fetch API
const result = await fetch('http://localhost:8080/lookup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    service: 'HelloWorld',
    query: 'message123'
  })
})
```

```ts
// Example transaction submission to the HelloWorld overlay service
const result = await fetch('http://localhost:8080/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream',
    'X-Topics': JSON.stringify(['HelloWorld'])
  },
  body: new Uint8Array(beef)
})
return await result.json()
```

## API Endpoints

The following API endpoints are available for interacting with the Hello World Overlay Service:

### POST /submit
Submit a Bitcoin transaction for tracking.

- Headers:
  - `x-topics` - JSON array of topics related to the transaction.
- Body: Raw transaction data in octet-stream format.
- Response: JSON object with the result of the submission.

### POST /lookup
Interact with an overlay lookup service to retrieve specific data.

- Body: JSON object containing the lookup query.
- Response: JSON object with the lookup results.

### GET /listTopicManagers
List all hosted topic managers.
- Response: JSON array of topic managers.

###  GET /listLookupServiceProviders
List all lookup service providers.
- Response: JSON array of lookup service providers.

###  GET /getDocumentationForTopicManager
Retrieve documentation for a specified topic manager.

- Query Parameters:
  - `manager` - Name of the topic manager.
- Response: JSON object with the documentation.

### GET /getDocumentationForLookupServiceProvider
Retrieve documentation for a specified lookup service provider.

- Query Parameters:
  - `lookupServices` - Name of the lookup service provider.
- Response: JSON object with the documentation.
### POST /arc-ingest
Handle new Merkle proof ingestion.

- Body: JSON object containing `txid` and `merklePath`.
- Response: Status code indicating the result of the operation.

## Customization

Fork and modify this repository to suit your needs. You can:

- Write custom topic managers.
- Install lookup services.
- Create new API endpoints.
- Deploy or containerize your server.

#### This project follows BRC standards for endpoint interoperability and synchronization:
- BRC 0022
- BRC 0023
- BRC 0024
- BRC 0025

## License

This repository is licensed under the Open BSV License.