# Reverse IP Web Application

## Overview

This web application, built with Node.js, captures the origin public IP address of incoming requests and returns it in reverse order. For instance, if the incoming IP is `1.2.3.4`, the application will respond with `4.3.2.1`. The reversed IP address is stored in a MongoDB database for further reference.

## Features

- **IP Address Reversal**: Captures and reverses the client’s public IP address.
- **Database Storage**: Stores the reversed IP addresses in MongoDB.
- **Containerization**: Built as a Docker container for easy deployment.
- **Kubernetes Deployment**: Utilizes Helm charts for deployment on AWS EKS (Elastic Kubernetes Service).
- **CI/CD Pipeline**: Implemented using GitHub Actions for automated builds and deployments.
-  **nginx ingress controller**: Allows external access to the application.

## Technologies Used

- **Node.js**: JavaScript runtime for building the application.
- **Docker**: Containerization platform to package the application.
- **AWS EKS**: Managed Kubernetes service for deploying containerized applications.
- **Helm**: Kubernetes package manager for managing deployments.
- **MongoDB**: NoSQL database to store reversed IP addresses.
- **GitHub Actions**: CI/CD tool for automating the build and deployment process.
- **Nginx ingress controller**: tool for allowing external access to the application.

## Getting Started

### Prerequisites

Before running this application, ensure you have the following installed:

- Node.js (version 18 or higher)
- Docker
- Access to an AWS account with EKS configured
- Helm
- MongoDB (either locally or via a cloud provider)
- Nginx ingress controller

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/BlacOrpheus/reverse-ip-app.git
   cd reverse-ip-app
   
2. Install dependencies:
   ```bash
   npm install

### Running Locally
To run the application locally, execute:
 ```
 node index.js
```  
Visit http://localhost:3000 in your browser or use a tool like Postman to test the endpoint.

Building Docker Image
To create a Docker image of your application, run:
```
docker build -t reverse-ip-app:latest
```

### Deploying with Helm
1. Package your Helm chart:
   ```
   helm package ./helm/reverse-ip-chart
   
2. Deploy to your EKS cluster:
   ```
   helm install reverse-ip-app ./helm/reverse-ip-chart
   ```
3. Install Nginx ingress controller:
   ```
   helm repo add ingress-nginx https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/helm-chart/ingress-nginx
   helm repo update
   helm install reverse-ip-app ingress-nginx/ingress-nginx
   ```
### CI/CD Pipeline with GitHub Actions
The CI/CD pipeline is configured to automatically build and push the Docker image to a Docker registry and deploy the application to EKS whenever changes are pushed to the main branch.

### GitHub Actions Configuration
The .github/workflows/ci-cd.yml file contains the configuration for building and deploying the application.
