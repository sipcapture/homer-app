import {forEach, pick} from 'lodash';
import Promise from 'bluebird';

class GlobalProfile {
  constructor($http, $log, API, TimeMachine, SEARCH) {
    this.$http = $http;
    this.$log = $log;
    this.API = API;
    this.profileScope = {};
    this.loadedProfile = false;
    this.factory = {};
    this.myServerProfile = {};
    this.myProfile = pick(this.profileScope, []);
  }

  key(obj) {
    return obj.lastName + obj.firstName; // just an example
  }
          
  getProfile(key) {
    return this.getLocalProfile(key);
  }
  
  getProfileCategory(key1, key2) {
    return this.getLocalProfile(key1+':'+key2);
  }
      
  setLocalProfile(key, data) {
    this.myProfile[key] = data;
  }
      
  getLocalProfile(key) {
    return this.myProfile[key];
  }
  
  getLocalProfileCategory(key1, key2) {
    return this.myProfile[key1+':'+key2];
  }
      
  getAllRemoteProfile() {
    return this.$http.get(this.API.GLOBALPROFILE.STORE, {handleStatus: [403, 503]}).then((response) => {
      forEach(response.data.data, (value, key) => {
        let nkey=value.category+':'+value.param;
        //let nobj = JSON.parse(value.data);
        let nobj = value.data;
        this.setLocalProfile(nkey, nobj);
        this.profileScope[nkey] = nobj;
        console.log('VV', nkey);
        console.log('DD', nobj);
        this.loadedProfile = true;
        return 'yes';
      });
    });
  }
          
  getRemoteProfile(id) {
    return this.$http.get(this.API.GLOBALPROFILE.STORE+'/' + id, {handleStatus: [403, 503]}).then(function(response) {
      return response.data;
    });
  }
          
  getAll() {
    if (this.loadedProfile == true) {
      return Promise.resolve(this.loadedProfile);
    }
    return this.getAllRemoteProfile();
  }
}

export default GlobalProfile;
