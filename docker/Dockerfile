# HOMER 7.0.x UI+API
FROM node:8

# BUILD FORCE
<<<<<<< HEAD
ENV BUILD 703012
=======
ENV BUILD 703013

ENV NODE_OPTIONS="--max_old_space_size=2048"
>>>>>>> 050832ebf169d169fd6901c11398951a5578bfc6

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
