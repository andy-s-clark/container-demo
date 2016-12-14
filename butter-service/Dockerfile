FROM docker-registry-dev.impdir.com/container-demo/build-node:7.2.0-1

COPY package.json /opt/app
RUN npm install --production && rm -rf ~/.npm
COPY index.js /opt/app

ENV BUTTER_TYPE='whey'

EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["index.js"]
