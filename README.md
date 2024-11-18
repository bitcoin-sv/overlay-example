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

## Benchmarks
The system performance was benchmarked using the test files located under tests/benchmarks. The beefs.json file contains the transaction data for 1000 HelloWorld tokens that can be submitted into the overlay.

Additionally, there is a function available for generating and saving your own BEEF data. For more detailed information, refer to the following documents:

[Benchmark Results](./tests/benchmarks/BOSE_BENCHMARKS.md)

[Guide to Running Your Own Overlay Service on AWS EC2](./tests//benchmarks/BOSE_AWS_EC2_GUIDE.md)

## Getting Started

### Prerequisites

Ensure Node.js, MySQL, and MongoDB are installed on your machine. MongoDB and MySQL should be running as services either locally or on a server you have access to.


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
ROUTING_PREFIX=""
SERVER_PRIVATE_KEY='your_private_key_with_funds'
MIGRATE_KEY="my-grate-key"
DB_CONNECTION='mongodb://localhost:27017'
TAAL_API_KEY='testnet_your_key_here'
DOJO_URL='https://staging-dojo.babbage.systems' # Staging Dojo configured for testnet
KNEX_DB_CONNECTION= "mysql://overlayAdmin:overlay123@localhost:3306/overlay" # Example MYSQL connection string
```
Adjust DB_CONNECTION as necessary if your MongoDB instance has specific user credentials or is hosted remotely.

4. Set Up MySQL:

Start your MySQL instance and set up a new database and user:

```sql
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

5. Database Migrations:

Apply database migrations for MySQL using:

```
npm run migrate
```

6. Start your MongoDB instance and ensure your connection string works.

- **For macOS and Linux Users (Using Homebrew):**

  - If MongoDB is installed via Homebrew, start it as a service with the following command:
```bash
brew services start mongodb-community
```

- **For Windows Users**

If MongoDB is installed as a service, start it from the Services management console, or use the command prompt:
```cmd
net start MongoDB
```

7. Start the local Express server:
```
npm run start
```


8. Ensure you have the stageline (for testnet) or mainline (for mainnet) MetaNet Client running, which is required for this example.
https://projectbabbage.com/metanet-client

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