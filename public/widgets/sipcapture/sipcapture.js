define(['app'], function(app) {

    /* settings */
    app.dashboard.widget('sipcapture', {
        title: 'Sipcapture Stats',
        group: 'Charts',
        name: 'sipcapture',
        description: 'Displaycharts time',
        templateUrl: 'widgets/sipcapture/sipcapture.html',
        controller: 'sipcaptureController',
        controllerAs: 'sipcapture',
        refresh: true,                
        sizeX: 1,
        sizeY: 1,
        config: {
            title: "Sipcapture Stats",
            chart: {},
            dataquery: {},
            panel: {
                queries:[]
            }
        },
        edit: {
            controller: 'sipcaptureEditController',
            templateUrl: 'widgets/sipcapture/edit.html'
        },
        api: { }
    });

   /*SERVICE*/
   var injectSipCaptureParams = ['$q', '$http', 'CONFIGURATION'];
   var sipcaptureFactory = function($q, $http, CONFIGURATION) {

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

   sipcaptureFactory.$inject = injectSipCaptureParams;
   app.register.factory('sipcaptureService', sipcaptureFactory);


   /*** Controller ***/
   var injectSipCaptureChartsParams = ['$scope', '$timeout', '$q', 'userProfile','$rootScope', 'eventbus', '$interval', '$uibModal', 'sipcaptureService', 'EVENTS', 'DATASOURCES', 'CONFIGURATION'];
   var sipCaptureChartController = function($scope, $timeout, $q, userProfile, $rootScope, eventbus, $interval, $uibModal, sipcaptureService, EVENTS, DATASOURCES, CONFIGURATION) {

        function parseDate(input) {
            return input * 1e3;
        }

        var apiD3;

        var rangeDate = {};
        var data = {};
        var sipdata = {};
        
        /* Chart options */
        $scope.metricsdatasources = DATASOURCES.DATA;

        if (!$scope.config) $scope.config = {};
        var fields = $scope.config.panel ? $scope.config.panel.filters : [];
	
        $scope.configD3 = {};

	/*
            visible: true, // default: true
            extended: false, // default: false
            disabled: false, // default: false
            refreshDataOnly: true, // default: true
            deepWatchOptions: true, // default: true
            deepWatchData: true, // default: true
            deepWatchDataDepth: 2, // default: 2
            debounce: 10 // default: 10        
        };
        
        /* MAIN FUNCTIONS */
        
        $scope.init = function(config, api) {
            console.log("INIT ===> ", config);
            $scope.config = config;
            if (!$scope.config) $scope.config = {};
           // console.log($scope);
            if (!$scope.config.fields) {};
            if (!$scope.config.title) $scope.config.title = " QuickSearch";
           // console.log($scope.config);
            $scope.fields = $scope.config.fields;
            /* api */
            api.resizeStart = resizeStart;
            api.resizeStop = resizeStop;
            api.resizeUpdate = resizeUpdate;
            api.refresh = refresh;

            if (config.chart.hasOwnProperty("library") && config.chart.library.value == "d3") {
                    $scope.d3Enabled = true;
            }
            else if (config.chart.hasOwnProperty("library") && config.chart.library.value == "flot") {
                    $scope.flotEnabled = true;
            }

            createChart();

        };
        
        $scope.openSettings = function(widget) {

            var config = widget.config;
            console.log("openSETTINGS");
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
                createChart();                            
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
            console.log("REFRESH");
            applyChart();                
        };
                
        function resizeStart() { };
        
        function resizeUpdate() {
            if(apiD3) apiD3.update();
        };                
        
        function resizeStop() {
            if(apiD3) apiD3.update();
        };                                

	angular.element(window).on('resize', function(e){
            apiD3.updateWithTimeout(200);
	});
	
	$scope.$on('gridster-item-initialized', function(item) {
	    console.log("LOADED");
	    
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
               // console.log(config);
                if (config.chart.hasOwnProperty("library") && config.chart.library.value == "d3") {
                    $scope.d3Enabled = true;
                    $scope.chartHeight = config.chart.size.height;
                    if (config.chart.type && config.chart.type.hasOwnProperty("value")) {
                           // console.log(sipdata);
                            sipCaptureD3Draw($scope, config.chart.type["value"], sipdata);
                    }
                } else if (config.chart.hasOwnProperty("library") && config.chart.library.value == "flot") {
                    $scope.flotEnabled = true;
                    $scope.chartHeight = config.chart.size.height;
                    $scope.chartWidth = config.chart.size.width;
                    if (config.chart.type && config.chart.type.hasOwnProperty("value")) sipcaptureWdgt.flot.draw($scope, config.chart.type["value"], sipdata);
                }
            }
        };
        
        /* ONLY APPLY NEW DATA */
        function loadDataChart(sipdata) {
                
            var config = $scope.config;
            /* DRAW DATA */
            if (config) {            
               // console.log(config);
                if (config.chart.hasOwnProperty("library") && config.chart.library.value == "d3") {
                    $scope.d3Enabled = true;
                    $scope.chartHeight = config.chart.size.height;
                    if (config.chart.type && config.chart.type.hasOwnProperty("value")) {
                            sipCaptureD3PrepareData(config.chart.type["value"], sipdata);
                    }
                } else if (config.chart.hasOwnProperty("library") && config.chart.library.value == "flot") {
                    $scope.flotEnabled = true;
                    $scope.chartHeight = config.chart.size.height;
                    $scope.chartWidth = config.chart.size.width;
                    if (config.chart.type && config.chart.type.hasOwnProperty("value")) 
                            sipcaptureWdgt.flot.draw($scope, config.chart.type["value"], sipdata);
                }
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
        
        
        function createChart() 
        {      
            var config = $scope.config;
                      
            if(config.dataquery && config.dataquery.data) 
            {
                var sipCaptureobjQuery = {};            
                var sipCaptureobjParam = {};
            
                for(var i = 0; i < config.dataquery.data.length; i++) {                            
            
                    var myData = config.dataquery.data[i];
                   // console.log("OB",myData);
                   // console.log("RR",config.panel.queries[i]);
                    var dalias = config.panel.queries[i].type.alias;
                   // console.log("ZZ",DATASOURCES.DATA[dalias]);
                   // console.log("ALIAS", dalias);
                    if(dalias == "sipcapture")
                    {
                        if(angular.equals(sipCaptureobjQuery, {}))
                        {                    
                            var dDD = DATASOURCES.DATA[dalias];
                            var sum = false;
                            if(config.dataquery.data[i]["sum"]) sum = config.dataquery.data[i]["sum"];
                            
                            sipCaptureobjQuery = queryBuilder(dDD.settings.query, "", dDD.settings.limit, sum);                        
                            sipCaptureobjParam.path = dDD.settings.path;
                        };                            
                       // console.log("FF", sipCaptureobjQuery);  
                        var nData = dataBuilder(myData);
                        sipCaptureobjQuery.param.query.push(nData);                                                
                    }
                };

                if(!angular.equals(sipCaptureobjQuery, {})) {
                   // console.log(sipCaptureobjQuery);                        
                    sipcaptureService.get(config, sipCaptureobjParam.path, sipCaptureobjQuery).then(function(sdata) {
                           // console.log("RELOADING",sdata);
                            loadNewChart(sdata);
                    }, function(sdata) {
                       // console.log("data", sdata);                        
                        return;
                    });
                };
            };                        
        };
        
        function applyChart() 
        {      
            var config = $scope.config;
                      
            if(config.dataquery && config.dataquery.data) 
            {
                var sipCaptureobjQuery = {};            
                var sipCaptureobjParam = {};
            
                for(var i = 0; i < config.dataquery.data.length; i++) {                            
            
                    var myData = config.dataquery.data[i];
                    var dalias = config.panel.queries[i].type.alias;
                    if(dalias == "sipcapture")
                    {
                        if(angular.equals(sipCaptureobjQuery, {}))
                        {                    
                            var dDD = DATASOURCES.DATA[dalias];
                            var sum = false;
                            if(config.dataquery.data[i]["sum"]) sum = config.dataquery.data[i]["sum"];
                            
                            sipCaptureobjQuery = queryBuilder(dDD.settings.query, "", dDD.settings.limit, sum);                        
                            sipCaptureobjParam.path = dDD.settings.path;
                        };                            
                        
                        var nData = dataBuilder(myData);
                        sipCaptureobjQuery.param.query.push(nData);                                                
                    }
                };

                if(!angular.equals(sipCaptureobjQuery, {})) {
                   // console.log(sipCaptureobjQuery);                        
                    sipcaptureService.get(config, sipCaptureobjParam.path, sipCaptureobjQuery).then(function(sdata) {
                            console.log("RELOADING",sdata);
                            loadDataChart(sdata);
                    }, function(sdata) {
                       // console.log("data", sdata);                        
                        return;
                    });
                };
            };                        
        };
                      
            
        /**************************************** D3 FUNCTIONS ***********************/
        function sipcaptureD3Data(data) {
                //    var fieldname =  $scope.config.panel.fieldname;
                //var timefield =  $scope.config.panel.timefield.field;
                var timefield = "reporttime";    

                var names = [];
                var values = {};
                var timefields = [];
                var timefieldData;
                var preparedData = [];

                angular.forEach(data, function(dataLoc, key)
                {
                    angular.forEach(dataLoc, function(entry){
        
                        var name = "";
                        var value = 0;

                        name = entry["countername"]
                        value = parseInt(entry['value']);

                        if (names.indexOf(name) === -1) { // Getting names
                                names.push(name)
                        }

                        timefieldData = entry[timefield];

                        if (timefields.indexOf(timefieldData) === -1) { // Getting timefields
                                timefields.push(timefieldData)
                        }

                        if (!(name in values)) { // Create key if don't exists
                                values[name] = {}
                        }
                        
                        values[name][timefieldData] = (values[name][timefieldData] || 0) + value;                        
                    });
                });


                angular.forEach(names, function(name) { // Order and fill empty data

		    if (!name) return;

                    var valuesData = [];
                    var total = 0;

                    timefields.forEach(function(timefield) {
                            total = total + (parseInt(values[name][timefield]) || 0);
                            valuesData.push({
                                timefield : timefield,
                                value : parseInt(values[name][timefield]) || 0
                            });
                    });

		    if (!$scope.colorSet) { $scope.colorSet=[]; }
		    if (!$scope.colorSet[name]) { $scope.colorSet[name] = '#'+Math.floor(Math.random()*16777215).toString(16); }

                    preparedData.push({
			    color: $scope.colorSet[name],
                            key : name,
                            values : valuesData
                    });
                });

               // console.log(preparedData);
                return preparedData;
        };
        
        function sipcaptureD3BarData(data) {

                var names = [];
                var values = {};
                var preparedData = [];
                var valuesData = [];
                var total = 0;

                angular.forEach(data, function(dataLoc, key)
                {
                    angular.forEach(dataLoc, function(entry){
        
                        var name = "";
                        var value = 0;

                        name = entry["countername"]
                        value = parseInt(entry['value']);

                        if (names.indexOf(name) === -1) { // Getting names
                                names.push(name)
                        }

                        if (!(name in values)) { // Create key if don't exists
                                values[name] = {}
				values[name] = 0;
                        }
                        
                        values[name] = value + values[name];
                    });
                });

                angular.forEach(names, function(name) { // Order and fill empty data

		    if (!$scope.colorSet) { $scope.colorSet=[]; }
		    if (!$scope.colorSet[name]) { $scope.colorSet[name] = '#'+Math.floor(Math.random()*16777215).toString(16); }
	
                    valuesData.push({
		        color: $scope.colorSet[name],
                        label : name,
                        value : parseInt(values[name]) || 0
                    });
                });
                
		if (!$scope.colorSet) { $scope.colorSet=[]; }
		if (!$scope.colorSet[name]) { $scope.colorSet[name] = '#'+Math.floor(Math.random()*16777215).toString(16); }

                preparedData.push({
		     //    color: '#'+Math.floor(Math.random()*16777215).toString(16),
		     color: $scope.colorSet[name],
                     key : "Cumulative",
                     values : valuesData
                });

               // console.log(preparedData);
                return preparedData;
        };
        
        function sipcaptureD3PieData(data) {

                var names = [];
                var values = {};
                var preparedData = [];
                var total = 0;

                angular.forEach(data, function(dataLoc, key)
                {
                    angular.forEach(dataLoc, function(entry){
        
                        var name = "";
                        var value = 0;

                        name = entry["countername"]
                        value = parseInt(entry['value']);

                        if (names.indexOf(name) === -1) { // Getting names
                                names.push(name)
                        }

                        if (!(name in values)) { // Create key if don't exists
                                values[name] = {}
				values[name] = 0;
                        }
                        
                        values[name] = value + values[name];
                    });
                });

                angular.forEach(names, function(name) { // Order and fill empty data

		    if (!$scope.colorSet) { $scope.colorSet=[]; }
		    if (!$scope.colorSet[name]) { $scope.colorSet[name] = '#'+Math.floor(Math.random()*16777215).toString(16); }

                    preparedData.push({
			//    color: '#'+Math.floor(Math.random()*16777215).toString(16),
			color: $scope.colorSet[name],
                        key : name,
                        value : parseInt(values[name]) || 0
                    });
                });

               // console.log(preparedData);
                return preparedData;
        };
        
        
	/******************** OPTIONS FOR CHARTS ****************/
        function sipCaptureD3lineChart(customData) {
                $scope.options = {
                        chart: {
                	    type: 'lineChart',
                            margin : {
                                top: 40,
                                right: 20,
                                bottom: 40,
                                left: 55
                            },
                            x: function(d){ return d.timefield; },
                            y: function(d){ return d.value; },
                            useInteractiveGuideline: true,
                            xAxis: {                            
                                axisLabel: 'Time',
				tickFormat: function(d) {  
			            return d3.time.format('%H:%M')(new Date(d*1000));         
				},
                            },
                            yAxis: {
                                axisLabel: 'Packets',
                                tickFormat: function(d){
                                    return d3.format('.02f')(d);
                                },
                                axisLabelDistance: -10
                            },
                            showLegend: false,
                        }
                };
                
                $scope.data = customData;                        
        };

        function sipCaptureD3pieChart(customData) {
                $scope.options = {
                        chart: {
                	    type: 'pieChart',
                	    margin : {
                	        top: 30,
                	        right: 0,
                	        bottom: 0,
                	        left: 0   
                            },
                            x: function(d){ return d.key; },
                            y: function(d){ return d.value; },
			    duration: 500,
			    labelThreshold: 15.01,
			    labelSunbeamLayout: true,
                            showLegend: false
                        }
                };                
        };

        function sipCaptureD3scatterChart(customData) {
                $scope.options = {
                        chart: {
                	    type: 'scatterChart',
                            margin : {
                                top: 40,
                                right: 20,
                                bottom: 40,
                                left: 55
                            },
			    scatter: {
				onlyCircles: false
			    },
			    showDistX: true,
			    showDistY: true,
			    duration: 350,
                            x: function(d){ return d.timefield; },
                            y: function(d){ return d.value; },
                            useInteractiveGuideline: true,
                            xAxis: {                            
                                axisLabel: 'Time',
				tickFormat: function(d) {  
			            return d3.time.format('%H:%M')(new Date(d*1000));         
				},
                            },
                            yAxis: {
                                axisLabel: 'Packets',
                                tickFormat: function(d){
                                    return d3.format('.02f')(d);
                                },
                                axisLabelDistance: -10
                            },
			    zoom: {
				enabled: true,
				scaleExtent: [1, 10],
				useFixedDomain: false,
				useNiceScale: false,
				horizontalOff: false,
				verticalOff: true,
				unzoomEventType: 'dblclick.zoom'
			    },
                            showLegend: false
                        }
                };                
        };

        function sipCaptureD3stackedAreaChart(customData) {
                $scope.options = {
                        chart: {
                	    type: 'stackedAreaChart',
                            margin : {
                                top: 40,
                                right: 20,
                                bottom: 30,
                                left: 40
                            },
                            x: function(d){ return d.timefield; },
                            y: function(d){ return d.value; },
			    useVoronoi: false,
			    duration: 300,                            
                            useInteractiveGuideline: false,
                            xAxis: {                            
                                showMaxMin: false,
				tickFormat: function(d) {  
			            return d3.time.format('%H:%M')(new Date(d*1000));         
				},
                            },
                            yAxis: {
                                tickFormat: function(d){
                                    return d3.format('.02f')(d);
                                }
                            }                            
                            /*
			    tooltip: {
		                contentGenerator: function (e) {
			                  var series = e.series[0];
			                  if (series.value === null) return;                  

			                  var rows = 
			                    "<tr>" +
			                      "<td class='key'>" + 'Time: ' + "</td>" +
			                      "<td class='x-value'>" + e.value + "</td>" + 
			                    "</tr>" +
			                    "<tr>" +
			                      "<td class='key'>" + 'Voltage: ' + "</td>" +
			                      "<td class='x-value'><strong>" + (series.value?series.value.toFixed(2):0) + "</strong></td>" +
			                    "</tr>";
			                  var header = 
			                    "<thead>" + 
			                      "<tr>" +
			                        "<td class='legend-color-guide'><div style='background-color: " + series.color + ";'></div></td>" +
			                        "<td class='key'><strong>" + series.key + "</strong></td>" +
			                      "</tr>" + 
			                    "</thead>";
	                    
        			          return "<table>" +
			                      header +
			                      "<tbody>" + 
			                        rows + 
			                      "</tbody>" +
			                    "</table>";
		                } 
		            }                            
                            */
                            /*,                            
			    zoom: {
				enabled: true,
				scaleExtent: [1, 10],
				useFixedDomain: false,
				useNiceScale: false,
				horizontalOff: false,
				verticalOff: true,
				unzoomEventType: 'dblclick.zoom'
			    }
			    */			    
                        }
                };                
        };

        function sipCaptureD3multiBarChart(customData) {
                $scope.options = {
			chart: {
				type: 'discreteBarChart',
				margin : {
					top: 40,
					right: 20,
					bottom: 40,
					left: 55
				},
				x: function(d){ return d.label; },
				y: function(d){ return d.value; },
				showValues: true,             
				duration: 500,
				xAxis: {
					axisLabel: 'X Axis',
					axisLabelDistance: -10
		                },
				yAxis: {
					axisLabel: 'Packets',
					axisLabelDistance: -10
				},
				showLegend: false
                        }
                };
        };
        

	/******************* CHECK OF TYPE *****************/

        function sipCaptureD3Draw ($scope, type, data) {
               // console.log(type);
                
                var customData;                

                if (type == "pie") {
                        customData = sipcaptureD3PieData(data);                        
                        sipCaptureD3pieChart();
                } else if (type == "scatter") {
                       //customData = sipcaptureWdgt.d3.scatterChart.data(customData);
                       customData = sipcaptureD3Data(data);                        
                        sipCaptureD3scatterChart();
                } else if (type == "line") {
                        customData = sipcaptureD3Data(data);                        
                        sipCaptureD3lineChart();
                } else if (type == "areaspline") {
                        customData = sipcaptureD3Data(data);                        
                        sipCaptureD3stackedAreaChart();
                } else {
                        customData = sipcaptureD3BarData(data);
                        sipCaptureD3multiBarChart();
                }
                
               // console.log(customData);    
                sipCaptureD3ApplyData(type,customData);
        };
        
        function sipCaptureD3PrepareData (type, data) {
               // console.log(type);
                
               // console.log(data);

                var customData;
                
                if (type == "pie") {
                        customData = sipcaptureD3PieData(data);
                } else if (type == "scatter") {
                       customData = sipcaptureD3Data(data);                        
                } else if (type == "line") {
                        customData = sipcaptureD3Data(data);                        
                } else if (type == "areaspline") {
                        customData = sipcaptureD3Data(data);                        
                } else {
                        customData = sipcaptureD3BarData(data);
                }

                sipCaptureD3ApplyData(type, customData);
                /* UPDATE DATA*/
        };
                
        function sipCaptureD3ApplyData (type, customData) {

                $scope.data = customData;                
        };

        /* API OF D3 */        
        $scope.callbackD3 = function(scope, element) {
        
                  apiD3 = scope.api;     
                  apiD3.updateWithTimeout(200);                               
        };

    };

    sipCaptureChartController.$inject = injectSipCaptureChartsParams;
    app.register.controller('sipcaptureController', sipCaptureChartController);

    /* EDIT */
    var injectSipcaptureEditSettingsParams = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'config', '$http', 'userProfile', 'DATASOURCES', 'CONFIGURATION'];
    var sipcaptureEditController = function($scope, $timeout, $rootScope, $uibModalInstance, config, $http, userProfile, DATASOURCES, CONFIGURATION) {

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
            console.log("DONE REMOVE");
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $uibModalInstance.close();
        };

        $scope.save = function() {
        
            angular.extend(config, $scope.config);
            $scope.$parent.$broadcast('widgetConfigChanged');
            $uibModalInstance.close(config);
        };

        $scope.charts = [

	//	  {
	//            id: 1,
	//            label: "Spline",
	//            value: "spline"
	//        }, 

	{
            id: 2,
            label: "Line",
            value: "line"
        }, {
            id: 3,
            label: "Area spline",
            value: "areaspline"
        }, {
            id: 4,
            label: "Bar",
            value: "bar"
        }, {
            id: 5,
            label: "Scatter",
            value: "scatter"
        }, {
            id: 6,
            label: "Pie",
            value: "pie"
        }, {
            id: 7,
            label: "Column",
            value: "column"
        }, {
            id: 8,
            label: "Gauge",
            value: "solidgauge"
        }, {
            id: 9,
            label: "Heatbox",
            value: "heatmap"
        }];
        $scope.library = [{
            id: 3,
            label: "D3JS",
            value: "d3"
        }, {
            id: 4,
            label: "Flot",
            value: "flot"
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

                //objQuery = sipcaptureWdgt.query($scope, objQuery, userProfile);
                $scope.debug = "curl -v --cookie 'HEPICSSID=" + "HEPICSSID" + "' -X POST \\\n" + "-d '" + JSON.stringify(objQuery) + "' \\\n" + ' "' + window.location.protocol + "//" + window.location.host + "/" + url + '"\n';
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

           // console.log($scope.config.dataquery);
           // console.log("INDEX", index);
           // console.log("PARAM", param);

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
        
        //console.log(sipcaptureWdgt);

        //$scope.datasources = sipcaptureWdgt.data.datasources.datasources;
        //$scope.metricsdatasources = sipcaptureWdgt.data.metricsdatasources.datasources;

        $scope.displayExpertMode = false;
        $scope.expertMode = "Switch to expert mode";
        $scope.expertClass = "glyphicon glyphicon-chevron-down";


        $scope.updateDebugUrl();

        //==========================================================================================
        // Chart basic settings
        //==========================================================================================

        //------------------------------------------------------------------------------------------
        // Select Chart
        //------------------------------------------------------------------------------------------
        $scope.selectType = function() {
            if ($scope.config.chart.type.value == 'pie') {
                $scope.config.panel.total = true;
            } else {
                if ($scope.config.panel) $scope.config.panel.total = false;
            }
        };

        //------------------------------------------------------------------------------------------
        // Select Engine
        //------------------------------------------------------------------------------------------
        $scope.selectEngine = function() {
            if ($scope.config.chart.update) $scope.config.chart.update.clear();
        };

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
            $scope.dataSourceName = DATASOURCES.DATA[alias].name;
           // console.log($scope.config.panel.queries);
            $scope.localindex = index;                        


            if (!$scope.config.dataquery.data) {
                $scope.config.dataquery.data = {};
            }

            if (!$scope.config.dataquery.data[index]) {
                $scope.config.dataquery.data[index] = {};
                $scope.config.dataquery.data[index].sum = false;
            }

            if (Array.isArray($scope.config.dataquery.data[index])) {
                $scope.config.dataquery.data[index] = {};
            }
            
           // console.log("RDD", $scope.dataSourceName);
            /* populate editQuery */
            if ($scope.config.dataquery.data[index]["main"] && $scope.config.dataquery.data[index]["main"].value) {
                    popuplateSourceTypeData(index, $scope.config.dataquery.data[index]["main"].value);
	    }

	   // console.log("RRR",$scope.config.dataquery.data[index]);

           // console.log($scope.fieldsdata);
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

    sipcaptureEditController.$inject = injectSipcaptureEditSettingsParams;
    app.register.controller('sipcaptureEditController', sipcaptureEditController);
    
});
