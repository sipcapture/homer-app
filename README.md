# hepic-api

## Routes
- http://localhost:8001/api/v3/auth (POST) - get JWT Web Tocken to secure API
- http://localhost:8001/api/v3/birds (GET) - get list of `public` birds
- http://localhost:8001/api/v3/birds (POST) - add a new bird
- http://localhost:8001/api/v3/birds/:id (PUT) - update specific bird 

## To run app
**ATTENTION!** If you already did the steps below some time ago but now the app doesn't start - repeat all the steps starting from step 3.

1. Install [NVM](https://github.com/creationix/nvm) `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`
2. Restart terminal
3. Get Hepic current node version `cat hepic-2/.node_version`
4. Install the node version you got in the previous step, for example `nvm install 8.9.1`.
NVM howto:
  . list all versions - `nvm ls`
  . enable certain version - `nvm use x.x.x`
  . define default version - `nvm alias default x.x.x`
5. Install MySQL. Create new user and database. Put correct MySQL database connection parameters in `knexfile.js` (for seeding) and `src/db/knex.js` (for API)
6. Install all Hepic libraries and helpers `npm install && npm install -g knex eslint eslint-plugin-html eslint-plugin-json`
7. Execute commands below to create migrations and seed default data into MySQL database:
**ATTENTION!** Go into `seeds` folder and check table names, be sure you don't overwrite or eliminate your current DB data. Do not edit or eleminate existing migrations. If you need to change/add database scheme - create a new [knex migration](http://perkframework.com/v1/guides/database-migrations-knex.html). 
```
knex migrate:latest
knex seed:run
```
8. Build app bundle by webpack `npm run build`
9. Start app `npm start` or start in the development mode `npm run dev`  

## Work with API
### Security
[JWT Web Tokens](https://jwt.io/introduction/) are used to secure API. JWT settings are in `src/private/jwt_settings.json`.

First, get JWT token.
```
curl -X POST localhost:8001/api/v3/auth \
-d "username=trex&password=password"
```
You will receive a message similiar to the following one:
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZXgiLCJzY29wZSI6ImYwM2VkZTdjLWIxMjEtNDExMi1iY2M3LTEzMGEzZTg3OTg4YyIsImlhdCI6MTUwNzUzMDc1OSwiZXhwIjoxNTA3NTM0MzU5fQ.iDkeBJfPfj-MYGdbZDZJrzuTZOcQjRKM5Qi3SxmcBts",
  "scope":"f03ede7c-b121-4112-bcc7-130a3e87988c"
}
```
This token should be included in every API request, in the header section. It will expire in 1 hour; you can set the expire value in `jwt_settings.json`.

### API Requests

List all birds:
```
curl -X GET localhost:8001/api/v3/birds
```

Add a new bird:
```
curl --header "Authorization: Bearer\
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZXgiLCJzY29wZSI6ImYwM2VkZTdjLWIxMjEtNDExMi1iY2M3LTEzMGEzZTg3OTg4YyIsImlhdCI6MTUwNzUzMDc1OSwiZXhwIjoxNTA3NTM0MzU5fQ.iDkeBJfPfj-MYGdbZDZJrzuTZOcQjRKM5Qi3SxmcBts" \
-X POST localhost:8001/api/v3/birds \
-d "name=eagle&species=aquila&picture_url=https://en.wikipedia.org/wiki/Eagle#/media/File:%C3%81guila_calva.jpg"
```

Update a bird:
```
curl --header "Authorization: Bearer\
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZXgiLCJzY29wZSI6ImYwM2VkZTdjLWIxMjEtNDExMi1iY2M3LTEzMGEzZTg3OTg4YyIsImlhdCI6MTUwNzUzMDc1OSwiZXhwIjoxNTA3NTM0MzU5fQ.iDkeBJfPfj-MYGdbZDZJrzuTZOcQjRKM5Qi3SxmcBts" \
-X PUT localhost:8001/api/v3/birds/c6e57799-9ac2-4e1a-b3ba-117c0a79a9a6 \
-d "isPublic=1&name=Eagle&species=Aquila&picture_url=https://en.wikipedia.org/wiki/Eagle#/media/File:%C3%81guila_calva.jpg"
```

### HTTPS

API natively supports HTTPS connection using TLS.
```
curl -k -X GET https://localhost:8000/api/v3/birds
```
