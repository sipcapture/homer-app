'use strict';

define(['app'], function (app) {
  
  
     /* settings */

     app.dashboard.widget('hepsearch', {
        title: 'Search Form Builder',
        group: 'Search',
        name: 'hepsearch',
        description: 'Display Search Form component',
        templateUrl: 'widgets/hepsearch/hepsearch.html',
        controller: 'hepSearchController',
        controllerAs: 'hsearch',
        refresh: false,                
        sizeX: 1,
        sizeY: 1,
        config: {
          title: 'HepSearch'
        },
        edit: {
          controller: 'hepSearchEditController',
          templateUrl: 'widgets/hepsearch/edit.html'
        },
        api: {}
    });  

    /* CONTROLLER */

    var injectParams = ['$scope','$location','$state','userProfile', '$log', 'searchService', '$q', '$timeout','$uibModal', 'EVENTS'];

    var hepSearchController = function($scope, $location, $state, userProfile, $log, searchService, $q, $timeout, $uibModal, EVENTS) {
        
          var self = this; 

          $scope.methodString = "AA";
           	
          /* workaround */    
          if(userProfile.profileScope.search && userProfile.profileScope.search instanceof Array)
                userProfile.profileScope.search={};

	  $scope.newObject = userProfile.profileScope.search;	 	     	  	  
	  $scope.newProtoType = userProfile.profileScope.prototype;	 	     	  	  
	  $scope.newResult = userProfile.profileScope.result;	 	     	  	  
	  $scope.newNode = userProfile.profileScope.node;	 	     	  	  
	
	  $scope.init = function(config, api)
          {
                    console.log("INIT ===> ", config);                    
                    $scope.config = config;
                    if(!$scope.config) $scope.config = {};          

                    if (!$scope.config.fields){
                          $scope.config.fields = [
                              {name:"from_user",selection:"From"},
                              {name:"to_user",selection:"To"},
                              {name:"callid",selection:"Call-ID"}
                          ];                                        
                    };

                    if(!$scope.config.title) $scope.config.title =" HepSearch";

                    $scope.config.searchbutton = true;
                    console.log($scope.config);

                    $scope.fields = $scope.config.fields;
                    
                     /* api */
                    api.resizeStart = resizeStart;
                    api.resizeStop = resizeStop;  
                    api.resizeUpdate = resizeUpdate;                    
                    
          }
          
	  function checkFit(){
		if (!$scope.$parent.gridster) return;
		try {
			// console.log('check',$scope.$parent.gridster.curRowHeight, $scope.$parent.gridsterItem.getElementSizeY());
	                if (($scope.$parent.gridster.curRowHeight)/100*95 > $scope.$parent.gridsterItem.getElementSizeY() ) {
				console.log('DIV TOO SMALL!');
				$scope.tooSmall = true;
			} else { $scope.tooSmall = false; }
		} catch(e) { $scope.tooSmall = false; }
	  };

          function resizeStart() {
	  };

	  function resizeUpdate() {          
		checkFit();
	  };                

	  function resizeStop() {
		checkFit();
	  };

          console.log("HEP SEARCH");

	  $scope.toggleSearchButton = function() {	  
	      $scope.showSearchButton = !$scope.showSearchButton;
	      $scope.config.searchbutton = !$scope.config.searchbutton;
	  }

	  $scope.timerange = userProfile.profileScope.timerange;

                /* update if timerange will be changed */
                (function () {
                      $scope.$watch(function () {
                            return userProfile.profileScope.search;
                      }, function (newVal, oldVal) {
                            if ( newVal !== oldVal ) {
                                $scope.newObject = newVal;
                            }
                        });
          }());

          $scope.nullSafe = function ( field ) {
             if ( !$scope.newObject[field] ) {
                   $scope.newObject[field] = "";
             }
          };
          
	  $scope.openSettings = function(widget) {

	        var config =  widget.config;
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
                });
          };


	  $scope.remove = function(widget) {

            	console.log("remove Widget");
                console.log(widget);
                $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
          };          
          
	  // process the form
          $scope.processSearchForm = function(t) {
                           
                if($scope.newObject instanceof Array) $scope.newObject={};                                
                
                console.log($scope.newObject);
                console.log($scope.newProtoType);
                
		userProfile.setProfile("search", $scope.newObject);
		userProfile.setProfile("prototype", $scope.newProtoType);
		userProfile.setProfile("result", $scope.newResult);
		userProfile.setProfile("node", $scope.newNode);

		$scope.isBusy = true;
				
                var tres = $scope.newResult['restype'].name;				
				
                if(tres == "pcap") {
                     $scope.processSearchResult(0);
                }
		else if(tres == "text") {
                     $scope.processSearchResult(1);
                }
                else if(tres == "cloud") {
                     $scope.processSearchResult(2);
                }                
                else if(tres == "count") {
                     $scope.processSearchResult(3);
                }                
		else {
                    var locProtoID = "call";
                    
                    if($scope.newResult.transaction && $scope.newResult.transaction.name) 
                    {
                        var v = $scope.newResult.transaction.name;
                        if(v == "call") {locProtoID = "call";}
                        else if(v == "registration") {locProtoID = "registration";}
                        else if(v == "proto") {locProtoID = "proto";}                        
                        
		    };
		    
		    $state.go('search', { protoID: locProtoID });
                }
	  }; 	  	  
	  
	  $scope.clearSearchForm = function(t) {
	        
	        /* should be {} */
	        /*
	        userProfile.profileScope.transaction = [$scope.type_transaction[0], $scope.type_transaction[1]];
	        userProfile.profileScope.result = [$scope.type_result[0]];
	        $scope.newProto = [$scope.type_transaction[0], $scope.type_transaction[1]];
	        $scope.newResult = [$scope.type_result[0]];
	        $scope.newNode = [$scope.db_node[0]];
		userProfile.setProfile("transaction", $scope.newProto);
		userProfile.setProfile("result", $scope.newResult);
		userProfile.setProfile("node", $scope.newNode);
		*/
		
		userProfile.profileScope.search = {};
		userProfile.setProfile("search", $scope.newObject);
	  }; 	  	  

	  
	  $scope.processSearchResult = function(type) {
                                    
		  /* save data for next search */
		  var data = {param:{}, timestamp:{}};		  
		  
                  var transaction = userProfile.getProfile("transaction");
                  var limit = userProfile.getProfile("limit");
                  var timedate = userProfile.getProfile("timerange");
                  var value = userProfile.getProfile("search");
                  var node = userProfile.getProfile("node").dbnode;
                                                                        
                  /* make construct of query */
                  data.param.transaction = {};
                  data.param.location = {};
                  data.param.limit = limit;
                  data.param.search = value;
                  data.param.location.node = node;
                  data.timestamp.from = timedate.from.getTime();
		  data.timestamp.to = timedate.to.getTime();		                    
		
		  angular.forEach(transaction.transaction, function(v, k) {
			data.param.transaction[v.name] = true;
		  });

		  var ts = new Date().getTime();
		  
		  searchService.makePcapTextData(data, type).then( function (msg) {
		       
		              $scope.isBusy = false;
		     
		              if(type == 0) {
                                  var filename = "HOMER5_"+ts+".pcap";
                                  var content_type = "application/pcap";
                              }
                              else if(type == 1) {
                                    filename = "HOMER5_"+ts+".txt";
                                    content_type = "attachment/text;charset=utf-8";
                              }
                              else if(type == 2) {
                                  if(msg.data && msg.data.hasOwnProperty("url")) {
				      window.sweetAlert({   title: "Export Done!",   text: "Your PCAP can be accessed <a target='_blank' href='"+msg.data.url+"'>here</a>",   html: true });
                                  }
                                  else {
                                     var error = "Please check your settings";
                                      if(msg.data && msg.data.hasOwnProperty("exceptions")) error = msg.data.exceptions;
                                      window.sweetAlert({   title: "Error", type: "error",  text: "Your PCAP couldn't be uploaded!<BR>"+error,   html: true });                                  
                                  }				  
                                  return;
                              }                             
                              else if(type == 3) {
                                  if(msg.data && msg.data.hasOwnProperty("cnt")) {
				      window.sweetAlert({   title: "Count done!",   text: "We found: ["+msg.data["cnt"]+"] records" ,   html: true });
                                  }
                                  else {
                                     var error = "Please check your settings";
                                      window.sweetAlert({   title: "Error", type: "error",  text: "Count couldn't be provided!<BR>",   html: true });                                  
                                  }				  
                                  return;
                              }                              
                              var blob = new Blob([msg], {type: content_type});
                              saveAs(blob, filename);                         
        	  });
	  }; 


	  $scope.type_transaction = [
 		{ name:'call', value:'CALLS'},
    		{ name:'registration', value:'REGISTRATIONS'},
    		{ name:'proto', value:'Generic'}
	  ];
	  
	  $scope.type_prototype = [
 		{ name:'sipcall', value:'SIP Call'},
 		{ name:'sipregistration', value:'SIP Registration'},
 		{ name:'sipother', value:'SIP Other'},
    		{ name:'webrtc', value:'WebRTC'},
    		{ name:'mi', value:'MI'},
    		{ name:'log', value:'LOG'}
	  ];


	  $scope.type_result = [
 		{ name:'table', value:'TABLE'},
 		{ name:'count', value:'COUNT'},
    		{ name:'pcap', value:'PCAP'},
    		{ name:'text', value:'TEXT'},
    		{ name:'cloud', value:'CLOUD'}
	  ];
	  
          $scope.method_list = [ 'INVITE','REGISTER','BYE','CANCEL','OPTIONS','ACK','PRACK','SUBSCRIBE',
                                 'NOTIFY','PUBLISH','INFO','REFER','MESSAGE','UPDATE'
          ];          	  

	  $scope.db_node_selected = [];
	  $scope.db_node = [
 		{ name:'localhost', id:'localhost'}
	  ];
	  
	  searchService.loadNode().then( function (data) {	        
	           $scope.db_node = data;
          });	  

          $scope.filterStringList = function(userInput) {
            var filter = $q.defer();
            var normalisedInput = userInput.toLowerCase();
            var filteredArray = $scope.method_list.filter(function(method) {
              return method.toLowerCase().indexOf(normalisedInput) === 0;
            });
            $scope.newObject.method = userInput;
            filter.resolve(filteredArray);
            return filter.promise;
          };

	  $scope.itemMethodSelected = function(item) {
            console.log('Handle item string selected in controller:', item);
            //$scope.newObject.method = item;
            //self.stringMessage = 'String item selected: ' + item;
          };

	  //$scope.type_result_selected = $scope.type_result[0];
	  $scope.newResult['restype'] =  $scope.type_result[0];
	  $scope.newNode['node'] =  $scope.db_node[0];
 	//$scope.newProto = [$scope.type_transaction[0], $scope.type_transaction[1]];
	
	$scope.type_method_selected = [];
	$scope.type_method = [
 		{ id:1, value:'INVITE', checked: false },
    		{ id:2, value:'REGISTER', checked: false },
    		{ id:3, value:'BYE', checked: false },
    		{ id:4, value:'CANCEL', checked: false },
    		{ id:5, value:'OPTIONS', checked: false },
    		{ id:6, value:'ACK', checked: false },
    		{ id:7, value:'PRACK', checked: false },
    		{ id:8, value:'SUBSCRIBE', checked: false },
    		{ id:9, value:'NOTIFY', checked: false },
    		{ id:10, value:'PUBLISH', checked: false },
    		{ id:11, value:'INFO', checked: false },
    		{ id:12, value:'REFER', checked: false },
    		{ id:13, value:'MESSAGE', checked: false },
    		{ id:14, value:'UPDATE', checked: false },
    		{ id:15, value:'1xx', checked: false },
    		{ id:16, value:'2xx', checked: false },
    		{ id:17, value:'3xx', checked: false },
    		{ id:18, value:'4xx', checked: false },
    		{ id:19, value:'5xx', checked: false },
    		{ id:20, value:'6xx', checked: false },
    		{ id:21, value:'', checked: false }
	];


	$scope.$on('gridster-item-initialized', function(item) {
  	    console.log("LOADED");
            checkFit();	
	})

   };
   
   hepSearchController.$inject = injectParams;
   app.register.controller('hepSearchController', hepSearchController);
        
        
   /* Edit controller */


   var injectEditSettingsParams = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'config'];
   var hepSearchEditController = function($scope, $timeout, $rootScope, $uibModalInstance, config) {

	  var counter = 0;
	  
	  $scope.config = angular.copy(config);
	  	  
	  function getFields(){
	      if (!$scope.config.fields){
	        $scope.config.fields = [];
	      }
              return $scope.config.fields;
	   }

	   $scope.addField = function(){
		getFields().push({ name: "default"+counter} );
	   };
		
	   $scope.removeField = function(index){
		getFields().splice(index, 1);
	   };
	   
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
                        /*tell parent that content has been changed */
                        $scope.$parent.$broadcast('widgetConfigChanged');
                        $uibModalInstance.close(config);
           };

	   $scope.headers = [
           
                   {name:'from_user', selection:'From User'},
                   {name:'from_domain', selection:'From Domain'},
                   {name:'to_user', selection:'To User'},
                   {name:'to_domain', selection:'To Domain'},
                   {name:'ruri_user', selection:'RURI User'},
                   {name:'ruri_domain', selection:'RURI Domain'},
                   {name:'callid', selection:'Call-ID'},
                   {name:'callid_aleg', selection:'B2B CID'},
                   {name:'custom_field1', selection:'Custom F1'},
                   {name:'custom_field2', selection:'Custom F2'},
                   {name:'custom_field3', selection:'Custom F3'},
                   {name:'contact_user', selection:'Contact User'},
                   {name:'pid_user', selection:'PID User'},
                   {name:'auth_user', selection:'Auth User'},
                   {name:'user_agent', selection:'User-Agent'},
                   {name:'method', selection:'Method'},
                   {name:'cseq', selection:'CSeq'},
                   {name:'reason', selection:'Reason'},
                   {name:'msg', selection:'Message'},
                   {name:'diversion', selection:'Diversion'},
                   {name:'via_1', selection:'VIA'},  
                   {name:'source_ip', selection:'Source IP'},
                   {name:'destination_ip', selection:'Dest. IP'},
                   {name:'source_port', selection:'Source Port'},
                   {name:'destination_port', selection:'Dest. Port'},
                   {name:'node', selection:'Node'},
                   {name:'uniq', selection:'Unique'},
                   {name:'orand', selection:'Logic OR'},
                   {name:'proto', selection:'Protocol'},
                   {name:'family', selection:'Family'},
                   {name:'limit', selection:'Limit Query'},
                   {name:'transaction', selection:'Transaction'},
                   {name:'prototype', selection:'Proto Type'},
                   //{name:'methodtype', selection:'Methodtype'},
                   {name:'dbnode', selection:'DB Node'},
                   {name:'b2b', selection:'B2B ext'},
                   {name:'restype', selection:'Result Type'}
            ];            	   
  };
  
  
  hepSearchEditController.$inject = injectEditSettingsParams;
  app.register.controller('hepSearchEditController', hepSearchEditController);


  /*DIRECTIVES*/
  var injectAppWidgetDirectiveParams = [];
        
  var appWidgetTemplateDirective = function () {
	return function (scope, element, attrs) {
        	element.bind("keydown keypress", function (event) {
	            if(event.which === 13) {
        	        scope.$apply(function (){
                	    scope.$eval(attrs.ngEnter);
			}); 
	                event.preventDefault();
        	    }
	        });
	};
  };

  var injectDisplayDirectiveParams = ['$compile'];        
  var appDisplayDirective = function ($compile) {
            return {
                scope: {
                  fieldDisplay: "=", //import referenced model to our directives scope
                  fieldName: "=", //import referenced model to our directives scope
                  fieldHeaders: "="
                },
                templateUrl: 'widgets/hepsearch/template.html',
                link: function(scope, elem, attr, ctrl) {    
                        scope.selectedItem = {name: scope.fieldName, selection: scope.fieldDisplay};                  
                        scope.$watch('selectedItem', function(val) {      
                              scope.fieldDisplay = val.selection;
                              scope.fieldName = val.name;
                        }, true);      
                }
           };        
  };

  appDisplayDirective.$inject = injectDisplayDirectiveParams;
  app.register.directive('fieldDisplay', appDisplayDirective);

  


});

