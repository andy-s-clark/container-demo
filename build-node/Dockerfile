FROM mhart/alpine-node:7.2.0

RUN adduser -D noderole noderole \
    && mkdir -p /opt/app \
    && chown -R noderole:noderole /opt/app
USER noderole
WORKDIR /opt/app

CMD ["sh"]
