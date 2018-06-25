# EmailServiceBackend
# AWS Production Deployment Documentation

- [AWS Production Deployment Documentation](#aws-production-deployment-documentation)
    - [New Deployment](#new-deployment)
        - [Requirements](#requirements)
        - [Steps (API)](#steps-api)
        - [Steps (APP)](#steps-app)
    - [Roll-back Deployment](#roll-back-deployment)
    - [Architecture](#architecture)
        - [ECS Cluster](#ecs-cluster)
        - [ECS Services](#ecs-services)
        - [ECS Tasks](#ecs-tasks)
        - [RDS (MySQL)](#rds-mysql)
        - [Redis (Elastic Cache)](#redis-elastic-cache)
        - [S3 Bucket](#s3-bucket)

This document contains the basic architecture, proceadure and common problems and solutions for the Convergence 2.0 website API and APP deployment on Amazon's AWS.

## New Deployment

The following are the deployment proceadures that must be followed in order to update the API or APP services for the Convergence 2.0 website.

### Requirements
- **AWS CLI:** To connect to AWS services (e.g. Amazon ECR).
- **Docker:** To create new images for deployment and to upload to the Amazon ECR.
- **Code:** The `convergence-prod-api` and `convergence-prod-app` repos checked out (separately) on the local machine.


### Steps (API)
1. Change directory into your repository:

    ```cd convergence-prod-api```

2. Run the `deploy.sh` file:

    ```./deploy.sh```

3. Once the docker images have been created and pushed to the ECR, visit: [https://console.aws.amazon.com/ecs/home?region=us-east-1#/taskDefinitions](https://console.aws.amazon.com/ecs/home?region=us-east-1#/taskDefinitions)

    * Select the check box besides the task definition named `prod-api-task`.
    * At the top of the table, click the button `Create new revision`. 
    * Update the repository image tag (e.g. version) by clicking the container name under **Container Definitions** and updating the repository URL.
        * (e.g. `620197346831.dkr.ecr.us-east-1.amazonaws.com/convergence-prod-api:2.0.1` to `620197346831.dkr.ecr.us-east-1.amazonaws.com/convergence-prod-api:2.1.0`) 
        * If you want to **change environment variables** for a container, you must do so here as well.
    * Click `Create`.
    * On the next page, at the top select the button `Actions`.
        * Click `Update service` in the drop down menu that appears.
        * Set the **Cluster** as `prod-convergence-website`.
        * Set the **Service name** as `prod-api`.
        * Leave the rest of the fields as they are.
        * Click `Next step`.
        * Leave the rest of the fields as they are.
            *  If you want, you can change the **Health check grace period** here.
        * Click `Next step`.
        * Leave the rest of the fields as they are.
            * If you want, you can modify the **Service Auto Scaling** in this step.
        * Click `Next step`.
        * Review your update service:
            * **WARNING:** MAKE SURE YOU ARE UPDATING THE RIGHT SERVICE WITH THE RIGHT TASK!
            * **COMMON MISTAKE:** UDATING A `PROD-APP` SERVICE WITH A `PROD-API-TASK`.
        * Click `Update Service`.
        * If everything went correctly, you should see a **green** `Service updaed` notice at the bottom of the page.
        * Click `View Service`.
        * Click the `Tasks` tab.
        * You should now see your latest task definition (e.g. `prod-api-task:#`) being deployed (status: PENDING) while the previous one is still RUNNING. Once the new task has been deployed, the old task will automatically be killed - `if it isn't, you can go a head and stop it yourself once you are certian you do not need to roll back`.
            * The load balancer will automatically switch the routing to utiize the latest task - you do not need to do anything! 

### Steps (APP)
1. Change directory into your repository:

    ```cd convergence-prod-app```

2. Run the `deploy.sh` file:

    ```./deploy.sh```

3. Once the docker images have been created and pushed to the ECR, visit: [https://console.aws.amazon.com/ecs/home?region=us-east-1#/taskDefinitions](https://console.aws.amazon.com/ecs/home?region=us-east-1#/taskDefinitions)

    * Select the check box besides the task definition named `prod-app-task`.
    * At the top of the table, click the button `Create new revision`. 
    * Update the repository image tag (e.g. version) by clicking the container name under **Container Definitions** and updating the repository URL.
        * If you want to **change environment variables** for a container, you must do so here as well.
    * Click `Create`.
    * On the next page, at the top select the button `Actions`.
        * Click `Update service` in the drop down menu that appears.
        * Set the **Cluster** as `prod-convergence-website`.
        * Set the **Service name** as `prod-app`.
        * Leave the rest of the fields as they are.
        * Click `Next step`.
        * Leave the rest of the fields as they are.
            *  If you want, you can change the **Health check grace period** here.
        * Click `Next step`.
        * Leave the rest of the fields as they are.
            * If you want, you can modify the **Service Auto Scaling** in this step.
        * Click `Next step`.
        * Review your update service:
            * **WARNING:** MAKE SURE YOU ARE UPDATING THE RIGHT SERVICE WITH THE RIGHT TASK!
            * **COMMON MISTAKE:** UDATING A `PROD-API` SERVICE WITH A `PROD-APP-TASK`.
        * Click `Update Service`.
        * If everything went correctly, you should see a **green** `Service updaed` notice at the bottom of the page.
        * Click `View Service`.
        * Click the `Tasks` tab.
        * You should now see your latest task definition (e.g. `prod-app-task:#`) being deployed (status: PENDING) while the previous one is still RUNNING. Once the new task has been deployed, the old task will automatically be killed - `if it isn't, you can go a head and stop it yourself once you are certian you do not need to roll back`.
            * The load balancer will automatically switch the routing to utiize the latest task - you do not need to do anything!     

## Roll-back Deployment

In case anything goes wrong in production after a deployment, this proceadue will allow you to roll back to a previous, stable, revision.

*TBD*

## Architecture

The Convergence 2.0 website server architecture is composed of a few "key elements" that are important for the DevOps team to be aware of:
- Primary region us-east-1a (N. Virginia)
    - Secondary region(s): us-east-1b
- ECS Registery for hosting the APP and API (node) docker containers
- ECS Fargate to host the APP and API containers (named: prod-api and prod-app in the cluster "prod-convergence-website")
- An Elastic Application Load Balancer to act as:
    - A reverse proxy for both the API and APP ECS services.
    - Load balancer for traffic if there are multiple tasks spawned due to auto-scaling.
- RDS MySQL database as the primary database
- Redis Elastic Cache for the redis database
- S3 Buckets for hosting images and other files, both private and public

![AWS Basic Architecture](convergence-2.0-aws-architecture.png)
*The general AWS architecture for the 2.0 website. This diagram does not contain all the AWS services used.*

### ECS Cluster

The ECS cluster is labeled "prod-convergence-website" and contains the Fargate services "prod-app" and "prod-api".

### ECS Services

There are two ECS services:
1. prod-api
    - This service has a service discovery endpoint "prod-api.local" which can be utilized to connect to the service from any internal instance (e.g. EC2 instance).
    - Connected to the application load balancer named "convergence-website".
    - Has auto scaling enabled with the following configuration:
        - Minimum tasks: 1
        - Maximum tasks: 2
        - Health check grade period: 300 seconds
        - Scale out policy: 1 minute intervals, 3 consecutive data points, if CPU >= 0.6, add 1 task
        - Scale in policy: 1 minute intervals, 3 consecutive data points, if CPU < 0.6, remove 1 task

2. prod-app
    - This service has a service discovery endpoint "prod-app.local" which can be utilized to connect to the service from any internal instance (e.g. EC2 instance).
    - Connected to the application load balancer named "convergence-website".
    - No auto-scaling policy enabled:
        - Minimum tasks: 1
        - Maximum tasks: 1

### ECS Tasks

Both the API and the APP, which are node applications, are run on ECS instances using AWS's Fargate service. Fargate handles all the internals required run the docker containers with zero setup required on the DevOps team part. However, because of this, there are no EC2 instances spawned as part of this service to access the docker host.

Fargate only charges for the actual Memory and CPU units utilized by each active task.

1. The ECS "prod-api-task" is configured as follows:
    - **Task Memory (MiB):** 2048
    - **Task CPU (unit):** 1024
    - **Image:** 620197346831.dkr.ecr.us-east-1.amazonaws.com/convergence-prod-api:latest
    - **Port Mapping (Host:Container):** 8080:8080
    - Relvant Environemnt Variables.

2. The ECS "prod-app-task" is configured as follow:
    - **Task Memory (MiB):** 2048
    - **Task CPU (unit):** 1024
    - **Image:** 620197346831.dkr.ecr.us-east-1.amazonaws.com/convergence-prod-app
    - **Port Mapping (Host:Container):** 3000:3000
    - Relvant Environemnt Variables.

### RDS (MySQL)

We utilize a MySQL database version 5.7.21 as our primary database. 

### Redis (Elastic Cache)

We utilize Redis 4.0 as the memory key-value database  (for sessions, chat, etc.).

### S3 Bucket

Two S3 buckets are created. One for public documents and images (e.g. institution logos) and the other for private documents only (e.g. Terms of Service agreements or any document uploaded for a deal for example). Private documents can only (and should only) be accessed via signed URLs.
