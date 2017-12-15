/*
 * HOMER 5 UI (Xenophon)
 *
 * Copyright (C) 2011-2015 Alexandr Dubovikov <alexandr.dubovikov@gmail.com>
 * Copyright (C) 2011-2015 Lorenzo Mangani <lorenzo.mangani@gmail.com> QXIP B.V.
 * License AGPL-3.0 http://opensource.org/licenses/AGPL-3.0
 *
*/

(function (angular, hepic) {
    'use strict';

    angular.module('hepicCore', []).factory('search', [
        '$q',
	'$http',
        function ($q, $http) {
                                                                                                                

                var GEOAPI = 'http://ip-api.com/json/';
                var BLACKLISTAPI = 'https://cymon.io/api/nexus/v1/ip/';
                                             
                
                var searchMessageById = function (data) {
                
                        var defer = $q.defer();
                                                            
                        $http.post('/api/v2/search/share/message', data).then(
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
                
                 
                var searchTransactionById = function (data) {
                
                        var defer = $q.defer();

                        $http.post('/api/v2/search/share/transaction', data).then(
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
                
		var searchQualityReportById = function (type, data) {

                        var defer = $q.defer();  
                                        
                        $http.post('api/v2/share/call/report/quality/'+type, data, {handleStatus:[403,503]}).then(
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

                var makePcapTextforTransaction = function (data, type) {
                
                        var defer = $q.defer();
                        
                        var url = '/api/v2/share/export/call/messages/';
                        
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
                
                var searchRTCPReportById = function (data) {

                        var defer = $q.defer();

                        $http.post('/api/v2/share/report/rtcp', data).then(
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

                        $http.post('/api/v2/share/call/report/qos', data).then(
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

                        $http.post('/api/v2/share/call/report/log', data).then(
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
                                                            
                        $http.post('/api/v2/share/call/transaction', data, {handleStatus:[403,503]}).then(
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
                                        
                        $http.post('/api/v2/share/call/recording/data', data, {handleStatus:[403,503]}).then(
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
                        
                        var profile = {};
                        profile.blacklist = true;
                        profile.blacklist_url = BLACKLISTAPI;
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
                
                        var defer = $q.defer();                        

			var profile = {};
                        profile.geolookup = true;
                        profile.geolookup_url = GEOAPI;
                        
                        if(profile.geolookup && profile.geolookup_url)
                        {
                                                            
                             $http.get(profile.geolookup_url+ip, {handleStatus:[403,503]}).then(
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




                return {
                   searchMessageById: searchMessageById,
                   searchTransactionById: searchTransactionById,
                   makePcapTextforTransaction: makePcapTextforTransaction,
                   searchQualityReportById: searchQualityReportById,
                   searchLogReport: searchLogReport,
                   searchRTCPReport: searchRTCPReportById,
                   searchQOSReport: searchQOSReport,
                   searchBlacklist: searchBlacklist,
                   searchGeoLoc: searchGeoLoc,
		   searchRecordingReport: searchRecordingReport,
		   searchCallByTransaction: searchCallByTransaction
                };

          }
    ]);
}(angular, hepic));
