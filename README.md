# Container Demo

## Base Images

### build-nginx
build-nginx is a base Nginx service with extendable configuration templates.
It only provides a health check as-is.

Images using this base can place templates in a "templates" sub-folder and
entrypoint scripts in `docker-entrypoint.d`.

#### Local Docker

    docker build -t build-nginx:1.11.6-2 .
    docker run -d -p 8100:80 build-nginx:1.11.6-2
    curl -isS http://localhost:8100/healthz

#### Push image to docker-registry-dev.impdir.com
    docker tag build-nginx:1.11.6-2 docker-registry-dev.impdir.com/container-demo/build-nginx:1.11.6-2
    docker push docker-registry-dev.impdir.com/container-demo/build-nginx:1.11.6-2

### build-node
build-node is a base NodeJS install. It does not do anything useful as-is.

Images using this base have a non-privileged user and a directory for the
application created.

#### Local Docker

    docker build -t build-node:7.2.0-1 .

#### Push image to docker-registry-dev.impdir.com
    docker tag build-node:7.2.0-1 docker-registry-dev.impdir.com/container-demo/build-node:7.2.0-1
    docker push docker-registry-dev.impdir.com/container-demo/build-node:7.2.0-1

## Application Images

### butter-service
NodeJS service that returns a meaningless "butter" object.

#### Local Node.js Development

    npm install
    PORT=3001 node index.js

    # Test locally
    curl -isS http://localhost:3001/healthz

#### Local Docker

    docker build -t butter-service .

    # Test
    docker run -d -p 8103:3000 butter-service
    curl -isS http://localhost:8103/healthz

#### Push image to docker-registry-dev.impdir.com
    docker tag butter-service docker-registry-dev.impdir.com/container-demo/butter-service:0.0.2
    docker push docker-registry-dev.impdir.com/container-demo/butter-service:0.0.2

### demo-frontend
Simple NodeJS application with the following endpoints:
* `/` - Returns "Frontend homepage"
* `/healthz` - Returns "imok"
* `/butter` - Connects to `butter-service` and returns a `butter` object


#### Local Node.js Development
Requires that `butter-service` is running locally and bound to port `3001`, if
you want to access the `/butter` route. The environment variable
`BUTTER_SERVICE_URL` can be set to point to where ever the butter service is
running.

    npm install
    BUTTER_SERVICE_URL=http://localhost:3001/ PORT=3002 node index.js

    # Test locally
    curl -isS http://localhost:3002/healthz

#### Local Docker

    docker build -t demo-frontend .

    # Test
    docker run -d -p 8102:3000 demo-frontend
    curl -isS http://localhost:8102/healthz

#### Push image to docker-registry-dev.impdir.com
    docker tag demo-frontend docker-registry-dev.impdir.com/container-demo/demo-frontend:0.0.3
    docker push docker-registry-dev.impdir.com/container-demo/demo-frontend:0.0.3

### demo-gateway
Uses the base image `build-nginx`. Proxies requests to the frontend.

#### Local Docker

    docker build -t demo-gateway .

    # Test locally
    docker run -d -p 8101:80 -p 8675:8675 -e FRONTEND_HOST_NAME=localhost demo-gateway
    curl -isS http://localhost:8101/healthz

#### Push image to docker-registry-dev.impdir.com
    docker tag demo-gateway docker-registry-dev.impdir.com/container-demo/demo-gateway:0.0.1
    docker push docker-registry-dev.impdir.com/container-demo/demo-gateway:0.0.1

## Kubernetes and minikube

