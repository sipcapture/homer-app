/*global angular*/
import {forEach, pick} from 'lodash';
import Promise from 'bluebird';

class UserProfile {

  constructor($http) {
    this.$http = $http;
    this.profileScope = {
      timezone: {
        value: new Date().getTimezoneOffset(),
        name: 'Default'
      },
      timerange: {
        from: new Date(new Date().getTime() - 900*1000),
        to: new Date(),
        custom: 'Today'
      },
      search: {},
      transaction: {},
      prototype: {},
      result: {},
      node: {},
      limit: 200
    };
  }

  $onInit() {
    this.loadedProfile = false;
    this.factory = {};
    this.myServerProfile = {};
     
    this.myProfile = pick(this.profileScope, [
      'result',
      'node',
      'transaction',
      'prototype',
      'limit',
      'timerange',
      'timezone',
      'search'
    ]);
  }

  key(obj) {
    return obj.lastName + obj.firstName; // just an example
  }
          
  setProfile(key, data) {
    this.setLocalProfile(key,data);
    this.setRemoteProfile(key,data);
  }
          
  getProfile(key) {
    return this.getLocalProfile(key);
  }
      
  deleteProfile(key) {
    this.deleteLocalProfile(key);
    this.deleteRemoteProfile(key);
  }
     
  deleteAllProfile() {
    this.deleteAllRemoteProfile();
  }
  
  setLocalProfile(key, data) {
    this.myProfile[key] = data;
  }
      
  getLocalProfile(key) {
    return this.myProfile[key];
  }
      
  deleteLocalProfile(key) {
    delete this.myProfile[key];
  }
         
  getAllRemoteProfile() {
    return this.$http.get('api/v2/profile/store', { handleStatus: [ 403, 503 ] }).then((response) => {
      forEach(response.data.data, (value, key) => {
        var jsonObj = JSON.parse(value);
        /* workaround for bad json date string */
        if (key == 'timerange') {
          jsonObj.from = new Date(jsonObj.from);
          jsonObj.to = new Date(jsonObj.to);
          this.profileScope.timerange = jsonObj;
        } else if (key == 'timezone') {
          this.profileScope.timezone = jsonObj;
        }
  
        this.setLocalProfile(key, jsonObj);
        this.profileScope[key] = jsonObj;
        this.loadedProfile = true;
        return 'yes';
      });
    });
  }
          
  getRemoteProfile(id) {
    return this.$http.get('api/v2/profile/store/' + id, {handleStatus:[403,503]}).then(function(response) {
      return response.data.data;
    });
  }
          
  setRemoteProfile(id, sdata) {
    var url = 'api/v2/profile/store';
    if (id != null) {
      url = 'api/v2/profile/store/'+id;
    }
    var data = {
      id,
      param: sdata
    };
    console.log('data', data);
    
    return this.$http.post(url, data, {handleStatus:[403,503]}).then(function (results) {
      return results.data;
    });
  }
          
  deleteRemoteProfile(id) {
    return this.$http.delete('api/v2/profile/store/'+id, {handleStatus:[403,503]}).then(function (results) {
      return results.data;
    });
  }
         
  deleteAllRemoteProfile() {
    return this.$http.delete('api/v2/profile/store/', {handleStatus:[403,503]}).then(function (results) {
      return results.data;
    });
  }
                            
  getAll() {
    if (this.loadedProfile == true) {
      return Promise.resolve(this.loadedProfile);
    }
    
    return this.$http.get('api/v2/profile/store', {handleStatus:[403,503]}).then((response) => {
      console.log('LOADING');
      forEach(response.data.data, (value,key) => {
        var jsonObj = angular.fromJson(value);
        /* workaround for bad json date string */
        if (key == 'timerange') {
          jsonObj.from = new Date(jsonObj.from);
          jsonObj.to = new Date(jsonObj.to);
          this.profileScope.timerange = jsonObj;
        } else if (key == 'timezone') {
          if (typeof jsonObj !== 'object') {
            jsonObj = this.profileScope[key];
          }
        }
        
        this.setLocalProfile(key, jsonObj);
        this.profileScope[key] = jsonObj;
        this.loadedProfile = true;
        return key;
      });
    });
  }
      
      
  resetDashboards() {
    console.log('do reset dashboard');
  }
                  
  /********************** SERVER PROFILE *****************/
                  
  getServerProfile(key) {
    return this.getLocalServerProfile(key);
  }
      
  setLocalServerProfile(key, data) {
    this.myServerProfile[key] = data;
  }
      
  getLocalServerProfile(key) {
    return this.myServerProfile[key];
  }
  

  getAllServerRemoteProfile() {
    return this.$http.get('api/v2/admin/profiles', {handleStatus:[403,503]}).then((response) => {
      forEach(response.data.data, (value, key) => {
        var jsonObj = JSON.parse(value);
        this.setLocalServerProfile(key, jsonObj);
        return 'yes';
      });
    });
  }
  
  //getRemoteProfile(id) { // to-do: find out why duplicate method is here
  //  return this.$http.get('api/v2/admin/profile/' + id, {handleStatus:[403,503]}).then((response) => {
  //    return response.data.data;
  //  });
  //}
}

export default UserProfile;
