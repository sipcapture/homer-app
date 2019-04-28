# HOMER 7.0.x UI+API
FROM node:8-alpine

# BUILD FORCE
ENV BUILD 703101

RUN apk add --update git bash openssl run-parts
ENV NODE_OPTIONS="--max_old_space_size=2048"

# Requires HOMER7-UI Git
RUN git clone https://github.com/sipcapture/homer-app /app
WORKDIR /app
RUN npm install \
 && npm install -g knex eslint eslint-plugin-html eslint-plugin-json eslint-config-google \
 && npm install -g modclean && modclean -r \
 && npm run build

# Expose Ports
EXPOSE 80
EXPOSE 443

# Configure entrypoint
COPY /docker-entrypoint.sh /
COPY /docker-entrypoint.d/* /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/* /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "npm", "start" ]
