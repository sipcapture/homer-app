export default [ // to-do: deprecate it when this server API is ready
  {
    method: 'GET',
    path: '/api/v2/{param*}',
    handler: {
      proxy: {
        host: 'de3.qxip.net',
        port: 8100,
        protocol: 'http',
        passThrough: true,
        localStatePassThrough: true
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v2/{param*}',
    handler: {
      proxy: {
        host: 'de3.qxip.net',
        port: 8100,
        protocol: 'http',
        passThrough: true,
        localStatePassThrough: true
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/v2/{param*}',
    handler: {
      proxy: {
        host: 'de3.qxip.net',
        port: 8100,
        protocol: 'http',
        passThrough: true,
        localStatePassThrough: true
      }
    }
  },
];
