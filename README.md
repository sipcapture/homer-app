<img src="https://github.com/sipcapture/homer-app/raw/master/public/img/homerseven.png" width=200 />

# homer-app

This projects provides the Front-End and Back-End components of Homer 7.x and higher

## WARNING
This is a beta release mostly intended for developers. Please refer to the Docker containers and Installation guides to try Homer 7.x

<img src="http://i.imgur.com/9AN08au.gif" width=100% height=50 >

## Docker Bundles
Getting started with HOMER Seven? <br>
The following H7 `docker-compose` bundles are available in multiple flavours with the following backends:
* [H7 + InfluxDB](https://github.com/sipcapture/homer-docker/tree/master/heplify-server/hom7-hep-influx)
* [H7 + Prometheus](https://github.com/sipcapture/homer-docker/tree/master/heplify-server/hom7-hep-prom-graf)
* [H7 + Elastic](https://github.com/sipcapture/homer-docker/tree/master/heplify-server/hom7-hep-elastic)

## Developement Build

### Node Requirments
1. Install [NVM](https://github.com/creationix/nvm) `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`
2. Restart terminal
3. Get the current Homer-App node version `cat homer-app/.node_version`
4. Install a matching node version accordingly, for example `nvm install 8.9.1`

### Build Requirements

1. Install Postgres
    * Create new user and database
```
sudo su - postgres
createuser homer --pwprompt
createdb -O homer homer_config
createdb -O homer homer_data
psql
postgres=# GRANT ALL PRIVILEGES ON DATABASE "homer_config" to homer;
postgres=# GRANT ALL PRIVILEGES ON DATABASE "homer_data" to homer;
```
    * Configure database connection parameters in `server/config.js` (API)
    * Make sure you use the correct db `connection` in `knexfile.js` (Provisioning)
2. Install the Homer-App
    * `npm install && npm install -g knex eslint eslint-plugin-html eslint-plugin-json eslint-config-google`
3. Provision migrations and defaults to database:
```
knex migrate:latest
knex seed:run
```
8. Build app bundle by webpack 
    * `npm run build`
9. Start app 
    * `npm start` or start in the development mode `npm run dev`  


##### **WARNINGS!** 
* Check the `seeds` folder to avoid overwriting or dropping existing data. 
* Do not edit or eleminate existing migrations. If you need to change/add database schema - create a new [knex migration](http://perkframework.com/v1/guides/database-migrations-knex.html). 


## API
### Authentication
[JWT Web Tokens](https://jwt.io/introduction/) are used to secure API. JWT settings are in `src/private/jwt_settings.json`.

First, get JWT token.
```
curl -X POST localhost:8001/api/v3/auth \
-d "username=admin&password=password"
```
You will receive a message similiar to the following one:
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZXgiLCJzY29wZSI6ImYwM2VkZTdjLWIxMjEtNDExMi1iY2M3LTEzMGEzZTg3OTg4YyIsImlhdCI6MTUwNzUzMDc1OSwiZXhwIjoxNTA3NTM0MzU5fQ.iDkeBJfPfj-MYGdbZDZJrzuTZOcQjRKM5Qi3SxmcBts",
  "scope":"f03ede7c-b121-4112-bcc7-130a3e87988c"
}
```
This token should be included in every API request, in the header section. It will expire in 1 hour; you can set the expire value in `jwt_settings.json`.

---

This project is part of HOMER

<img src="https://camo.githubusercontent.com/c287bf83f8d5969635b5bed047a3e70854bc1840/687474703a2f2f736970636170747572652e6f72672f646174612f696d616765732f736970636170747572655f6865616465722e706e67" width=300>

----
#### Made by Humans
This Open-Source project is made possible by actual Humans without corporate sponsors, angels or patreons.<br>
If you use this software in production, please consider supporting its development with contributions or [donations](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=donation%40sipcapture%2eorg&lc=US&item_name=SIPCAPTURE&no_note=0&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHostedGuest)

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=donation%40sipcapture%2eorg&lc=US&item_name=SIPCAPTURE&no_note=0&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHostedGuest) 
