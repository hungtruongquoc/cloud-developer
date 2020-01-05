## Name: Hung Truong
## Project: Refactor Udagram app into Microservices and Deploy

### Links
**GitHub**: https://github.com/hungtruongquoc/cloud-developer

**Docker Hub**: https://hub.docker.com/u/hungtruongquoc

### Cluster Config and Deploy Structure
* Folder for this submission is 'course-03'
* 'deployment' folder contains the docker-compose file and kubernetes configuration files
* Each service is composed of a deployment and a service yaml files
* 'aws-secret.yaml' should be provided with the content of the AWS credential file
* 'env-configmap.yaml' should be provided with the contents of environment variables for all services
* 'env-secret.yaml' should be provided with the database username and password of the Postgres database

### Image Building Process
* The Dockerfile files for each service (user, feed, frontend) are placed in the folder containing the source code
* The Dockerfile file for the nginx is placed in the 'deployment' folder
* To build images, use the docker-compose-build.yaml
* To up servers without a clusters, use the docker-compose.yaml
* I configured build triggers for all images in my Docker Hub repository to build automatically whenever there is pushed to the development branch

### Run the Application
* Provide the AWS credentials file in the aws-secret.yaml
* Adjust env-configmap.yaml to provide appropriate value with the set up for services
* Provide the username and password for Postgres database in the env-secret.yaml
* Use the bash file run-kubernetes.sh to apply all the deployments and services
