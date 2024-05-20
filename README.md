# Overlay Example

This repository contains an example deployment of the BSV Overlay Services Engine.

It's intended to show a basic configuration that can be modified, extended and customized to fit the needs of various use-cases.

It's designed as follows:

- Use the Overlay Services Engine for transaction processing
- Write a basic Topic Manager and Lookup Service that track all submitted transactions
- Create a Node HTTP server with Express and wrap the Engine with an HTTP API
- Make use of Knex and the default Overlay Services Knex Storage Engine, and use Knex for the Lookup Service
- Configure a basic Knexfile for use with a local MySQL database for easy testing and customization
- Expose endpoints for transaction submission, lookup, and metadata about the various hosted Overlay Services
- Host service-specific documentation, so that people know how to interact with the system
- Keep things simple, with the minimum required configuration to get started in local development and maximize customizability
- Follow BRC standards for endpoint interoperability and synchronization with other hosts as these standards emerge

## Getting Started

To get started, pull the repository and start a MySQL server. Modify the Knexfile with your credentials, and `npm run start` should spin things up on localhost.

Please fork and modify this repository for your needs. Write custom topic managers, install lookup services, create new API endpoints,  deploy and/or containerize your server however you like. This is merely a starting point.

## License

The license for the code in this repository is the Open BSV License.