FROM mhart/alpine-node:7.2.0

RUN adduser -D noderole noderole \
    && mkdir -p /opt/app \
    && chown -R noderole:noderole /opt/app
USER noderole
WORKDIR /opt/app

COPY package.json /opt/app
RUN npm install --production && rm -rf ~/.npm
COPY index.js /opt/app

EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["index.js"]
