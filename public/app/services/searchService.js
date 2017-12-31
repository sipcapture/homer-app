    var searchFactory = function ($q, $http, userProfile) {
      'ngInject';


		var GEOAPI = 'http://ip-api.com/json/';
		var BLACKLISTAPI = 'https://cymon.io/api/nexus/v1/ip/';

		userProfile.getAllServerRemoteProfile();

                var searchValue = {};                                                                               
                                
                var timerange = {
			fromdate: new Date(new Date().getTime() - 300*1000),
			todate: new Date()
		};                                  

                /* actual search data */
		var searchdata = {
                        timestamp: {
			      from: new Date(new Date().getTime() - 300*1000),
                              to: new Date()
                        },
                        param: {
                          transaction: {
                              call: true,
                              registration: true,
                              rest: true
                          },
                          limit: 200
                        }
                };
                
                var setTimeRange = function (data)
                {                
                    timerange = data;                
                };
                
                var getTimeRange = function()
                {                
                    return timerange;
                };
                
                var setSearchData = function (data)
                {                
                    searchdata = data;                
                };
                
                var getSearchData = function()
                {          
                    return searchdata;
                };
                
                var setSearchValue = function (data)
                {                
                    searchValue = data;                
                };
                
                var getSearchValue = function()
                {          
                    return searchValue;
                };
                                                
                /**** CALL **/                                                
                                                
                var searchCallByParam = function (mdata) {
                
                        var defer = $q.defer();
                        
                        $http.post('api/v2/search/call/data', mdata, {handleStatus:[403,503]}).then(
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
                

                
                var searchMethod = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/search/method', data , {handleStatus:[403,503]}).then(
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
                
                var searchCallMessage = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/search/call/message', data, {handleStatus:[403,503]}).then(
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
                
                var searchCallByTransaction = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/call/transaction', data, {handleStatus:[403,503]}).then(
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
                
                /***** registration ***/
                
                var searchRegistrationByParam = function (mdata) {
                
                        var defer = $q.defer();
                        
                        $http.post('api/v2/search/registration/data', mdata, {handleStatus:[403,503]}).then(
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
                
                var searchRegistrationMessage = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/search/registration/message', data, {handleStatus:[403,503]}).then(
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
                
                var searchRegistrationByTransaction = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/registration/transaction', data, {handleStatus:[403,503]}).then(
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
                
                /***** proto ***/
                
                var searchProtoByParam = function (mdata) {
                
                        var defer = $q.defer();
                        
                        $http.post('api/v2/search/proto/data', mdata, {handleStatus:[403,503]}).then(
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
                
                var searchProtoMessage = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/search/proto/message', data, {handleStatus:[403,503]}).then(
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
                
                var searchProtoByTransaction = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/proto/transaction', data, {handleStatus:[403,503]}).then(
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
                
                
                /**** REPORT ***/
                var searchRTCPReport = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/call/report/rtcp', data, {handleStatus:[403,503]}).then(
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
                
                var searchQOSReport = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/call/report/qos', data, {handleStatus:[403,503]}).then(
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

                var searchLogReport = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/call/report/log', data, {handleStatus:[403,503]}).then(
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
                
                var searchRecordingReport = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/call/recording/data', data, {handleStatus:[403,503]}).then(
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

                var searchRtcReport = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/call/report/rtc', data, {handleStatus:[403,503]}).then(
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
                
                var searchRemoteLog = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/call/report/remotelog', data, {handleStatus:[403,503]}).then(
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
                
                var searchQualityReport = function (type, data) {
                
                        var defer = $q.defer();                        
                                                            
                        $http.post('api/v2/call/report/quality/'+type, data, {handleStatus:[403,503]}).then(
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
                
                
                var loadNode = function () {
                
                        var defer = $q.defer();
                                                            
                        $http.get('api/v2/dashboard/node', {handleStatus:[403,503]}).then(
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
                
                var makePcapTextforTransaction = function (data, type, trans) {
                
                        var defer = $q.defer();
                        
                        var url = 'api/v2/export/call/messages/';
                        if(trans == "registration") url = 'api/v2/export/registration/messages/'; 
                        else if(trans == "proto") url = 'api/v2/export/proto/messages/'; 
                                                
                        var response = {responseType:'arraybuffer', handleStatus:[403,503]};
                        if(type == 1) url+= "text";
                        else if(type == 2) {
                            url+= "cloud";
                            response = { handleStatus:[403,503]};
                        }
                        else url+="pcap";
                        
                        console.log(response);

                        $http.post(url, data, response).then(
        			/* good response */
	                    function (results) {
	        		    if(results.data.auth == "false") {				
                                        defer.reject('user not authorized');
	            		    }	
		        	    else {
                                        defer.resolve(results.data);                                                                        
                                    }
                            },
        			/* bad response */
	        		function (results) {
		        		defer.reject('bad response combination');
                                }
        		 );   
		    
        		return defer.promise;		                                                 
                };
                
                var makeReportRequest = function (data, trans) {
                
                        var defer = $q.defer();
                        
                        var url = 'api/v2/export/call/transaction/html';
                                                
                        var response = {responseType:'arraybuffer', handleStatus:[403,503]};
                        
                        console.log(response);

                        $http.post(url, data, response).then(
        			/* good response */
	                    function (results) {
	        		    if(results.data.auth == "false") {				
                                        defer.reject('user not authorized');
	            		    }	
		        	    else {
                                        defer.resolve(results.data);                                                                        
                                    }
                            },
        			/* bad response */
	        		function (results) {
		        		defer.reject('bad response combination');
                                }
        		 );   
		    
        		return defer.promise;		                                                 
                };
                
                
                var downloadRecordingPcap = function (id, type) {
                
                        var defer = $q.defer();
                        
                        var url = 'api/v2/call/recording/download/'+type+'/'+id;
                                                
                        var response = {responseType:'arraybuffer', handleStatus:[403,503]};
                        
                        $http.get(url, response).then(
        			/* good response */
	                    function (results) {
	        		    if(results.data.auth == "false") {				
                                        defer.reject('user not authorized');
	            		    }	
		        	    else {
                                        defer.resolve(results.data);                                                                        
                                    }
                            },
        			/* bad response */
	        		function (results) {
		        		defer.reject('bad response combination');
                                }
        		 );   
		    
        		return defer.promise;		                                                 
                };
                
                
                
                
                var makePcapTextData = function (data, type) {
                

                        var defer = $q.defer();
                        
                        var response = {responseType:'arraybuffer', handleStatus:[403,503]};
                        var url = 'api/v2/search/call/export/data/';
                        if(type == 1) url+= "text";
                        else if(type == 2) {
                            url+= "cloud";
                            response = { handleStatus:[403,503]};
                        }
                        else if(type == 3) {
                            url+= "count";
                            response = { handleStatus:[403,503]};
                        }
                        else url+="pcap";

                        $http.post(url, data, response).then(
        			/* good response */
	                    function (results) {
	        		    if(results.data.auth == "false") {				
                                        defer.reject('user not authorized');
	            		    }	
		        	    else {
                                        defer.resolve(results.data);                                                                        
                                    }
                            },
        			/* bad response */
	        		function (results) {
		        		defer.reject('bad response combination');
                                }
        		 );   
		    
        		return defer.promise;		                                                 
                };
                
                var createShareLink = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/search/call/sharelink', data, {handleStatus:[403,503]}).then(
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


                var searchBlacklist = function (ip) {
                
                        var defer = $q.defer();                        
                        
                        var profile = userProfile.getServerProfile("dashboard");
                        console.log("PP", profile);
                        if(profile.blacklist && profile.blacklist_url)
                        {                                                                                                                        
                                                            
                              $http.get(profile.blacklist_url+ip+'/events', {handleStatus:[403,503]}).then(
        			/* good response */
        			function (results) {
 	        		    if(!results || !results.data || results.data.count < 1) {				
                                        defer.reject('request failed');
	            		    }	
		        	    else {
					results.data.ip = ip;
                                        defer.resolve(results.data);                  
                                    }
                                 },
                                   /* bad response */
                                   function (results) {
		        		defer.reject('bad response combination');
                                   }
                                 );                                 
                                 
                           
                        }
                        else {
                           defer.reject('bad response combination');
                        }
                        
                        return defer.promise;		                                                		    
                        
                };                                

                var searchGeoLoc = function (ip) {
                
                        var profile = userProfile.getServerProfile("dashboard");
                
                        var defer = $q.defer();                        
                        
                        if(profile.geolookup && profile.geolookup_url)
                        {
                                                            
                             $http.get(profile.geolookup_url+ip, {handleStatus:[403,503],async:true}).then(
          			/* good response */
                                function (results) {
	        		    if(!results || !results.data ) {				
                                        defer.reject('request failed');
	            		    }	
		        	    else {
					// console.log('GEO-LOOKUP',ip,results);
                                        defer.resolve(results.data);                  
                                    }
                                },
        			/* bad response */
	        		function (results) {
		        		defer.reject('bad response combination');
                                }
                             );   
                        }
                        else {
                             defer.reject('bad response combination');                        
                        }
		    
        		return defer.promise;		                                                 
                };                                

		/* CUSTOM API, EXPERIMENTAL */
                var searchCustom = function (data,api) {
                
                        var profile = userProfile.getServerProfile("dashboard");
                        var defer = $q.defer();                        
			var apiurl = api;
                       	if(profile.customapi_url) { apiurl = profile.customapi_url } 
			if (!apiurl || 0 === apiurl.length) return; 
                        if(profile.customapi)
                        {
                                                            
                             $http.get(apiurl+data, {handleStatus:[403,503],async:true}).then(
          			/* good response */
                                function (results) {
	        		    if(!results || !results.data ) {				
                                        defer.reject('request failed');
	            		    }	
		        	    else {
					// console.log('GEO-LOOKUP',ip,results);
                                        defer.resolve(results.data);                  
                                    }
                                },
        			/* bad response */
	        		function (results) {
		        		defer.reject('bad response combination');
                                }
                             );   
                        }
                        else {
                             defer.reject('bad response combination');                        
                        }
		    
        		return defer.promise;		                                                 
                };                                


                var createShareLink = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('api/v2/share/link', data, {handleStatus:[403,503]}).then(
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
                
                var searchMetaDataRecording = function (id) {
                
                        var defer = $q.defer();
                                                            
                        $http.get('api/v2/call/recording/info/'+id, {handleStatus:[403,503]}).then(
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


                return {
                   searchCallByParam: searchCallByParam,
                   searchMethod: searchMethod,
                   searchCallMessage: searchCallMessage,
                   searchCallByTransaction: searchCallByTransaction,
                   searchRegistrationByParam: searchRegistrationByParam,
                   searchRegistrationMessage: searchRegistrationMessage,
                   searchRegistrationByTransaction: searchRegistrationByTransaction,                   
                   searchProtoByParam: searchProtoByParam,
                   searchProtoMessage: searchProtoMessage,
                   searchProtoByTransaction: searchProtoByTransaction,
		   createShareLink: createShareLink,
                   makePcapTextforTransaction: makePcapTextforTransaction,
                   makeReportRequest: makeReportRequest,
                   downloadRecordingPcap: downloadRecordingPcap,
                   makePcapTextData: makePcapTextData,
                   createShareLink: createShareLink,
                   getTimeRange: getTimeRange,                   
                   setTimeRange: setTimeRange,
                   getSearchData: getSearchData,                   
                   setSearchData: setSearchData,
                   getSearchValue: getSearchValue,                   
                   setSearchValue: setSearchValue,                   
                   searchValue: searchValue,
                   searchCallRTCPReport: searchRTCPReport,
                   searchQOSReport: searchQOSReport,
                   searchLogReport: searchLogReport,
                   searchRecordingReport: searchRecordingReport,
                   searchRtcReport: searchRtcReport,
                   searchRemoteLog: searchRemoteLog,
                   searchQualityReport: searchQualityReport,
                   searchBlacklist: searchBlacklist,
                   searchGeoLoc: searchGeoLoc,
                   searchMetaDataRecording: searchMetaDataRecording,
                   loadNode: loadNode
                };
    };

export default searchFactory;
