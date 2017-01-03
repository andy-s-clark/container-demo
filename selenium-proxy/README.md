# Selenium proxy

Proxy to set True-Client-IP for Selenium

## Quickstart
    docker run -it --rm -p3128:3128 docker-registry-dev.impdir.com/container-demo/selenium-proxy:0.0.1

### Test
    curl -isS --proxy http://localhost:3128 http://icanhazip.com

## Build
    docker build -t selenium-proxy:0.0.1 .

## Run
    docker run -it --rm -p3128:3128 selenium-proxy:0.0.1

## Tag and Push
    docker tag selenium-proxy:0.0.1 docker-registry-dev.impdir.com/container-demo/selenium-proxy:0.0.1
    docker push docker-registry-dev.impdir.com/container-demo/selenium-proxy:0.0.1
