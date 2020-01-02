FROM node:12-alpine
# BUILD FORCE
ENV BUILD 77-02012020-001

RUN apk add git && git clone https://gitlab.com/qxip/hepic-ui-3 /app
WORKDIR /app
RUN npm install && npm install -g @angular/cli && ng build


# HOMER 7.7.x UI+API
FROM node:12-alpine
# BUILD FORCE
ENV BUILD 77-02012020-001

# To handle 'not get uid/gid'
RUN npm config set unsafe-perm true

RUN apk add --update git bash openssl run-parts python make g++
# ENV NODE_OPTIONS="--max_old_space_size=2048"

RUN apk add git && git clone https://github.com/sipcapture/homer-app /app
#COPY . /app
WORKDIR /app

RUN touch /app/bootstrap
RUN npm install \
 && npm install -g knex eslint eslint-plugin-html eslint-plugin-json eslint-config-google \
 && npm install -g modclean && modclean -r

COPY --from=0 /app/dist/homer-ui /app/public

# Expose Ports
EXPOSE 80

# Configure entrypoint
COPY ./docker-entrypoint.sh /
COPY ./docker-entrypoint.d/* /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/* /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "npm", "start" ]
