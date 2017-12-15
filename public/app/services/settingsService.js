    var injectParams = ['$q','$http','eventbus'];

    var settingsFactory = function ($q, $http, eventbus) {

        var factory = {};

	factory.settingsGetUser = function () {
	       var defer = $q.defer();
                        
                        $http.post('api/v2/settings/user/profile', mdata, {handleStatus:[403,503]}).then(
        			/* good response */
	                    function (results) {
	        		    if(results.data.auth == "false") {				
                                        defer.reject('user not authorized');
	            		    }	
		        	    else {
                                        defer.resolve(results.data.data);                                                                        
                                    }
                            },
        			/* bad response */
	        		function (results) {
		        		defer.reject('bad response combination');
                                }
        		 );   
		    
                return defer.promise;		                                                 

        };

        factory.settingsGetUserTmp = function () {
                var defer = $q.defer();

                var results = {};
                results.auth = true;
                        
                defer.resolve(results);                                                                        
		    
        	return defer.promise;		                                                             
        };
                                             
        return factory;
    };

    settingsFactory.$inject = injectParams;
export default settingsFactory;
