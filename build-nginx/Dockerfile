FROM nginx:1.11.6-alpine

COPY docker-entrypoint.sh /opt/
COPY docker-entrypoint.d/* /opt/docker-entrypoint.d/
ONBUILD COPY docker-entrypoint.d/* /opt/docker-entrypoint.d/

COPY templates/* /opt/nginx/templates/
ONBUILD COPY templates/* /opt/nginx/templates/

ENTRYPOINT ["/opt/docker-entrypoint.sh"]
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
