# BookNest on Minikube (Kubernetes)

These manifests run BookNest using two Deployments:

- `booknest-backend` (NestJS) exposed internally as a ClusterIP service
- `booknest-frontend` (Nginx serving the built React app) exposed as a NodePort

The frontend Nginx config proxies `/api/*` to the backend service, so the browser talks to a single origin and cookie sessions work without extra CORS configuration.
The frontend init container waits for the backend health route before starting Nginx;
its readiness probe then checks `/api/health` through that same reverse-proxy path.

## Create a local Kind cluster

Use the checked-in Kind configuration so the Kubernetes API always uses
`https://127.0.0.1:36443` instead of a randomly assigned Docker port:

```powershell
kind create cluster --name booknest --config k8s/kind-config.yaml --wait 120s
kubectl config use-context kind-booknest
kubectl get nodes
```

If Kind is not installed globally, run the downloaded executable from the Faultline
backend workspace instead:

```powershell
..\Faultline-Backend\faultline\.local\kind.exe create cluster --name booknest --config k8s/kind-config.yaml --wait 120s
```

Kind cannot change the published API port of an existing control-plane container. To
move an existing cluster to the fixed port, export or recreate any state you need, then
delete and create the cluster again using the configuration above.

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

For Kind, a NodePort is reachable from the host only when the Kind node was created
with a matching `extraPortMappings` entry. Otherwise use a port-forward:

```powershell
kubectl port-forward service/booknest-frontend 8080:80
```

Then open `http://127.0.0.1:8080`. The frontend calls relative `/api` URLs, so login
cookies and every API request remain on that same origin.
