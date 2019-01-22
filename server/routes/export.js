import Joi from 'joi';
import Boom from 'boom';
import SearchData from '../classes/searchdata';
import Settings from '../classes/settings';
import PcapBuffer from '../classes/pcap/index';


export default function search(server) {
  server.route({
    path: '/api/v3/export/call/messages/pcap',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            id: Joi.object(),
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: async function(request, reply) {
      let userObject = request.auth.credentials;
      const searchTable = 'hep_proto_1_default';
      
      const searchdata = new SearchData(server, request.payload.param);
      //const settings = new Settings(server, userObject.username);            
      const settings = new Settings(server, "null");            
            
      try {
        const correlation = await settings.getCorrelationMap(request.payload);
                
        const data = await searchdata.getTransaction(['id', 'sid', 'protocol_header', 'data_header', 'raw'],
          searchTable, request.payload, correlation, true);
                    
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }        
        
        var pcapBuffer = new PcapBuffer(1500, 105);
        
        data.forEach(function(row) {
               //for (let k in row) { 
               //console.log("RRRRRRRRRR", k, row);        
               //};
               pcapBuffer.writePacket(row.raw, (row.timeSeconds * 1000 + row.timeUseconds*10));
       });
        
                                   
        return reply(pcapBuffer.getPacketsAndClose())
                .encoding('binary')
                .type('application/cap')
                .header('content-disposition', `attachment; filename=export-${new Date().toISOString()}.pcap;`);

      } catch (error) {
        return reply(Boom.serverUnavailable(error));
      };
    },
  });

  server.route({
    path: '/api/v3/export/call/messages/text',
    method: 'POST',
    config: {
      validate: {
        payload: {
          param: {
            id: Joi.object(),
            transaction: Joi.object(),
            limit: Joi.number().integer().min(0),
            location: Joi.object(),
            search: Joi.object(),
            timezone: Joi.object(),
          },
          timestamp: {
            from: Joi.date().timestamp().required(),
            to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: async function(request, reply) {
      let userObject = request.auth.credentials;
      const searchTable = 'hep_proto_1_default';
      
      const searchdata = new SearchData(server, request.payload.param);
      //const settings = new Settings(server, userObject.username);            
      const settings = new Settings(server, "null");            
            
      try {
        const correlation = await settings.getCorrelationMap(request.payload);
                
        const data = await searchdata.getTransaction(['id', 'sid', 'protocol_header', 'data_header', 'raw'],
          searchTable, request.payload, correlation, true);
                    
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }


        return reply(data)
                .encoding('binary')
                .type('text/plain')
                .header('content-disposition', `attachment; filename=export-${new Date().toISOString()}.txt;`);

      } catch (error) {
        return reply(Boom.serverUnavailable(error));
      };
    },
  });


  
};
