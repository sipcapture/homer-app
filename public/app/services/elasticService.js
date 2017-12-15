    var injectParams = ['$q','$location','$http','eventbus'];
    
    var elasticFactory = function ($q, $location, $http, eventbus) {

                var client = null;
                var hostPort = "";
                var httpAuth = "";
                var apiVersion = "";                
                var factory = {};
                
                factory.initConnect = function(hostPort, httpAuth, apiVersion)
                {
                        if(client == null) 
                        {        
                                console.log("jopa");;        
                                this.hostPort = hostPort;
                                this.httpAuth = httpAuth;
                                this.apiVersion = apiVersion;
                                console.log(hostPort);
                                
                                client = elasticsearch({ 
                                         host: {
						protocol: 'http',
						host: 'de3.qxip.net',
						port: 8000,
						auth: 'admin:elasticFence'
					},
                                        log: 'trace'                                        
                                });
                                return true;                                
                        }
                        
                        return false;
                };

                factory.search = function(term, offset){
	            var deferred = $q.defer();
        		    var query = {
		                "match": {
                		    "_all": term
		                }
		            };
		            
	            client.count({
        	        "index": 'pcapture_*'        	                	                            
	            }).then(function(result) {
        	        var hits_out = [];
	                deferred.resolve(hits_out);
	            }, deferred.reject);

        	    return deferred.promise;
	        };
	        
	        factory.searchData = function(){
	            var deferred = $q.defer();
        		    var query = {
		                bool: {
                		    filter: [
                		    {  
             				  range:{  
						"@timestamp":{  
							gte:"1495006439720",
							lte:"1495010039720",
					                format:"epoch_millis"
						}
					  }
				    }, {  
					query_string:{  
				              analyze_wildcard:true,
					      query:"*"
  					}
				    }]
		                }
		            };

			    var aggs = {
				 "3":{  
				      histogram:{  
					interval:1000,
					field:"@timestamp",
				        min_doc_count:1
				      },
				      aggs:{  
					"1":{  
				  	    avg:{  
			                 	field:"@number"
				            }
				        }
				      }
				}

			    };

                    var gid = 10;
                    console.log(query);
                    console.log(aggs);
	            client.search({
	                index:"pcapture_gid" + gid + "-" + new Date().toISOString().replace(new RegExp('-', 'g') , '.').split('T')[0],
	                ignore_unavailable:true,
	                search_type:"query_then_fetch",
	                size: 0,
	                query: query,
	                aggs: {
	                    "3": {
	                        histogram: {
	                            interval:1000
        	                }
        	            }        	                
	                }
	            }).then(function(result) {
	                deferred.resolve(result);
	            }, deferred.reject);

        	    return deferred.promise;
	        };
	        
	        factory.mapping = function(){
	            var deferred = $q.defer();
		    var gid = 10;
		            
	            client.indices.getMapping({
        	        index:"pcapture_gid" + gid + "-" + new Date().toISOString().replace(new RegExp('-', 'g') , '.').split('T')[0]
	            }).then(function(result) {
	                deferred.resolve(result);
	            }, deferred.reject);

        	    return deferred.promise;
	        };

                return factory;

    };

    elasticFactory.$inject = injectParams;
export default elasticFactory;
