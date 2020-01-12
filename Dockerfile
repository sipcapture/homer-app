FROM node:12-alpine as webapp
ENV BUILD 20200112-002
RUN apk add git && git clone https://gitlab.com/qxip/hepic-ui-3 /app
WORKDIR /app
RUN npm install && npm install -g @angular/cli && ng build --configuration=production

FROM golang:alpine as webapi
ENV BUILD 20200112-002
RUN apk --update add git make
COPY . /homer-webapp
WORKDIR /homer-webapp
RUN make modules && make all

FROM alpine
WORKDIR /
RUN apk --update add bash sed
# Create default directories
RUN mkdir -p /usr/local/homer
COPY --from=webapi /homer-webapp/homer-webapp .
COPY --from=webapi /homer-webapp/docker/webapp_config.json /usr/local/homer/webapp_config.json
COPY --from=webapp /app/dist/homer-ui /usr/local/homer/dist
# Configure entrypoint
COPY ./docker/docker-entrypoint.sh /
COPY ./docker/docker-entrypoint.d/* /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/* /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/homer-webapp", "-webapp-config-path", "/usr/local/homer"]
