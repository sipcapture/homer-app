define(['app'], function(app) {

    /* settings */
    app.dashboard.widget('quickbox', {
        title: 'Boxed Stats',
        group: 'Charts',
        name: 'quickbox',
        description: 'Data in a Box',
        templateUrl: 'widgets/quickbox/quickbox.html',
        controller: 'quickboxController',
        controllerAs: 'quickbox',
        refresh: true,                
        sizeX: 1,
        sizeY: 1,
        config: {
            title: "Boxed Statistics",
            chart: {},
            dataquery: {},
            panel: {
                queries:[]
            }
        },
        edit: {
            controller: 'quickboxEditController',
            templateUrl: 'widgets/quickbox/edit.html'
        },
        api: { }
    });

   /*SERVICE*/
   var injectquickboxParams = ['$q', '$http', 'CONFIGURATION'];
   var quickboxFactory = function($q, $http, CONFIGURATION) {

       var factory = {};
       factory.get = function(config, path, objQuery) {
           var deferred = $q.defer();
           var url = CONFIGURATION.APIURL + path;
           try {
               if (!objQuery.timestamp) {
                   deferred.reject();
                   return deferred.promise;
               }
           } catch (e) {
               deferred.reject();
               return deferred.promise;
           }

           $http.post(url, objQuery).success(function(data) {
               // console.log(data);
               //config.debugresp = JSON.stringify(data);
               config.debugresp = "";
               if (data && data.status) {
                   var status = data.status;
                   if (status == "ok") {
                       deferred.resolve(data.data);
                   } else {
                       deferred.reject(data.data);
                   }
               }
           }).error(function() {
               deferred.reject();
           });

           return deferred.promise;
       };

       return factory;
   };

   quickboxFactory.$inject = injectquickboxParams;
   app.register.factory('quickboxService', quickboxFactory);


   /*** Controller ***/
   var injectquickboxChartsParams = ['$scope', '$timeout', '$q', 'userProfile','$rootScope', 'eventbus', '$interval', '$uibModal', 'quickboxService','EVENTS', 'DATASOURCES', 'CONFIGURATION'];
   var quickboxChartController = function($scope, $timeout, $q, userProfile, $rootScope, eventbus, $interval, $uibModal, quickboxService, EVENTS, DATASOURCES, CONFIGURATION) {

        function parseDate(input) {
            return input * 1e3;
        }

        var rangeDate = {};
        var data = {};
        var sipdata = {};
    
        $scope.boxEnabled = false;        
        
        /* Chart options */
        $scope.metricsdatasources = DATASOURCES.DATA;

        if (!$scope.config) $scope.config = {};
        var fields = $scope.config.panel ? $scope.config.panel.filters : [];
	
        /* MAIN FUNCTIONS */
        
        $scope.init = function(config, api) {
            console.log("INIT ===> ", config);
            $scope.config = config;
            if (!$scope.config) $scope.config = {};
            // console.log($scope);
            if (!$scope.config.fields) {};
            if (!$scope.config.title) $scope.config.title = " Quick Box";
            // console.log($scope.config);
            $scope.fields = $scope.config.fields;
            /* api */
            api.resizeStart = resizeStart;
            api.resizeStop = resizeStop;
            api.resizeUpdate = resizeUpdate;
            api.refresh = refresh;

            createData();

        };
        
        $scope.openSettings = function(widget) {

            var config = widget.config;
            // console.log("openSETTINGS");
            var modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: widget.edit.templateUrl,
                controller: widget.edit.controller,
                resolve: {
                    config: function() {
                        return config;
                    }
                }
            });

            modalInstance.result.then(function(config) {
                $scope.config = config;                
                widget.config = config;
                $scope.fields = $scope.config.fields;
                createData();                            
            });
        };
        
        $scope.refreshWidget = function() {        
        
            refresh();
        };

        $scope.remove = function(widget) {
        
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            
        };

        /* API FUNCTION */        
        function refresh() {
            // console.log("REFRESH iT");
            applyData();                
        };
                
        function resizeStart() { 
            // console.log("RESIZE START");
        };
        
        function resizeUpdate() {
            // console.log("RESIZE UPDATE");
        };                
        
        function resizeStop() {
                    // console.log("RESIZE STOP");
        };                                

	angular.element(window).on('resize', function(e){
            // console.log("RESIZE ON");
	});
	
	$scope.$on('gridster-item-initialized', function(item) {
	    // console.log("LOADED");	    
        });	                                           
        

        /******************************** [PREPARING CHART DATA]  *******************************************/


        function queryBuilder(qvr, filters, limit, total) { 

              var query = JSON.parse(qvr);

              var timedate = userProfile.getProfile("timerange");
              var filters = filters;
              var filterParams = [];    

              var queries = $scope.config.panel.queries;
              var dataQ = $scope.config.dataquery.data;
              var queryParams = [];
    
              var timezone = userProfile.getProfile("timezone");                
              var diff = (new Date().getTimezoneOffset() - timezone.value) * 60 * 1000;
    
              // console.log(queries);
              // console.log(dataQ);
                    
               query.timestamp.from = timedate.from.getTime() - diff;
               query.timestamp.to = timedate.to.getTime() - diff;

               query.param.limit = limit;
               query.param.total = total;
               query.param.query = [];

               return query;
        };

        /* HERE WE CALL IT FIRST TIME OR ON Engine/Chart change */
        function loadNewChart(sipdata) {
                
            var config = $scope.config;
            /* DRAW DATA */
            if (config) {            
                // console.log('BoxConfig',config);
                $scope.boxEnabled = true;     
                // console.log('BoxData',sipdata);
		// start here
                quickboxDraw($scope, "value", sipdata);
            }
        };
        
        /* ONLY APPLY NEW DATA */
        function loadDataChart(sipdata) {
                
            var config = $scope.config;
            /* DRAW DATA */
            if (config) {            
                // console.log(config);
                $scope.boxEnabled = true;     
                // console.log(sipdata);
                quickboxPrepareData("value", sipdata);
            }
        };
                
        function dataBuilder(dobj) { 

                var dataRequest = {};
                // console.log(dobj);
                var obj = {};
                    
                if (typeof dobj == 'object') 
                {
                
			if(dobj.hasOwnProperty("main"))
			{
				obj["main"] = dobj["main"].value;
			}
			
			if(dobj.hasOwnProperty("value"))
			{
				obj["value"] = dobj["value"];
			}

			if(dobj.hasOwnProperty("type"))
			{
				var daz = [];
				angular.forEach(dobj["type"], function(tobj, tkey) {
					daz.push(tobj["value"]);
				});

				obj["type"] = daz;
			}		
                }

                return obj;
        };
        
        
        function createData() 
        {      
            var config = $scope.config;
            
            // console.log(config);
                      
            if(config.dataquery && config.dataquery.data) 
            {
                var quickboxobjQuery = {};            
                var quickboxobjParam = {};
            
                for(var i = 0; i < config.dataquery.data.length; i++) {                            
            
                    var myData = config.dataquery.data[i];
                    // console.log("OB",myData);
                    // console.log("RR",config.panel.queries[i]);
                    var dalias = config.panel.queries[i].type.alias;
                    // console.log("ZZ",DATASOURCES.DATA[dalias]);
                    if(dalias == "sipcapture")
                    {
                        if(angular.equals(quickboxobjQuery, {}))
                        {                    
                            var dDD = DATASOURCES.DATA[dalias];
                            var sum = false;
                            if(config.dataquery.data[i]["sum"]) sum = config.dataquery.data[i]["sum"];
                            
                            quickboxobjQuery = queryBuilder(dDD.settings.query, "", dDD.settings.limit, sum);                        
                            quickboxobjParam.path = dDD.settings.path;
                        };                            
                        // console.log("FF", quickboxobjQuery);  
                        var nData = dataBuilder(myData);
                        quickboxobjQuery.param.query.push(nData);                                                
                    }
                };

                if(!angular.equals(quickboxobjQuery, {})) {
                    // console.log(quickboxobjQuery);                        
                    quickboxService.get(config, quickboxobjParam.path, quickboxobjQuery).then(function(sdata) {
                            // console.log("RELOADING",sdata);
                            loadNewChart(sdata);
                    }, function(sdata) {
                        // console.log("data", sdata);                        
                        return;
                    });
                };
            };                        
        };
        
        function applyData() 
        {      
            var config = $scope.config;
                      
            if(config.dataquery && config.dataquery.data) 
            {
                var quickboxobjQuery = {};            
                var quickboxobjParam = {};
            
                for(var i = 0; i < config.dataquery.data.length; i++) {                            
            
                    var myData = config.dataquery.data[i];
                    var dalias = config.panel.queries[i].type.alias;
                    if(dalias == "sipcapture")
                    {
                        if(angular.equals(quickboxobjQuery, {}))
                        {                    
                            var dDD = DATASOURCES.DATA[dalias];
                            var sum = false;
                            if(config.dataquery.data[i]["sum"]) sum = config.dataquery.data[i]["sum"];
                            
                            quickboxobjQuery = queryBuilder(dDD.settings.query, "", dDD.settings.limit, sum);                        
                            quickboxobjParam.path = dDD.settings.path;
                        };                            
                        
                        var nData = dataBuilder(myData);
                        quickboxobjQuery.param.query.push(nData);                                                
                        // console.log("NEW DATA", nData);
                    }
                };

                if(!angular.equals(quickboxobjQuery, {})) {
                    // console.log(quickboxobjQuery);                        
                    quickboxService.get(config, quickboxobjParam.path, quickboxobjQuery).then(function(sdata) {
                            // console.log("RELOADING",sdata);
                            loadDataChart(sdata);
                    }, function(sdata) {
                        // console.log("data", sdata);                        
                        return;
                    });
                };
            };                        
        };
                      
            
	/******************* CHECK OF TYPE *****************/

        function quickboxDraw ($scope, type, data) {
                console.log('Sum Mode?',$scope.config.dataquery.data[0].sum);
		$scope.summode = $scope.config.dataquery.data[0].sum ? $scope.config.dataquery.data[0].sum : false;

		if ($scope.summode) {
	                var customData = data;
			console.log('pass-data',customData);
	                $scope.data = customData;                

		} else {
			data[0].stats = {};
			data[0].reduce(function(a, b) { 
				if (!data[0].stats[b.countername]) {
					data[0].stats[b.countername] = { sum: 0, tot: 0}; 
				}
					data[0].stats[b.countername].sum += b.value; 
					data[0].stats[b.countername].tot ++; 
			},0);
			console.log('custom-data',data);
	                $scope.data = data;                
		}

        };
        
        function quickboxPrepareData (type, data) {
                // console.log(type);
                var customData = data;
                $scope.data = customData;                
        };

    };

    quickboxChartController.$inject = injectquickboxChartsParams;
    app.register.controller('quickboxController', quickboxChartController);

    /* EDIT */
    var injectquickboxEditSettingsParams = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'config', '$http', 'userProfile', 'DATASOURCES', 'CONFIGURATION'];
    var quickboxEditController = function($scope, $timeout, $rootScope, $uibModalInstance, config, $http, userProfile, DATASOURCES, CONFIGURATION) {

        var counter = 0;

        $scope.panel = {};
                
        $scope.config = angular.copy(config);
        
        function getFields() {
            if (!$scope.config.fields) {
                $scope.config.fields = [];
            }
            return $scope.config.fields;
        }

        $scope.dismiss = function() {
            $uibModalInstance.dismiss();
        };

        $scope.remove = function() {
            // console.log("DONE REMOVE");
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $uibModalInstance.close();
        };

        $scope.save = function() {
        
            angular.extend(config, $scope.config);
            $scope.$parent.$broadcast('widgetConfigChanged');
            $uibModalInstance.close(config);
        };

	$scope.colors = '#FFFFFF';

        $scope.charts = [{
            id: 1,
            label: "Box",
            value: "box"
        }];

        $scope.library = [{
            id: 3,
            label: "Box",
            value: "box"
        }];

        $scope.legend_align = [{
            name: "center",
            value: "center"
        }, {
            name: "right",
            value: "right"
        }, {
            name: "left",
            value: "left"
        }];

        $scope.legend_layout = [{
            name: "horizontal",
            value: "horizontal"
        }, {
            name: "vertical",
            value: "vertical"
        }];


        if (!$scope.config.dataquery) {
            $scope.config.dataquery = {};
            $scope.config.dataquery.data = [];
        }

        if (!$scope.config.dataquery.data) {
            $scope.config.dataquery.data = [];
        }

        $scope.newObject = {};

        $scope.updateDebugUrl = function() {
            var url = CONFIGURATION.APIURL + $scope.config.path;
            try {
                var objQuery = JSON.parse($scope.config.query);

                objQuery = quickboxWdgt.query($scope, objQuery, userProfile);

                $scope.debug = "curl -v --cookie 'HOMERSESSID=" + $cookies["HOMERSESSID"] + "' -X POST \\\n" + "-d '" + JSON.stringify(objQuery) + "' \\\n" + ' "' + window.location.protocol + "//" + window.location.host + "/" + url + '"\n';
                $scope.parsingStatus = "No syntax errors";
                $scope.parsingColorClass = "green";
            } catch (e) {
                $scope.parsingStatus = "Bad parsing: [" + e.message + "]";
                $scope.parsingColorClass = "red";
            }
        };

        $scope.tagTransform = function(newTag) {
            var item = {
                name: newTag,
                value: newTag
            };
            return item;
        };

        function popuplateSourceTypeData(index, nameparam) {

            var ldata = [{
                    name: "New PPS",
                    value: "total_pps"
                },
                {
                    name: "Total PPS",
                    value: "total_pps"
                },
                {
                    name: "Other PPS",
                    value: "other_pps"
                },
                {
                    name: "Regs PPS",
                    value: "regs_pps"
                },
                {
                    name: "CALLS PPS",
                    value: "calls_pps"
                },
                {
                    name: "Canceled",
                    value: "canceled"
                },
                {
                    name: "failedsessetup",
                    value: "failedsessetup"
                },
                {
                    name: "unauth",
                    value: "unauth"
                },
                {
                    name: "finished",
                    value: "finished"
                }
            ];

            $scope.myRemotedata = ldata;

            var url = CONFIGURATION.APIURL + "statistic/_metrics";
            var objQuery = {};
            var timedate = userProfile.getProfile("timerange");
            var timezone = userProfile.getProfile("timezone");
            objQuery.timestamp = {};
            objQuery.param = {};
            var diff = (new Date().getTimezoneOffset() - timezone.value) * 60 * 1000;
            objQuery.timestamp.from = timedate.from.getTime() - diff;
            objQuery.timestamp.to = timedate.to.getTime() - diff;
            objQuery.param.limit = $scope.config.panel.limit;
            objQuery.param.total = $scope.config.panel.total;

            var obj = {};
            var queryParams = [];
            obj["main"] = nameparam;
            queryParams.push(obj);
            objQuery.param.query = queryParams;

            $scope.myRemotedata = [];

            $http.post(url, objQuery).success(function(data) {
                // console.log(data);
                //config.debugresp = JSON.stringify(data);
                if (data && data.status) {
                    var status = data.status;
                    if (status == "ok") {
                        // console.log(data);
                        $scope.myRemotedata = data.data;
                    }
                }
            }).error(function() {
                console.log("ERROR");
            });
        };

        /* changing metrics for Elastic */
        $scope.checkSourceSelection = function(param, index) {


            // console.log(param);
            // console.log(index);
            // console.log($scope.config);

            $scope.page = 0;
            $scope.searchTerm = "";

            var dvar = $scope.config.dataquery.data[index];

            var countervalue = $scope.config.dataquery.data[index][param].value;

            $scope.config.dataquery.data[index]["type"] = {};

            // console.log(dvar);
            // console.log(countervalue);


            popuplateSourceTypeData(index, countervalue);

            /*
	    elasticClient.initConnect(host, auth, apiVersion);
	    
	    elasticClient.search($scope.searchTerm, $scope.page++).then(function(results){
                if(results.length !== 10){
                    $scope.allResults = true;
                }
                var ii = 0;
                for(;ii < results.length; ii++){
                    $scope.recipes.push(results[ii]);
                }
            });
            */
        };


        $scope.displayExpertMode = false;
        $scope.expertMode = "Switch to expert mode";
        $scope.expertClass = "glyphicon glyphicon-chevron-down";


        $scope.updateDebugUrl();


        //==========================================================================================
        // Filters
        //==========================================================================================

        // add an item
        $scope.addFilter = function() {
            if (!$scope.config.panel.filters) {
                $scope.config.panel.filters = [];
            }
            $scope.config.panel.filters.push({
                type: $scope.config.panel.filter.type,
                value: $scope.config.panel.filtervalue.value
            });
        };


        /* add QUERY */
        $scope.addQuery = function() {
        
            if (!$scope.config.panel.queries) {
                $scope.config.panel.queries = [];
            }

            // console.log($scope.config.panel);
            // console.log(DATASOURCES);
            // console.log($scope.config.panel.metricsdatasource);

            var index = $scope.config.panel.queries.length;
            index++;

            $scope.config.panel.queries.push({
                name: "A" + index,
                type: { 
                        name: $scope.panel.metricsdatasource.name,
                        alias: $scope.panel.metricsdatasource.alias,
                },
                value: "query"
            });
            
            // console.log($scope.config.panel.queries);
        };

        /* edit QUERY */
        $scope.editQuery = function(index) {

            //$("#queryExpert").toggleClass("hidden");                    
            // console.log(index);
            // console.log("DATASOURCES", DATASOURCES);
            // console.log("OBJ", $scope.config.panel.queries[index]);
            var alias = $scope.config.panel.queries[index].type.alias;
            $scope.dataAlias = alias;
            // console.log(alias);
            $scope.displayQuery = true;
            $scope.fieldsdata = DATASOURCES.DATA[alias].fields;
	    $scope.fieldsdata.splice(-1,2);
            $scope.dataSourceName = DATASOURCES.DATA[alias].name;
            // console.log($scope.config.panel.queries);
            $scope.localindex = index;


            if (!$scope.config.dataquery.data) {
                $scope.config.dataquery.data = {};
            }

            if (!$scope.config.dataquery.data[index]) {
                $scope.config.dataquery.data[index] = {};
                $scope.config.dataquery.data[index].sum = true;
            }

            if (Array.isArray($scope.config.dataquery.data[index])) {
                $scope.config.dataquery.data[index] = {};
            }
            
            /* populate editQuery */
            if ($scope.config.dataquery.data[index]["main"] && $scope.config.dataquery.data[index]["main"].value) {
                popuplateSourceTypeData(index, $scope.config.dataquery.data[index]["main"].value);
            }

            // console.log('WFIELDS',$scope.fieldsdata);
            //config.panel.queries

        };


        $scope.showExpertMode = function() {

            $scope.displayExpertMode = !$scope.displayExpertMode;

            if ($scope.displayExpertMode) {
                $scope.expertMode = "Switch to normal mode";
                $scope.expertClass = "glyphicon glyphicon-chevron-up";
            } else {
                $scope.expertMode = "Switch to expert mode";
                $scope.expertClass = "glyphicon glyphicon-chevron-down";
            }
        };


        // remove an item
        $scope.removeFilter = function(index) {
            $scope.config.panel.filters.splice(index, 1);
        };

        $scope.removeQuery = function(index) {
            $scope.config.panel.queries.splice(index, 1);
            /* remove data */
            $scope.config.dataquery.data[index] = {};
        };

        //==========================================================================================
        // General
        //==========================================================================================

        // remove an item
        $scope.reset = function(index) {
            //$scope.config.panel.values = [];
            //$scope.config.panel.filters = [];
            //$scope.config.panel.queries = [];
        };

    };

    quickboxEditController.$inject = injectquickboxEditSettingsParams;
    app.register.controller('quickboxEditController', quickboxEditController);
    
});
