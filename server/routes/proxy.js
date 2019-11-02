import Advanced from '../classes/advanced';

export default function proxy(server, config) {
  const {host, port, protocol, path, headers} = config;

  server.route({
    method: 'GET',
    path: '/api/v3/proxy/grafana/folders',
    handler: {
      proxy: {
        mapUri: async function(req, cb) {
        
          const advancedDB = new Advanced({server});
          const advancedData = await advancedDB.getAll(['guid', 'partid', 'category', 'param', 'data']);
          let dataGrafana = advancedData.filter(item => item.param === "grafana")[0];
          let url = `${protocol}://${host}:${port}`;
          if(dataGrafana && dataGrafana.data && dataGrafana.data.host) url = dataGrafana.data.host;
          url += `/api/search?folderIds=0`;
          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });
  
   server.route({
    method: 'GET',
    path: '/api/v3/proxy/grafana/dashboards/uid/{uid}',
    handler: {
      proxy: {
        mapUri: async function(req, cb) {
          const {uid} = req.params;
          const advancedDB = new Advanced({server});
          const advancedData = await advancedDB.getAll(['guid', 'partid', 'category', 'param', 'data']);
          let dataGrafana = advancedData.filter(item => item.param === "grafana")[0];
          let url = `${protocol}://${host}:${port}`;
          if(dataGrafana && dataGrafana.data && dataGrafana.data.host) url = dataGrafana.data.host;
          url += `/api/dashboards/uid/`+uid;

          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });
  
  server.route({
    method: 'GET',
    path: '/api/v3/proxy/grafana/url',
    handler: async function(request, reply) {    
        const advancedDB = new Advanced({server});            
        const advancedData = await advancedDB.getAll(['guid', 'partid', 'category', 'param', 'data']);
        let dataGrafana = advancedData.filter(item => item.param === "grafana")[0];
        let url = {data: `${protocol}://${host}:${port}`};                
        if(dataGrafana && dataGrafana.data && dataGrafana.data.host) url = {data: dataGrafana.data.host};
        return reply(url);
    },
  });
  
  
  server.route({
    method: 'GET',
    path: '/api/v3/proxy/grafana/org',
    handler: {
      proxy: {
        mapUri: async function(req, cb) {
        
          const advancedDB = new Advanced({server});
          const advancedData = await advancedDB.getAll(['guid', 'partid', 'category', 'param', 'data']);
          let dataGrafana = advancedData.filter(item => item.param === "grafana")[0];
          let url = `${protocol}://${host}:${port}`;
          if(dataGrafana && dataGrafana.data && dataGrafana.data.host) url = dataGrafana.data.host;          
          url += `/api/org`;      

          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });

  server.route({
    method: 'POST',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    path: '/api/v3/proxy',
    handler: {
      proxy: {
        mapUri: async function(req, cb) {
        
          const advancedDB = new Advanced({server});
          const advancedData = await advancedDB.getAll(['guid', 'partid', 'category', 'param', 'data']);
          let dataGrafana = advancedData.filter(item => item.param === "grafana")[0];
          let url = `${protocol}://${host}:${port}`;
          if(dataGrafana && dataGrafana.data && dataGrafana.data.host) url = dataGrafana.data.host;          
          headers.cookie = authCookie;
          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });

  server.route({
    method: 'PUT',
    path: '/api/v3/proxy',
    handler: {
      proxy: {
        mapUri: function(req, cb) {
          let {path, headers} = req;
          path = path.replace('v3', 'v2');
          const url = `${protocol}://${host}:${port}${path}`;
          headers.cookie = authCookie;
          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });
};
