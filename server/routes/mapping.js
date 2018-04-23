import Joi from 'joi';
import Boom from 'boom';
import MappingData from '../classes/mappingdata';

export default function search(server) {
  server.route({
    path: '/api/v3/mapping/protocols',
    method: 'GET',
    handler: function(request, reply) {
      const mappingdata = new MappingData(server, request.payload);
      const searchTable = "mapping_schema";
      
      mappingdata.getProtocols(searchTable).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });

  server.route({
    path: '/api/v3/mapping/fields/{id}/{transaction}',
    method: 'GET',
    handler: function(request, reply) {

      let id = encodeURIComponent(request.params.id);
      let transaction = encodeURIComponent(request.params.transaction);
      
      const mappingdata = new MappingData(server, request.payload);
      const searchTable = "mapping_schema";
      
      mappingdata.getFields(searchTable, id, transaction).then(function(data) {
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }
        return reply(data);
      }).catch(function(error) {
        return reply(Boom.serverUnavailable(error));
      });
    },
  });  
};
