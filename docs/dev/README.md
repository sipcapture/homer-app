# Development documentation

### Node Requirments
1. Install [NVM](https://github.com/creationix/nvm) `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`
2. Restart terminal
3. Get the current Homer-App node version `cat homer-app/.node_version`
4. Install a matching node version accordingly, for example `nvm install 8.9.1`

### Build Requirements

1. Install Postgres >= 10
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

First, get JWT token. For real password check your knex import: 
https://github.com/sipcapture/homer-app/blob/master/seeds/01_Users.js#L14

```
curl -X POST localhost:80/api/v3/auth \
-d "username=admin&password=sipcapture"
```
You will receive a message similiar to the following one:
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZXgiLCJzY29wZSI6ImYwM2VkZTdjLWIxMjEtNDExMi1iY2M3LTEzMGEzZTg3OTg4YyIsImlhdCI6MTUwNzUzMDc1OSwiZXhwIjoxNTA3NTM0MzU5fQ.iDkeBJfPfj-MYGdbZDZJrzuTZOcQjRKM5Qi3SxmcBts",
  "scope":"f03ede7c-b121-4112-bcc7-130a3e87988c"
}
```
This token should be included in every API request, in the header section. It will expire in 1 hour; you can set the expire value in `jwt_settings.json`.

-------

## General
- [Troubleshooting](troubleshooting.md)

## Widget development
- [AngularJS 1.6.x](angularjs_widget_dev.md)
- [React 16.x](react_widget_dev.md)

