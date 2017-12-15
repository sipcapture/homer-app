/*global angular*/
import { forEach } from 'lodash';

const injectParams = ['$q','$http','eventbus','$log'];
const profileFactory = function ($q, $http) {
  var loadedProfile = false;
  var factory = {};
  var myProfile = {};
  var myServerProfile = {};
  
  var profileScope = {
    timerange: {
      from: new Date(new Date().getTime() - 900*1000),
      to: new Date()
    },
    search: {},
    transaction: {},
    prototype: {},
    result: {},
    node: {},
    timezone: {
      value: new Date().getTimezoneOffset(),
      name: 'Default'
    },
    limit: 200
  };

  factory.profileScope = profileScope;
   
  myProfile['result'] = profileScope['result'];
  myProfile['node'] = profileScope['node'];
  myProfile['transaction'] = profileScope['transaction'];
  myProfile['prototype'] = profileScope['prototype'];
  myProfile['limit'] = profileScope['limit'];
  myProfile['timerange'] = profileScope['timerange'];
  myProfile['timezone'] = profileScope['timezone'];
  myProfile['search'] = profileScope['search'];
                                                                               
  factory.key = function(obj){
    return obj.lastName + obj.firstName; // just an example
  };
          
  factory.setProfile = function (key, data) {
    console.log(key,data);
    factory.setLocalProfile(key,data);
    factory.setRemoteProfile(key,data);
  };
          
  factory.getProfile = function(key) {
    return factory.getLocalProfile(key);
  };
      
  factory.deleteProfile = function(key) {
    factory.deleteLocalProfile(key);
    factory.deleteRemoteProfile(key);
  };
     
  factory.deleteAllProfile = function() {
    factory.deleteAllRemoteProfile();
  };
  
  factory.setLocalProfile = function (key, data) {
    myProfile[key] = data;
  };
      
  factory.getLocalProfile = function(key) {
    return myProfile[key];
  };
      
  factory.deleteLocalProfile = function(key) {
    delete myProfile[key];
  };
         
  factory.getAllRemoteProfile = function () {
    return $http.get('api/v2/profile/store', { handleStatus: [ 403, 503 ] })
      .then(function(response) {
        forEach(response.data.data, function(value, key) {
          var jsonObj = JSON.parse(value);
          /* workaround for bad json date string */
          if (key == 'timerange') {
            jsonObj.from = new Date(jsonObj.from);
            jsonObj.to = new Date(jsonObj.to);
            profileScope.timerange = jsonObj;
          } else if (key == 'timezone') {
            profileScope.timezone = jsonObj;
          }
  
          factory.setLocalProfile(key, jsonObj);
          profileScope[key] = jsonObj;
          loadedProfile = true;
          return 'yes';
        });
      })
      .catch(function (error) {
        throw new Error(`[userProfile] [getAllRemoteProfile] [profile/store] ${JSON.stringify(error)}`);
      });
  };
          
  factory.getRemoteProfile = function (id) {
    return $http.get('api/v2/profile/store/' + id, {handleStatus:[403,503]})
      .then(function(response) {
        return response.data.data;
      })
      .catch(function (error) {
        throw new Error(`[userProfile] [getRemoteProfile] [profile/store] ${JSON.stringify(error)}`);
      });
  };
          
  factory.setRemoteProfile = function (id, sdata) {
    var url = 'api/v2/profile/store';
    if (id != null) {
      url = 'api/v2/profile/store/'+id;
    }
    var data = {
      id,
      param: sdata
    };
    console.log('data', data);
    
    return $http.post(url, data, {handleStatus:[403,503]})
      .then(function (results) {
        return results.data;
      })
      .catch(function (error) {
        throw new Error(`[userProfile] [setRemoteProfile] [profile/store] ${JSON.stringify(error)}`);
      });
  };
          
  factory.deleteRemoteProfile = function (id) {
    return $http.delete('api/v2/profile/store/'+id, {handleStatus:[403,503]})
      .then(function (results) {
        return results.data;
      })
      .catch(function (error) {
        throw new Error(`[userProfile] [deleteRemoteProfile] [profile/store] ${JSON.stringify(error)}`);
      });
  };

         
  factory.deleteAllRemoteProfile = function () {
    return $http.delete('api/v2/profile/store/', {handleStatus:[403,503]})
      .then(function (results) {
        return results.data;
      })
      .catch(function (error) {
        throw new Error(`[userProfile] [deleteAllRemoteProfile] [profile/store] ${JSON.stringify(error)}`);
      });
  };
                            
  factory.getAll = function() {
    var deferred = $q.defer();
    if (loadedProfile == true) {
      deferred.resolve(loadedProfile);
      return deferred.promise;
    }
    
    return $http.get('api/v2/profile/store', {handleStatus:[403,503]})
      .then(function (response) {
        console.log('LOADING');
        forEach(response.data.data, function(value,key) {
          var jsonObj = angular.fromJson(value);
          /* workaround for bad json date string */
          if (key == 'timerange') {
            jsonObj.from = new Date(jsonObj.from);
            jsonObj.to = new Date(jsonObj.to);
            profileScope.timerange = jsonObj;
          } else if (key == 'timezone') {
            if (typeof jsonObj !== 'object') {
              jsonObj = profileScope[key];
            }
          }
          
          factory.setLocalProfile(key, jsonObj);
          profileScope[key] = jsonObj;
          loadedProfile = true;
          return key;
        });
      })
      .catch(function (error){
        throw new Error(`[userProfile] [getAll] [profile/store] ${JSON.stringify(error)}`);
      });
  };
      
      
  factory.resetDashboards = function () {
    console.log('do reset dashboard');
  };
                  
  /********************** SERVER PROFILE *****************/
                  
  factory.getServerProfile = function (key) {
    return factory.getLocalServerProfile(key);
  };
      
  factory.setLocalServerProfile = function (key, data) {
    myServerProfile[key] = data;
  };
      
  factory.getLocalServerProfile = function(key) {
    return myServerProfile[key];
  };
  

  factory.getAllServerRemoteProfile = function () {
    return $http.get('api/v2/admin/profiles', {handleStatus:[403,503]})
      .then(function(response) {
        forEach(response.data.data, function(value, key){
          var jsonObj = JSON.parse(value);
          factory.setLocalServerProfile(key, jsonObj);
          return 'yes';
        });
      })
      .catch(function (error){
        throw new Error(`[userProfile] [getAllServerRemoteProfile] [admin/profiles] ${JSON.stringify(error)}`);
      });
  };
  
  factory.getRemoteProfile = function (id) {
    return $http.get('api/v2/admin/profile/' + id, {handleStatus:[403,503]})
      .then(function(response){
        return response.data.data;
      })
      .catch(function(error){
        throw new Error(`[userProfile] [getRemoteProfile] [admin/profile] ${JSON.stringify(error)}`);
      });
  };
  
  return factory;
};

profileFactory.$inject = injectParams;
export default profileFactory;
