# AWS ECS Deployment Guide

**Table of Contents**
1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Prerequisites](#prerequisites)
4. [Necessary AWS Configurations](#necessary-aws-configurations)
5. [Tool Installation](#tool-installation)
6. [Project Configuration](#project-configuration)
7. [Configuration Files](#configuration-files)
8. [Project Execution](#project-execution)
9. [Creating the Route 53 Record Set](#creating-the-route-53-record-set)
10. [Updates and Maintenance](#updates-and-maintenance)

## Overview 

This project uses Terraform to create and manage the infrastructure required for a container-based BSV overlay service on AWS. It sets up a CI/CD pipeline using AWS CodePipeline and CodeBuild, which compiles, builds Docker images, and deploys the overlay-example service to Amazon ECS.

## Requirements

- AWS CLI
- Terraform
- IAM User to run Terraform
- Hosted Zone configured in Route 53
- Certificates in AWS Certificate Manager
- S3 bucket for Terraform backend and file storage
- DynamoDB table for Terraform backend
- CodeStar Connection for GitHub access

## Prerequisites

- AWS account with appropriate permissions
- Domain configured in Route 53

## Necessary AWS Configurations

### IAM User

Create an IAM User with sufficient permissions to execute Terraform commands. Add policies like AdministratorAccess or customize as necessary.

1. Log in to the AWS Management Console.
2. Navigate to **IAM** (Identity and Access Management) service.
3. In the left sidebar, click **Users** and then click **Add user**.
4. Enter a **Username**.
5. Select **Programmatic access** for access type.
6. Click **Next: Permissions**.
7. Choose **Attach policies directly** and select **AdministratorAccess** (or customize
the permissions as necessary).
8. Click **Next: Tags** and then **Next: Review**.
9. Click **Create user**.
10. Note down the **Access key ID** and **Secret access key**.

### Hosted Zone
In Route 53, create a Hosted Zone for your domain (e.g., overlay-example.com).

1. Log in to the AWS Management Console.
2. Navigate to **Route 53** service.
3. Click **Hosted zones** in the left sidebar.
4. Click **Create hosted zone**.
5. Enter your **Domain name** (e.g.,overlay-example.com).
6. Choose the type as **Public hosted zone**.
7. Click Create **hosted zone**.


### Certificate Manager
In AWS Certificate Manager, create a certificate for your domain and wildcard (e.g.,overlay-example.com and *.overlay-example.com).

1. Log in to the AWS Management Console.
2. Navigate to **Certificate Manager** service.
3. Click **Request a certificate**.
4. Select **Request a public certificate** and click **Request a certificate**.
5. Enter your domain name (e.g.,overlay-example.com and
*.overlay-example.com).
6. Click **Next**.
7. Choose **DNS validation** and click **Next**.
8. Review the information and click **Confirm and request**.
9. Follow the instructions to add the CNAME record to your DNS configuration to validate the certificate.


### S3 Bucket
Create an S3 Bucket to store the Terraform state and files needed for the build. 

1. Log in to the AWS Management Console.
2. Navigate to **S3** service.
3. Click **Create bucket**.
4. Enter a **Bucket name **(e.g.,overlay-bucket). 
5. Choose a **Region** (e.g.,us-east-2).
6. Click **Create bucket**.

### DynamoDB Table
Create a DynamoDB table for the Terraform backend. 

1. Log in to the AWS Management Console.
2. Navigate to **DynamoDB** service.
3. Click **Create table**.
4. Enter **Table name** (e.g.,terraform-locks).
5. Enter **Partition key** as LockID with **Type** as String. 
6. Click **Create**.

### CodeStar Connection
Set up a CodeStar Connection to allow CodePipeline to access the GitHub repository.

1. Log in to the AWS Management Console.
2. Navigate to **CodePipeline** service.
3. Click **Settings** in the left sidebar.
4. Click **Connections** under **Access management**.
5. Click **Create connection**.
6. Select **GitHub** and click **Next step**.
7. Follow the instructions to connect to your GitHub account and authorize the
connection.
8. Note down the **Connection ARN**.

## Tool Installation

### AWS CLI
Installation Documentation -
https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

Example installation on Ubuntu/Debian:
```bash
  sudo apt update
  sudo apt install awscli -y
  aws --version
```

### Terraform

Installation Documentation - https://learn.hashicorp.com/tutorials/terraform/install-cli 

Example installation on Ubuntu/Debian:
```bash
  sudo apt-get update && sudo apt-get install -y gnupg
  software-properties-common
  wget -O- https://apt.releases.hashicorp.com/gpg | gpg
  --dearmor | sudo tee
  /usr/share/keyrings/hashicorp-archive-keyring.gpg
  echo "deb
  [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg]
  https://apt.releases.hashicorp.com $(lsb_release -cs) main" |
  sudo tee /etc/apt/sources.list.d/hashicorp.list
  sudo apt update
  sudo apt install terraform
  terraform -version
```

## Project Configuration 
Clone the project repository:

```bash
  git clone https://github.com/bitcoin-sv/overlay-infra.git
  cd your-repository
```

## Configuration Files

### dev.tfvars

The dev.tfvars file contains the variable definitions for your environment. Below is an example configuration:


The `dev.tfvars` file contains the variable definitions for your environment. Below is an example configuration:

```plaintext
projectName           = "overlay-dev"
appName               = "overlay-example"
region                = "us-east-2"
vpc_cidr              = "10.0.0.0/16"
public_subnets        = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnets       = ["10.0.3.0/24", "10.0.4.0/24"]
cluster_name          = "overlay-dev-ecs-cluster"
ecs_image             = "ami-00f453db4525939cf"
key_name              = "test-overlay"
rds_master_username   = "overlay"
rds_master_password   = "overlay123"
rds_database_name     = "overlay"
certificate_arn       = "arn:aws:acm:us-east-2:975635808270:certificate/f1d9f14f-e6bd-4fa8-9798-58ceb59ae111"
github_connection_arn = "arn:aws:codestar-connections:us-east-2:975635808270:connection/0be77be1-3dc8-482e-8fe0-4dfd6c45f9dc"
ecr_repo_name         = "overlay-overlay-dev"
asg_min_capacity      = "2"
asg_min_size          = "2"
image_tag             = "latest"
s3_bucket             = "overlay-bucket"
overlay_cname         = "overlay-example.com"
```

- `projectName`: The name of the project.
- `appName`: The name of the application.
- `region`: AWS region where the resources will be created.
- `vpc_cidr`: CIDR block for the VPC.
- `public_subnets`: CIDR blocks for public subnets.
- `private_subnets`: CIDR blocks for private subnets.
- `cluster_name`: Name of the ECS cluster.
- `ecs_image`: AMI ID for the ECS instances.
- `key_name`: Name of the SSH key pair.
- `rds_master_username`: Master username for the RDS cluster.
- `rds_master_password`: Master password for the RDS cluster.
- `rds_database_name`: Initial database name for the RDS cluster.
- `certificate_arn`: ARN of the SSL certificate in AWS Certificate Manager.
- `github_connection_arn`: ARN of the CodeStar Connection for GitHub.
- `ecr_repo_name`: Name of the ECR repository.
- `asg_min_capacity`: Minimum capacity for the Auto Scaling Group.
- `asg_min_size`: Minimum size for the Auto Scaling Group.
- `image_tag`: Docker image tag to be used.
- `s3_bucket`: S3 bucket name for storing Terraform state and build files.
- `overlay_cname`: CNAME for the overlay example.

Make sure to place the dev.tfvars file in the root of terraform code and in the S3 created

### .env
The .env file contains environment variables needed for the application. Below is an example configuration:

```
  PORT=8080
  NODE_ENV='production'
  HOSTING_DOMAIN='http://localhost:8080'
  ROUTING_PREFIX=''
  SERVER_PRIVATE_KEY='123456790'
  MIGRATE_KEY='my-grate-key'
  DB_CONNECTION='mongodb+srv://mongouser:mongoP4SS@mongo.host.co
  m/?retryWrites=true&w=majority'
  TAAL_API_KEY='mainnet_123456790'
  DOJO_URL='https://dojo.babbage.systems'
```

Make sure to place the `.env` file in the root of the S3 created.

## Project Execution 

1. Initialize Terraform:
```
   terraform init
```
2. Apply the Terraform configuration:
```
terraform apply -var-file="dev.tfvars"
```

## Creating the Route 53 Record Set
After applying the Terraform configuration, create a record set in Route 53 pointing to the created Load Balancer.

1. Obtain the DNS of the Load Balancer:
```
terraform output lb_dns_name
```

2. In the Route 53 console, navigate to your Hosted Zone and create a new record set:
- Name: `overlay-example.com`
- Type: `CNAME - Canonical name`
- Value: Enter the DNS of the Load Balancer obtained in the previous step

**Example configuration in the Route 53 console:**
- **Name**: overlay-example.com
- **Type**: CNAME
- **Value**: lb-dns-name (the value obtained by the terraform output lb_dns_name
command)

## Updates and Maintenance

To update the infrastructure or the application, make the necessary modifications in the Terraform files or the application code, and repeat the steps to initialize and apply the Terraform configuration.