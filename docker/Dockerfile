# HOMER 7.0.x UI+API
FROM node:8

# BUILD FORCE
ENV BUILD 912890

# Requires HOMER7-UI Git
RUN git clone https://github.com/sipcapture/homer-app /app
WORKDIR /app
RUN npm install
RUN npm install -g knex eslint eslint-plugin-html eslint-plugin-json eslint-config-google
RUN npm install -g modclean && modclean -r
RUN npm run build

# Expose Ports
EXPOSE 80
EXPOSE 443

# Configure entrypoint
COPY /docker-entrypoint.sh /
COPY /docker-entrypoint.d/* /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/* /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "npm", "start" ]