### Install kubernetes locally
Get [`kubectl` and place in the system path](http://kubernetes.io/docs/getting-started-guides/minikube/#installation)

* https://storage.googleapis.com/kubernetes-release/release/v1.4.6/bin/darwin/amd64/kubectl
* https://storage.googleapis.com/kubernetes-release/release/v1.4.6/bin/linux/amd64/kubectl
* http://storage.googleapis.com/kubernetes-release/release/v1.4.6/bin/windows/amd64/kubectl.exe

Only the `kubectl` binary is needed. The cluster will be created by minikube.

### Install minikube
https://github.com/kubernetes/minikube/releases/tag/v0.12.2

Optionally install using a CI build for the latest features
(ex. The heapster add-on)
* https://storage.googleapis.com/minikube-builds/864/minikube-darwin-amd64
* https://storage.googleapis.com/minikube-builds/864/minikube-linux-amd64
* https://storage.googleapis.com/minikube-builds/864/minikube-windows-amd64 (?)

### Start minikube
Start minikube, using the [rkt runtime](https://coreos.com/rkt/)

    minikube start \
    --cpus 4 \
    --memory 4096 \
    --network-plugin=cni \
    --container-runtime=rkt \
    --iso-url=http://storage.googleapis.com/minikube/iso/buildroot/minikube-v0.0.6.iso \
    --extra-config=kubelet.MaxPods=30

#### Verify that the node is up

    $ kubectl get nodes
    NAME       STATUS    AGE
    minikube   Ready     1m

### Get the URL of the kubernetes dashboard

    $ minikube dashboard --url
    http://192.168.99.100:30000

### Get the URL of heapster's grafana service
_Optional_

    $ minikube service --namespace kube-system monitoring-grafana --url
    http://192.168.99.100:31808

## Deploy container-demo to Kubernetes

### Create namespace
Keeps things nice and clean.

    $ kubectl create namespace container-demo
    namespace "container-demo" created

### Create butter-service service
Use service type `NodePort` rather than `ClusterIP` to allow external debugging.

    $ kubectl create -f k8s/butter-service-service.yaml                  
    service "butter-service" created

### Create butter-service deployment

    $ kubectl create -f k8s/butter-service-deployment.yaml
    deployment "butter-service" created

### Verify that butter-service pods are running

    $ kubectl --namespace=container-demo get pods
    NAME                              READY     STATUS    RESTARTS   AGE
    butter-service-2870242483-4k5qb   1/1       Running   0          2m
    butter-service-2870242483-cdgmw   1/1       Running   0          2m

### Verify butter-service service

    $ curl -isS $(minikube --namespace=container-demo service butter-service --url)/healthz
    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8
    Content-Length: 4
    ETag: W/"4-QGpd7eTGL69Gy1/1xXSFbg"
    Date: Thu, 29 Dec 2016 00:52:28 GMT
    Connection: keep-alive

    imok

### Create demo-frontend service
Use service type `NodePort` rather than `ClusterIP` to allow external debugging.

    $ kubectl create -f k8s/demo-frontend-service.yaml                  
    service "demo-frontend" created

### Create demo-frontend deployment

    $ kubectl create -f k8s/demo-frontend-deployment.yaml
    deployment "demo-frontend" created

### Verify that demo-frontend pods are running

    $ kubectl --namespace=container-demo get pods
    NAME                              READY     STATUS    RESTARTS   AGE
    butter-service-2870242483-4k5qb   1/1       Running   0          4m
    butter-service-2870242483-cdgmw   1/1       Running   0          4m
    demo-frontend-1867213484-44tl6    1/1       Running   0          26s
    demo-frontend-1867213484-6tk15    1/1       Running   0          26s

### Verify demo-frontend service
Using `NodePort` allows connecting to the service from outside the cluster.
Get and query the url

    $ curl -isS $(minikube --namespace=container-demo service demo-frontend --url)/healthz
    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8
    Content-Length: 4
    ETag: W/"4-QGpd7eTGL69Gy1/1xXSFbg"
    Date: Thu, 29 Dec 2016 00:54:49 GMT
    Connection: keep-alive

    imok

### Create demo-gateway service

    $ kubectl create -f k8s/demo-gateway-service.yaml
    service "demo-gateway" created

### Create demo-gateway deployment

    $ kubectl create -f k8s/demo-gateway-deployment.yaml
    deployment "demo-gateway" created

### Verify that demo-frontend pods are running

    $ kubectl --namespace=container-demo get pods
    NAME                              READY     STATUS    RESTARTS   AGE
    butter-service-2870242483-4k5qb   1/1       Running   0          7m
    butter-service-2870242483-cdgmw   1/1       Running   0          7m
    demo-frontend-1867213484-44tl6    1/1       Running   0          2m
    demo-frontend-1867213484-6tk15    1/1       Running   0          2m
    demo-gateway-3722071730-fn8rd     1/1       Running   0          39s

### Verify demo-gateway service

    $ curl -isS $(minikube --namespace=container-demo service demo-gateway --url)/healthz
    HTTP/1.1 200 OK
    Server: nginx/1.11.6
    Date: Thu, 29 Dec 2016 00:56:47 GMT
    Content-Type: application/octet-stream
    Content-Length: 4
    Connection: keep-alive
    Content-Type: text/html

    imok

### Test the full stack

#### Store the URL of the `demo-gateway` in `GATEWAY_URL`
    $ GATEWAY_URL=$(minikube service --namespace container-demo demo-gateway --url)

#### Verify that the `demo-gateway` is up

    $ curl -isS ${GATEWAY_URL}/healthz
    HTTP/1.1 200 OK
    Server: nginx/1.11.6
    Date: Sat, 03 Dec 2016 06:43:37 GMT
    Content-Type: application/octet-stream
    Content-Length: 4
    Connection: keep-alive
    Content-Type: text/html

    imok

#### Verify that the `demo-gateway` can reach `demo-frontend`

    $ curl -isS ${GATEWAY_URL}/
    HTTP/1.1 200 OK
    Server: nginx/1.11.6
    Date: Sat, 03 Dec 2016 06:44:04 GMT
    Content-Type: text/html; charset=utf-8
    Content-Length: 17
    Connection: keep-alive
    X-Powered-By: Express
    ETag: W/"11-iG0h1BKIYgqgydt3LRzhUA"

    Frontend homepage

#### Verify that the `demo-gateway` can reach `demo-frontend` and `demo-frontend` can reach `butter-service`

    $ curl -isS ${GATEWAY_URL}/butter
    HTTP/1.1 200 OK
    Server: nginx/1.11.6
    Date: Sat, 03 Dec 2016 06:44:17 GMT
    Content-Type: text/html; charset=utf-8
    Content-Length: 36
    Connection: keep-alive
    X-Powered-By: Express
    ETag: W/"24-Zl8e6CuSYAQ1UtA3PSVv3w"

    {"hasSalt":true,"butterType":"whey"}


### Misc.

#### List all services in the namespace

    $ kubectl get services --namespace=container-demo
    NAME             CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
    butter-service   10.0.0.165   <nodes>       80/TCP    1h
    demo-frontend    10.0.0.55    <nodes>       80/TCP    1h
    demo-gateway     10.0.0.98    <nodes>       80/TCP    1h

#### Get demo-gateway service details
Note that the NodePort (30472 in this case) is the same as the port that was returned by minikube, "http://192.168.99.100:30472" . A NodePort is exposed on all hosts in the cluster. In the case of minikube it is exposed on the external IP address of the VM running the cluster.

    $ kubectl describe service --namespace=container-demo demo-gateway
    Name:                   demo-gateway
    Namespace:              container-demo
    Labels:                 <none>
    Selector:               app=demo-gateway
    Type:                   NodePort
    IP:                     10.0.0.141
    Port:                   <unset> 80/TCP
    NodePort:               <unset> 30472/TCP
    Endpoints:              172.17.0.10:80
    Session Affinity:       None

#### Watch a pod's log

    $ kubectl get pods --namespace=container-demo
    NAME                              READY     STATUS    RESTARTS   AGE
    butter-service-3112725090-11vd7   1/1       Running   0          1h
    butter-service-3112725090-ozcl0   1/1       Running   0          1h
    demo-frontend-3704334960-fc65g    1/1       Running   0          10m
    demo-frontend-3704334960-vqk7v    1/1       Running   0          10m
    demo-gateway-2218691947-jq0i1     1/1       Running   0          1h

    $ kubectl logs --namespace=container-demo -f butter-service-3112725090-11vd7
    butter-service listening on port 3000

### Run build-cloud with a sidecar

#### Build images
_Optional, you can use the images that have already been pushed to the registry_

##### build-sidecar-node-store
See the
[api-gateway repo](https://github.com/buildcom/api-gateway/blob/master/build-sidecars/build-sidecar-node-store/docker.md)
for more information

    cd ~/work/api-gateway/build-sidecars/build-sidecar-node-store
    mvn install -DskipTests
    docker build -t build-sidecar-node-store .
    docker tag build-sidecar-node-store docker-registry-dev.impdir.com/container-demo/build-sidecar-node-store:4
    docker push docker-registry-dev.impdir.com/container-demo/build-sidecar-node-store:4

##### build-cloud                                                          
See the
[build-cloud repo](https://github.com/buildcom/build-cloud/blob/master/docs/docker.md)
for more information.

    cd ~/work/build-cloud
    docker build -t build-cloud .
    docker tag build-cloud docker-registry-dev.impdir.com/container-demo/build-cloud:3
    docker push docker-registry-dev.impdir.com/container-demo/build-cloud:3

#### Run the sidecar and build-cloud locally

##### Start the sidecar

    docker run --rm -it -e SPRING_PROFILES_ACTIVE=dev --network=host build-sidecar-node-store

##### Verify that the sidecar is working

    $ curl -isS http://localhost:8082/health
    HTTP/1.1 200
    X-Application-Context: build-node-store:dev:8082
    Content-Type: application/json;charset=UTF-8
    Transfer-Encoding: chunked
    Vary: Accept-Encoding
    Date: Sun, 15 Jan 2017 08:48:52 GMT

    {"status":"UP","localApplication":{"status":"UP"},"discoveryComposite":{"description":"Spring Cloud Eureka Discovery Client","status":"UP","discoveryClient":{"description":"Spring Cloud Eureka Discovery Client","status":"UP","services":["build-store","build-message-listeners","build-api","build-node-store","config-server","build-tools","build-imageserver","build-omc","discovery-server","build-scheduled-task","content-tool","build-webservices"]},"eureka":{"description":"Remote status from Eureka server","status":"UNKNOWN","applications":{"BUILD-TOOLS":8,"BUILD-IMAGESERVER":1,"BUILD-STORE":9,"BUILD-MESSAGE-LISTENERS":2,"BUILD-OMC":7,"DISCOVERY-SERVER":1,"BUILD-API":2,"BUILD-NODE-STORE":9,"CONFIG-SERVER":1,"BUILD-SCHEDULED-TASK":2,"CONTENT-TOOL":1,"BUILD-WEBSERVICES":13}}},"diskSpace":{"status":"UP","total":422623494144,"free":55056158720,"threshold":10485760},"refreshScope":{"status":"UP"},"hystrix":{"status":"UP"}}

##### Start build-cloud

    docker run --rm -it -e PORT=3001 -e NODE_ENV=production -e CONFIG_ENV=development --network=host build-cloud

##### Verify that build-cloud is working

    $ curl -isS http://localhost:3001/api/info
    HTTP/1.1 200 OK
    X-Powered-By: Build.com
    X-XSS-Protection: 1; mode=block
    Set-Cookie: CID=9ed3f680a82442b1afd74f3c1f83af15; Max-Age=315360000; Path=/; Expires=Wed, 13 Jan 2027 08:51:04 GMT; HttpOnly
    Content-Type: application/json; charset=utf-8
    Content-Length: 1082
    ETag: W/"43a-Do5bbrnqmaSHwHD/jf15Gw"
    Vary: Accept-Encoding
    Date: Sun, 15 Jan 2017 08:51:06 GMT
    Connection: keep-alive

    {"environment":"development","server":{"hostname":"motzie","port":"3001","cpus":8,"multiThread":false,"reservedCpus":0,"threads":1},"processVersions":{"http_parser":"2.7.0","node":"6.2.2","v8":"5.0.71.52","uv":"1.9.1","zlib":"1.2.8","ares":"1.10.1-DEV","icu":"57.1","modules":"48","openssl":"1.0.2h"},"build":{"env":"development","hash":"8e75e64d61ca4bcd316ecbc85dbc9a311cb58cad","config":"development","repo":{"revision":"8e75e64d61ca4bcd316ecbc85dbc9a311cb58cad"},"git":{"commit":"8e75e64d61ca4bcd316ecbc85dbc9a311cb58cad"}},"request":{"host":"localhost:3001","isSSL":false},"webservices":{"environment":{"sidecar":true,"discovery":false,"host":"http://localhost:8082","pathPrefix":"/build-webservices"},"settings":{"environment":"development","version":"latest","sidecar":false,"service":"build-api"}},"greenhouseClient":{"environment":{"sidecar":false,"discovery":false,"host":"https://api.greenhouse.io/v1","authkey":"05f7cb93862097f9414827b8e9adf4c8"},"settings":{"environment":"development","version":"latest","service":"greenhouse"}},"site":{"skin":"build","theme":"build"}}

##### Kill your local sidecar and build-cloud

    docker kill $(docker ps | grep build | awk '{print $1}')

#### Create build-cloud service

    $ kubectl create -f k8s/build-cloud-service.yaml
    service "build-cloud" created

#### Create build-cloud deployment

    $ kubectl create -f k8s/build-cloud-deployment.yaml
    deployment "build-cloud" created
