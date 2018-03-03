const RESOURCES = function() {
  const resource = 'http://127.0.0.1:8008';
  
  return {
    USERS_DOMAIN: resource,
    USERS_API: resource + '/users',
    BASIC_INFO: resource + '/api/info',
  };
};

export default RESOURCES;
