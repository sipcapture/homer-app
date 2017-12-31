var injectParams = ['$q','$http','eventbus'];

var storeFactory = function ($q, $http) {
  var factory = {};

  //factory.getAll = function () {
  //  return $http.get('api/v2/dashboard/info', {handleStatus:[403,503]}).then(function (results) {
  //    return results.data;
  //  });
  //};
      
  //factory.getInfoByID = function (id) {
  //  return $http.get('api/v2/dashboard/info/'+id, {handleStatus:[403,503]}).then(function (results) {
  //    return results.data;
  //  });
  //};
      
  ///factory.get = function (id) {
  ///  return $http.get(`api/v2/dashboard/store/${id}`, { handleStatus: [ 403, 503 ] })
  ///    .then(function (response) {
  ///      return response.data.data;
  ///    })
  ///    .catch(function (error) {
  ///      throw new Error(`[storeFactory] [dashboard] [store] [get] ${JSON.stringify(error)}`);
  ///    });
  ///};
      
  //factory.menu = function (id, data) {
  //  return $http.post('api/v2/dashboard/menu/'+ id, data, {handleStatus:[403,503]}).then(function (results) {
  //    return results.data;
  //  });
  //};
      
  //factory.set = function (id, data) {
  //  return $http.post(`api/v2/dashboard/store/${id}`, data, { handleStatus: [ 403, 503 ] })
  //    .then(function (response) {
  //      return response.data;
  //    }, function (error) {
  //      throw new Error(`[storeFactory] [dashboard] [store] [set] ${JSON.stringify(error)}`);
  //    });
  //};
      
  //factory.update = function (id, data) {
  //  return $http.put('api/v2/dashboard/store/'+id, data, {handleStatus:[403,503]}).then(function (results) {
  //    return results.data;
  //  });
  //};
      
  //factory.delete = function (id) {
  //  return $http.delete('api/v2/dashboard/store/'+id, {handleStatus:[403,503]}).then(function (results) {
  //    return results.data;
  //  });
  //};
      
  return factory;
};

storeFactory.$inject = injectParams;
export default storeFactory;
