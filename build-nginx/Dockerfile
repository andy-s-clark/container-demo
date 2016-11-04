# Usage
# docker build -t build-nginx:1.10.2 .
# docker run -d -p 8000:80 build-nginx:1.10.2
# curl -is http://localhost:8000/healthz
FROM nginx:1.10.2

COPY docker-entrypoint.sh /opt/
COPY docker-entrypoint.d/* /opt/docker-entrypoint.d/
ONBUILD COPY docker-entrypoint.d/* /opt/docker-entrypoint.d/

COPY templates/* /opt/nginx/templates/
ONBUILD COPY templates/* /opt/nginx/templates/

ENTRYPOINT ["/opt/docker-entrypoint.sh"]
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
