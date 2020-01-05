#1/bin/bash
#kubectl create secret docker-registry registry-secret --docker-username --docker-password --docker-email

kubectl create -f aws-secret.yaml
kubectl create -f env-configmap.yaml
kubectl create -f env-secret.yaml

kubectl apply -f back-end-feed-service.yaml
kubectl apply -f back-end-user-service.yaml
kubectl apply -f front-end-service.yaml
kubectl apply -f reverseproxy-service.yaml

kubectl apply -f back-end-feed-deployment.yaml
kubectl apply -f back-end-user-deployment.yaml
kubectl apply -f front-end-deployment.yaml
kubectl apply -f reverseproxy-deployment.yaml
