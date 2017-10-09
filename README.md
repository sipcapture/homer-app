# hepic-api

## Routes
- http://localhost:8080/api/v2/auth (POST) - get JWT Web Tocken to secure API
- http://localhost:8080/api/v2/birds (GET) - get list of `public` birds
- http://localhost:8080/api/v2/birds (POST) - add a new bird
- http://localhost:8080/api/v2/birds/:id (PUT) - update specific bird 

## To run
1. Install libraries `npm install`
2. Put correct MySQL connection parameters in `knexfile.js` and `src/db/knex.js` 
3. Execute migrations and insert first data into MySQL DB from `seeds` folder:
**ATTENTION!** Go into `seeds` folder and check table names, be sure you don't overwrite or eliminate your current DB data. 
```
knex migrate:latest
knex seed:run
```
4. Start app `npm start` 

## Work with API
### Security
[JWT Web Tokens](https://jwt.io/introduction/) are used to secure API. JWT settings are in `src/private/jwt_settings.json`.

First, get JWT token.
```
curl -X POST localhost:8080/api/v2/auth \
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
curl --header "Authorization: Bearer\
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZXgiLCJzY29wZSI6ImYwM2VkZTdjLWIxMjEtNDExMi1iY2M3LTEzMGEzZTg3OTg4YyIsImlhdCI6MTUwNzUzMDc1OSwiZXhwIjoxNTA3NTM0MzU5fQ.iDkeBJfPfj-MYGdbZDZJrzuTZOcQjRKM5Qi3SxmcBts" \
-X GET localhost:8080/api/v2/birds
```

Add a new bird:
```
curl --header "Authorization: Bearer\
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZXgiLCJzY29wZSI6ImYwM2VkZTdjLWIxMjEtNDExMi1iY2M3LTEzMGEzZTg3OTg4YyIsImlhdCI6MTUwNzUzMDc1OSwiZXhwIjoxNTA3NTM0MzU5fQ.iDkeBJfPfj-MYGdbZDZJrzuTZOcQjRKM5Qi3SxmcBts" \
-X POST localhost:8080/api/v2/birds \
-d "name=eagle&species=aquila&picture_url=https://en.wikipedia.org/wiki/Eagle#/media/File:%C3%81guila_calva.jpg"
```

Update a bird:
```
curl --header "Authorization: Bearer\
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRyZXgiLCJzY29wZSI6ImYwM2VkZTdjLWIxMjEtNDExMi1iY2M3LTEzMGEzZTg3OTg4YyIsImlhdCI6MTUwNzUzMDc1OSwiZXhwIjoxNTA3NTM0MzU5fQ.iDkeBJfPfj-MYGdbZDZJrzuTZOcQjRKM5Qi3SxmcBts" \
-X PUT localhost:8080/api/v2/birds/c6e57799-9ac2-4e1a-b3ba-117c0a79a9a6 \
-d "name=Eagle&species=Aquila&picture_url=https://en.wikipedia.org/wiki/Eagle#/media/File:%C3%81guila_calva.jpg"
```
