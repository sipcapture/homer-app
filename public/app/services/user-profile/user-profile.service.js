import {forEach, pick} from 'lodash';
import Promise from 'bluebird';

class UserProfile {
  constructor($http, $log, API, TimeMachine) {
    this.$http = $http;
    this.$log = $log;
    this.API = API;
    this.TimeMachine = TimeMachine;
    this.profileScope = {
      search: {},
      timerange: this.TimeMachine.getTimerange(),
      timezone: this.TimeMachine.getTimezone(),
      transaction: {},
      prototype: {},
      result: {},
      node: {},
      limit: 200,
    };
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
      'search',
    ]);
  }

  key(obj) {
    return obj.lastName + obj.firstName; // just an example
  }
          
  setProfile(key, data) {
    this.setLocalProfile(key, data);
    this.setRemoteProfile(key, data);
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
    return this.$http.get(this.API.PROFILE.STORE, {handleStatus: [403, 503]}).then((response) => {
      forEach(response.data, (value, key) => {
        if (key === 'timerange') {
          value.from = value.from;
          value.to = value.to;
          this.TimeMachine.setTimerange(value);
          // this.profileScope.timerange = jsonObj; // to-do: it is reference to the old code, delete it during the final review
        } else if (key === 'timezone') {
          this.TimeMachine.setTimezone(value);
          // this.profileScope.timezone = jsonObj; // to-do: it is reference to the old code, delete it during the final review
        }

        this.setLocalProfile(key, value);
        this.profileScope[key] = value;
        this.loadedProfile = true;
        return 'yes';
      });
    });
  }
          
  getRemoteProfile(id) {
    return this.$http.get(this.API.PROFILE.STORE+'/' + id, {handleStatus: [403, 503]}).then(function(response) {
      return response.data;
    });
  }
          
  setRemoteProfile(id, sdata) {
    let url = this.API.PROFILE.STORE;
    if (id != null) {
      url = this.API.PROFILE.STORE+'/'+id;
    }
    const data = {
      id,
      param: sdata,
    };
    console.log('data', data);
    
    return this.$http.post(url, data, {handleStatus: [403, 503]}).then(function(results) {
      return results.data;
    });
  }
          
  deleteRemoteProfile(id) {
    return this.$http.delete(this.API.PROFILE.STORE+'/'+id, {handleStatus: [403, 503]}).then(function(results) {
      return results.data;
    });
  }
         
  deleteAllRemoteProfile() {
    return this.$http.delete(this.API.PROFILE.STORE+'/', {handleStatus: [403, 503]}).then(function(results) {
      return results.data;
    });
  }
                            
  getAll() {
    if (this.loadedProfile == true) {
      return Promise.resolve(this.loadedProfile);
    }
    return this.getAllRemoteProfile();
  }
      
  resetDashboards() {
    console.log('do reset dashboard');
  }
                  
  // SERVER PROFILE *****************/
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
    return this.$http.get(this.API.ADMIN.PROFILES, {handleStatus: [403, 503]}).then((response) => {
      forEach(response.data, (value, key) => {
        let obj;
        try {
          obj = JSON.parse(value);
        } catch (err) {
          this.$log.warn(['UserProfile', 'getAllServerRemoteProfile', `fail to parse response data value: ${value}`], err);
        }
        this.setLocalServerProfile(key, obj);
        return 'yes';
      });
    });
  }
}

export default UserProfile;
