import Joi from 'joi';
import Boom from 'boom';
import SearchData from '../classes/searchdata';
import Settings from '../classes/settings';
import PcapBuffer from '../classes/pcap/index';
import TextBuffer from '../classes/pcap/textbuffer';
import Alias from '../classes/alias';


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
      // let userObject = request.auth.credentials;
      const searchTable = 'hep_proto_1_default';
      
      const searchdata = new SearchData(server, request.payload.param);
      // const settings = new Settings(server, userObject.username);
      const settings = new Settings(server, 'null');
            
      try {
        const correlation = await settings.getCorrelationMap(request.payload);
                
        const data = await searchdata.getTransaction(['id', 'sid', 'protocol_header', 'data_header', 'raw'],
          searchTable, request.payload, correlation, true);
                    
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }
        
        let pcapBuffer = new PcapBuffer(1500, 1);
        
        data.forEach(function(row) {
          // for (let k in row) {
          // console.log("FULL", row);
          //};
          // src_ip, src_port, dst_ip, dst_port
          pcapBuffer.writePacket({
            protocol: row.protocol_header.protocol ? row.protocol_header.protocol : row.data_header.protocol,
            sourceIp: row.protocol_header.srcIp ? row.protocol_header.srcIp : row.data_header.srcIp,
            sourcePort: row.protocol_header.srcPort ? row.protocol_header.srcPort : row.data_header.srcPort,
            destinationIp: row.protocol_header.dstIp ? row.protocol_header.dstIp : row.data_header.dstIp,
            destinationPort: row.protocol_header.dstPort ? row.protocol_header.dstPort : row.data_header.dstPort,
            data: row.raw,
            timestamp: (row.timeSeconds * 1000 + row.timeUseconds*10),
          });
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
      // let userObject = request.auth.credentials;
      const searchTable = 'hep_proto_1_default';
      
      const searchdata = new SearchData(server, request.payload.param);
      // const settings = new Settings(server, userObject.username);
      const settings = new Settings(server, 'null');
            
      try {
        const correlation = await settings.getCorrelationMap(request.payload);
                
        const data = await searchdata.getTransaction(['id', 'sid', 'protocol_header', 'data_header', 'raw'],
          searchTable, request.payload, correlation, true);
                    
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }
        
        let textBuffer = new TextBuffer();
        
        data.forEach(function(row) {
          // console.log("FULL", row);
          // src_ip, src_port, dst_ip, dst_port
          textBuffer.writePacket({
            protocol: row.protocol_header.protocol ? row.protocol_header.protocol : row.data_header.protocol,
            sourceIp: row.protocol_header.srcIp ? row.protocol_header.srcIp : row.data_header.srcIp,
            sourcePort: row.protocol_header.srcPort ? row.protocol_header.srcPort : row.data_header.srcPort,
            destinationIp: row.protocol_header.dstIp ? row.protocol_header.dstIp : row.data_header.dstIp,
            destinationPort: row.protocol_header.dstPort ? row.protocol_header.dstPort : row.data_header.dstPort,
            data: row.raw,
            timestamp: (row.timeSeconds * 1000 + row.timeUseconds*10),
          });
        });
        
        
        return reply(textBuffer.getPacketsAndClose())
          .encoding('binary')
          .type('text/plain')
          .header('content-disposition', `attachment; filename=export-${new Date().toISOString()}.txt;`);
      } catch (error) {
        return reply(Boom.serverUnavailable(error));
      };
    },
  });

  server.route({
    path: '/api/v3/export/call/data/pcap',
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
      const aliasDB = new Alias({server});
      const aliasRowData = await aliasDB.getAll(['guid', 'alias', 'ip', 'port', 'mask', 'captureID', 'status']);
      const aliasData = {};
      aliasRowData.forEach(function(row) {
            aliasData[row.ip+":"+row.port] = row.alias;
      });

      console.log("AAL", aliasData);

      const searchdata = new SearchData(server, request.payload.param);
      const searchTable = 'hep_proto_1_default';
      try {
        const data = await searchdata.getSearchData(
          ['id', 'sid', 'protocol_header', 'data_header', 'raw'],
          searchTable, request.payload, aliasData
        );
        if (!data) {
          return reply(Boom.notFound('data was not found'));
        }

        let pcapBuffer = new PcapBuffer(1500, 1);

        data.data.forEach(function(row) {
          pcapBuffer.writePacket({
            protocol: row.protocol,
            sourceIp: row.srcIp,
            sourcePort: row.srcPort,
            destinationIp: row.dstIp,
            destinationPort: row.dstPort,
            data: row.raw,
            timestamp: (row.timeSeconds * 1000 + row.timeUseconds*10),
          });
        });

        return reply(pcapBuffer.getPacketsAndClose())
          .encoding('binary')
          .type('application/cap')
          .header('content-disposition', `attachment; filename=export-${new Date().toISOString()}.pcap;`);
      } catch (error) {
        return reply(Boom.serverUnavailable(error));
      }
    },
  });

};
