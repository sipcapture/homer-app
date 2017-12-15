import { forEach } from 'lodash';    
    var injectParams = ['$http', '$rootScope','eventbus', '$q', 'EVENTS'];

    var adminFactory = function ($http, $rootScope, eventbus, $q, EVENTS) {

        var serviceBase = '/api/v2/',
            factory = {
            };

         /* USERS */
	factory.getUsers = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/account/user').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};

	factory.updateUser = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/admin/account/user', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        factory.createUser = function (profile) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/account/user', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        factory.updatePassword = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/admin/account/password', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        factory.deleteUser = function (id) {

                   var defer = $q.defer();

                   $http.delete('api/v2/admin/account/'+id, {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        /********************** CAPTAGENT **************************/

	factory.getCaptagents = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/captagent').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
	
	factory.createCaptagent = function (profile) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/captagent', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


	factory.updateCaptagent = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/admin/captagent', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        
        factory.deleteCaptagent = function (id) {

                   var defer = $q.defer();

                   $http.delete('api/v2/admin/captagent/'+id, {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        /********************** INTERCEPTION **************************/

	factory.getInterceptions = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/interception').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
	
	factory.createInterception = function (profile) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/interception', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


	factory.updateInterception = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/admin/interception', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        
        factory.deleteInterception = function (id) {

                   var defer = $q.defer();

                   $http.delete('api/v2/admin/interception/'+id, {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        /********************** ALARM GroupIP **************************/

	factory.getGroupIPs = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/groupip').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
	
	factory.createGroupIP = function (profile) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/groupip', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


	factory.updateGroupIP = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/admin/groupip', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        
        factory.deleteGroupIP = function (id) {

                   var defer = $q.defer();

                   $http.delete('api/v2/admin/groupip/'+id, {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        /********************** ALARM KEYS **************************/

	factory.getAlarmKeysAll = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/alarmkey/all').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
        
        /********************** ALARM RECORD **************************/

	factory.getAlarmRecords = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/alarm/record').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
	
	factory.createAlarmRecord = function (profile) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/alarm/record', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


	factory.updateAlarmRecord = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/admin/alarm/record', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        
        factory.deleteAlarmRecord = function (id) {

                   var defer = $q.defer();

                   $http.delete('api/v2/admin/alarm/record/'+id, {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };

        /********************** ALARM Profile **************************/

	factory.getAlarmProfiles = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/alarm/profile').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
	
	factory.createAlarmProfile = function (profile) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/alarm/profile', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


	factory.updateAlarmProfile = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/admin/alarm/profile', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        
        factory.deleteAlarmProfile = function (id) {

                   var defer = $q.defer();

                   $http.delete('api/v2/admin/alarm/profile/'+id, {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


        /********************** ALIASES  **************************/

	factory.getAliases = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/alias').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
	
	factory.createAlias = function (profile) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/alias', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


	factory.updateAlias = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/admin/alias', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        
        factory.deleteAlias = function (id) {

                   var defer = $q.defer();

                   $http.delete('api/v2/admin/alias/'+id, {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


        
        /********************** TCSCRIPT **************************/

	factory.getTCScript = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/script/tc').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
	
	factory.uploadTCScript = function (data) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/script/tc', data).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        factory.reloadTCScript = function (id) {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/script/reload/tc', {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        /********************** NCSCRIPT **************************/

	factory.getNCScript = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/script/nc').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};
	
	factory.uploadNCScript = function (data) {

                   var defer = $q.defer();

                   $http.post('api/v2/admin/script/nc', data).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        factory.reloadNCScript = function (id) {

                   var defer = $q.defer();

                   $http.get('api/v2/admin/script/reload/nc', {}).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };

        /* Server settings */
        
    factory.getAllRemoteProfile = function () {
        const myServerProfile = {};
        return $http.get('api/v2/admin/profiles', { handleStatus: [ 403, 503 ] })
            .then(function(data) {
                forEach(data.data, function(value,key) {
                    var jsonObj = JSON.parse(value);
                    myServerProfile[key] =  jsonObj;
                });
                return myServerProfile;
            })
            .catch(function (error){
                throw new Error(`[adminService] [getAllRemoteProfile] [admin/profiles] ${JSON.stringify(error)}`);
            });
    };
                    
    factory.getRemoteProfile = function (id) {
        var myServerProfile = {};
        return $http.get('api/v2/admin/profile/' + id, {handleStatus:[403,503]})
            .then(function(data) {
                forEach(data.data, function (value, key) {
                    var jsonObj = JSON.parse(value);
                    myServerProfile[key] = jsonObj;
                    return myServerProfile;
                });
            })
            .catch(function (error) {
                throw new Error(`[adminService] [getReomoteProfile] [admin/profile] ${JSON.stringify(error)}`);
            });
    };
                
        factory.setRemoteProfile = function (id, sdata)
        {
                        var url = "api/v2/admin/profile/"+id;
                        
                        var data = { id: id, param: sdata }                                             
                        console.log("data", data);

                        var defer = $q.defer();
                        $http.post(url, data, {handleStatus:[403,503]}).then(
                                /* good response */
                            function (results) {                                
                                defer.resolve(results.data);
                            },
                            /* bad response */
                            function (results) {
                                defer.reject();
                            }
                         );
                        return defer.promise;
        };
                
        factory.deleteRemoteProfile = function (id, data)
        {

                        var defer = $q.defer();
                        $http.delete('api/v2/admin/profile/'+id, {handleStatus:[403,503]}).then(
                                /* good response */
                            function (results) {
                                defer.resolve(results.data);
                            },
                            /* bad response */
                            function (results) {
                                defer.reject();
                            }
                         );
                        return defer.promise;
        };
               
        return factory;
                
    };

    adminFactory.$inject = injectParams;
export default adminFactory;
