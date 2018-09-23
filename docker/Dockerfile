# HOMER 7.0.x UI+API
FROM node:8

# BUILD FORCE
ENV BUILD 702003

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
