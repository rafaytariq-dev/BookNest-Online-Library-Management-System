# BookNest on Minikube (Kubernetes)

These manifests run BookNest using two Deployments:

- `booknest-backend` (NestJS) exposed internally as a ClusterIP service
- `booknest-frontend` (Nginx serving the built React app) exposed as a NodePort

The frontend Nginx config proxies `/api/*` to the backend service, so the browser talks to a single origin and cookie sessions work without extra CORS configuration.

## Build images in Minikube

```bash
minikube start
minikube docker-env
```

Point your shell to Minikube’s Docker daemon (PowerShell example):

```powershell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

Build images:

```bash
docker build -t booknest-backend:latest ./backend
docker build -t booknest-frontend:latest ./frontend
```

## Apply manifests

1) Edit the DB connection and session secret in `backend-secret.yaml`.

2) Apply:

```bash
kubectl apply -f k8s/backend-secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

Open the app:

```bash
minikube service booknest-frontend
```
