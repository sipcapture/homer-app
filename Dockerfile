FROM node:16-alpine as webapp
ENV BUILD 20220211-001
RUN apk add git && git clone https://github.com/sipcapture/homer-ui /app
WORKDIR /app
RUN npm install && npm install -g @angular/cli && npm run build

FROM golang:alpine as webapi
ENV BUILD 20220211-001
RUN apk --update add git make
COPY . /homer-app
WORKDIR /homer-app
RUN make modules && make all

FROM alpine
WORKDIR /
RUN apk --update add bash sed
# Create default directories
RUN mkdir -p /usr/local/homer
COPY --from=webapi /homer-app/homer-app .
COPY --from=webapi /homer-app/docker/webapp_config.json /usr/local/homer/etc/webapp_config.json
COPY --from=webapi /homer-app/swagger.json /usr/local/homer/etc/swagger.json
COPY --from=webapp /app/dist/homer-ui /usr/local/homer/dist
# Configure entrypoint
COPY ./docker/docker-entrypoint.sh /
COPY ./docker/docker-entrypoint.d/* /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/* /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/homer-app", "-webapp-config-path=/usr/local/homer/etc"]
