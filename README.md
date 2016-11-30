# Container Demo

## Images
### build-nginx
build-nginx is a base Nginx service with extendable configuration templates. It only provides a health check as-is.

Images using this base can place templates in a "templates" sub-folder and entrypoint scripts in a "docker-entrypoint.d".

The binary `bin/envsubst` can be recreated from github.com/a8m/envsubst/cmd/envsubst, assuming go is installed.

    mkdir go_tmp
    GOPATH=$(pwd)/go_tmp go get github.com/a8m/envsubst/cmd/envsubst
    cp go_tmp/bin/envsubst bin
    rm -rf go_tmp

#### Usage

    docker build -t build-nginx:1.11.6 .
    docker run -d -p 8100:80 build-nginx:1.11.6
    curl -is http://localhost:8100/healthz

    # Push image to docker-registry-dev.impdir.com
    docker tag build-nginx:1.11.6 docker-registry-dev.impdir.com/container-demo/build-nginx:1.11.6
    docker push docker-registry-dev.impdir.com/container-demo/build-nginx:1.11.6

### demo-gateway
Uses the base image `build-nginx`. Adds the endpoint /test that returns the text contained in the environment variable "TEST_TEXT".

#### Usage

    docker build -t demo-gateway .
    docker run -d -p 8101:80 -p 8675:8675 -e TEST_TEXT='This is the demo-gateway' demo-gateway
    curl -is http://localhost:8101/healthz

    # Push image to docker-registry-dev.impdir.com
    docker tag demo-gateway docker-registry-dev.impdir.com/container-demo/demo-gateway:1.11.6-1
    docker push docker-registry-dev.impdir.com/container-demo/demo-gateway:1.11.6-1


### demo-frontend
NodeJS application.

#### Usage

    docker build -t demo-frontend .
    docker run -d -p 8102:3000 demo-frontend
    curl -is http://localhost:8102/healthz

    # Push image to docker-registry-dev.impdir.com
    docker tag demo-frontend docker-registry-dev.impdir.com/container-demo/demo-frontend:0.0.1
    docker push docker-registry-dev.impdir.com/container-demo/demo-frontend:0.0.1

## Deploy to Kubernetes

### Create namespace
Optional, but it will keep things nice and clean.

    $ kubectl create namespace container-demo
    namespace "container-demo" created

### Create demo-frontend service
Use service type `NodePort` rather than `ClusterIP` to allow external debugging.

    $ kubectl create -f k8s/demo-frontend-service.yaml                  
    service "demo-frontend" created

### Create demo-frontend deployment

    $ kubectl create -f k8s/demo-frontend-deployment.yaml
    deployment "demo-frontend" created

### Verify demo-frontend service
Using `NodePort` allows connecting to the service from outside the cluster. Get and query the url

    $ minikube service --namespace container-demo demo-frontend --url
    http://192.168.99.100:31021
    $ curl -is http://192.168.99.100:31021/healthz
    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8
    Content-Length: 4
    ETag: W/"4-QGpd7eTGL69Gy1/1xXSFbg"
    Date: Fri, 02 Dec 2016 01:33:22 GMT
    Connection: keep-alive

    imok


### Create demo-gateway service

    $ kubectl create -f k8s/demo-gateway-service.yaml
    service "demo-gateway" created

### Create demo-gateway deployment

    $ kubectl create -f k8s/demo-gateway-deployment.yaml
    deployment "demo-gateway" created

### Verify demo-gateway service

    minikube service --namespace container-demo demo-gateway --url
    http://192.168.99.100:30472
    $ curl -is http://192.168.99.100:30472/healthz
    HTTP/1.1 204 No Content
    Server: nginx/1.11.6
    Date: Fri, 02 Dec 2016 01:34:47 GMT
    Connection: keep-alive


### Misc.

#### List all services in the namespace

    $ kubectl get services --namespace=container-demo
    NAME            CLUSTER-IP   EXTERNAL-IP   PORT(S)    AGE
    demo-frontend   10.0.0.254   <nodes>       3000/TCP   6m
    demo-gateway    10.0.0.141   <nodes>       80/TCP     2m

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
