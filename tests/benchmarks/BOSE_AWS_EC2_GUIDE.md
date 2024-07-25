# BOSE AWS EC2 DEB GUIDE

Guide to Deploying the BSV Overlay Example on AWS EC2 with Debian

This guide provides step-by-step instructions to deploy the BSV Overlay Example on an AWS EC2 instance running Debian.

## Prerequisites

1. AWS Account
2. SSH Key Pair (downloaded .pem file for SSH access)
3. AWS CLI installed and configured on your local machine

## Step 1: Set Up AWS EC2 Instance

1. Log into AWS Management Console and navigate to the EC2 service.
2. Launch a Debian AMI from the available AMIs.
    - Search for "Debian" in the AMI catalogue and select a suitable Debian image.
3. Choose an Instance Type:
    - Select t2.small for low volume use.
4. Configure Network and Security Group:
    - Allow SSH (22), HTTP (80), HTTPS (443), and custom TCP (8080).
    - Ensure source is 0.0.0.0/0 for all rules.
5. Create a Key Pair for SSH access, download it, and launch your instance.

## Step 2: Prepare the EC2 Instance

1. SSH into Your Instance:

    ```sh
    ssh -i path/to/your-key.pem admin@instance-public-dns
    ```

2. Update and Install Dependencies:
    - Update your system:

    ```sh
    sudo apt update && sudo apt upgrade -y
    ```

    - Install Docker, Node.js, npm, and Git:

    ```sh
    sudo apt install -y docker.io nodejs npm git
    ```

3. Enable Docker to Start on Boot:

    ```sh
    sudo systemctl enable docker
    ```

4. Start Docker Service:

    ```sh
    sudo systemctl start docker
    ```

## Step 3: Set Up MySQL and MongoDB Using Docker

1. Run MySQL Container with Restart Policy:

    ```sh
    sudo docker run --name mysql-server -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=overlay -e MYSQL_USER=overlayAdmin -e MYSQL_PASSWORD=your_password -p 3306:3306 -d --restart unless-stopped mysql:8.0
    ```

2. Run MongoDB Container with Restart Policy:

    ```sh
    sudo docker run --name mongodb-server -d -p 27017:27017 --restart unless-stopped mongo:4.4
    ```

3. Configure MySQL Database:
    - Access the MySQL container:

    ```sh
    sudo docker exec -it mysql-server bash
    ```

    - Log into MySQL:

    ```sh
    mysql -u root -p
    ```

    - Create necessary database and user:

    ```sql
    CREATE DATABASE overlay;
    CREATE USER 'overlayAdmin'@'127.0.0.1' IDENTIFIED BY 'your_password';
    GRANT ALL PRIVILEGES ON overlay.* TO 'overlayAdmin'@'127.0.0.1';
    FLUSH PRIVILEGES;
    EXIT;
    ```

4. Configure MongoDB Database:
    - Access the MongoDB container:

    ```sh
    sudo docker exec -it mongodb-server bash
    ```

    - Log into MongoDB:

    ```sh
    mongo
    ```

    - Create database and user:

    ```js
    use production_overlay_lookup_services
    db.createUser({
      user: "overlayAdmin",
      pwd: "your_password",
      roles: [{ role: "readWrite", db: "production_overlay_lookup_services" }]
    });
    exit;
    ```

## Step 4: Clone and Set Up the GitHub Repository

1. Clone the Repository:

    ```sh
    git clone https://github.com/bitcoin-sv/overlay-example.git
    cd overlay-example
    ```

2. Install Node Dependencies:

    ```sh
    npm i
    ```

## Step 5: Configure the Application

1. Environment Configuration: Set up a .env file based on your setup:

    ```env
    PORT=8080
    NODE_ENV='development'
    HOSTING_DOMAIN="http://localhost:8080"
    SERVER_PRIVATE_KEY='your_private_key_with_funds'
    MIGRATE_KEY="my-grate-key"
    DB_CONNECTION='mongodb://overlayAdmin:overlay123@127.0.0.1:27017/production_overlay_lookup_services'
    TAAL_API_KEY='testnet_your_key_here'
    DOJO_URL='https://staging-dojo.babbage.systems'
    ```

2. Update Knex Configuration: Edit knexfile.ts to match your database setup:

    ```ts
    import type { Knex } from 'knex';

    const knexfile: { [key: string]: Knex.Config } = {
      development: {
        client: 'mysql2',
        connection: {
          host: '127.0.0.1',
          port: 3306,
          user: 'overlayAdmin',
          password: 'your_password',
          database: 'overlay'
        },
        useNullAsDefault: true,
        migrations: {
          directory: './src/migrations'
        }
      }
    };

    export default knexfile;
    ```

## Step 6: Run the Application

1. Start the Server:

    ```sh
    npm run start
    ```

## Step 7: Verify the Deployment and Run Migrations

1. Access the Application: Open a web browser and navigate to:

    ```
    http://<public-ip>:8080
    ```

2. Run Migrations: You can use curl or Postman to trigger the /migrate route.

    Using curl:

    ```sh
    curl -X POST http://<public-ip>:8080/migrate -H "Content-Type: application/json" -d '{"migratekey": "my-grate-key"}'
    ```

    Using Postman:
    - Open Postman.
    - Create a new POST request to:

    ```
    http://<public-ip>:8080/migrate
    ```

    - Set the request header:

    ```
    Content-Type: application/json
    ```

    - Set the request body to raw JSON:

    ```json
    {
      "migratekey": "my-grate-key"
    }
    ```

    - Send the request to trigger the migration.

Now, you can submit transactions in BEEF format to the /submit endpoint on any configured topic managers, and perform lookups with any configured lookup services with the /lookup route. You can, of course, customize your AWS deployment of the Overlay Services Engine however desired.
