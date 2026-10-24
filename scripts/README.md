# Kubernetes cluster onboarding for Faultline

`Export-FaultlineKubeconfig.ps1` exports the currently selected Kubernetes
cluster into a self-contained access file that can be uploaded to Faultline.

The helper is not tied to a particular kubectl context. It operates on whichever
context is active when the command runs.

## Prerequisites

- Windows PowerShell or PowerShell 7
- `kubectl` installed and available in `PATH`
- The target Kubernetes cluster running and selected as the current context
- The Kubernetes API exposed on an address reachable by the Faultline machine

Confirm the selected cluster before exporting:

```powershell
kubectl config current-context
kubectl get nodes
```

To use a different cluster, select its context first:

```powershell
kubectl config get-contexts
kubectl config use-context <context-name>
```

## Create the access file

Run this command from the repository root, replacing the example with an IPv4
address through which Faultline can reach the target cluster's Kubernetes API:

```powershell
.\scripts\Export-FaultlineKubeconfig.ps1 -BookNestAddress 192.168.18.35
```

Despite its current name, `BookNestAddress` means the reachable address of the
machine hosting the selected Kubernetes cluster.

The script uses Kubernetes API port `36443` by default. Supply a different port
when necessary:

```powershell
.\scripts\Export-FaultlineKubeconfig.ps1 `
  -BookNestAddress 192.168.18.35 `
  -ApiPort 36443
```

If successful, the file is created at:

```text
.local/booknest-faultline-kubeconfig.yaml
```

Use `OutputPath` to create a clearly named file for each environment:

```powershell
.\scripts\Export-FaultlineKubeconfig.ps1 `
  -BookNestAddress 192.168.18.35 `
  -OutputPath .\.local\staging-faultline-kubeconfig.yaml
```

The script also verifies that the exported file can connect to the Kubernetes
API. If verification fails, check the API port, firewall, routing, and whether
the API server certificate contains the supplied IP address. For this
repository's Kind setup, certificate addresses are configured in
`k8s/kind-config.yaml` under `apiServer.certSANs`.

## Upload it to Faultline

1. Open **Faultline → Clusters → Cluster Onboarding**.
2. Enter a name for the cluster.
3. Select the generated kubeconfig as the cluster access file.
4. Leave the control-plane address blank; it is already stored in the file.
5. Enter the Faultline ingestion address and start onboarding.

The ingestion address is the URL that the in-cluster collectors use to send
telemetry back to Faultline. It must be reachable from Kubernetes pods. Do not
use `localhost`. For example, if Faultline runs on another LAN machine:

```text
http://192.168.18.20:3001
```

## Security

The generated kubeconfig contains Kubernetes client credentials. Transfer it
securely, do not commit it, and delete transferred copies after onboarding. The
default output is under `.local/`, which is ignored by Git.

This helper supports Kubernetes environments that expose an HTTPS API and use a
certificate-based kubeconfig. It is not a universal exporter for managed
clusters that rely on cloud login or executable credential plugins.
