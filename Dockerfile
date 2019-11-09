# HOMER 7.7.x UI+API
FROM node:8-alpine

# BUILD FORCE
ENV BUILD 777777

# To handle 'not get uid/gid'
RUN npm config set unsafe-perm true

RUN apk add --update git bash openssl run-parts
ENV NODE_OPTIONS="--max_old_space_size=2048"

COPY . /app
WORKDIR /app

RUN touch /app/bootstrap
RUN npm install \
 && npm install -g knex eslint eslint-plugin-html eslint-plugin-json eslint-config-google \
 && npm install -g modclean && modclean -r

# Expose Ports
EXPOSE 80
EXPOSE 443

# Configure entrypoint
COPY /docker/docker-entrypoint.sh /
COPY /docker/docker-entrypoint.d/* /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/* /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "npm", "start" ]
