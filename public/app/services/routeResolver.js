import _ from 'lodash';

var routeResolver = function () {

  this.$get = function () {
    //console.log("jopa");
    return this;
  };
  
  this.routeConfig = function () {
    var viewsDirectory = 'app/views/',
    controllersDirectory = 'app/controllers/',
    
    setBaseDirectories = function (viewsDir, controllersDir) {
      viewsDirectory = viewsDir;
      controllersDirectory = controllersDir;
    },
    
    getViewsDirectory = function () {
      return viewsDirectory;
    },
    
    getControllersDirectory = function () {
      return controllersDirectory;
    };
    
    return {
      setBaseDirectories: setBaseDirectories,
      getControllersDirectory: getControllersDirectory,
      getViewsDirectory: getViewsDirectory
    };
  }();
  
  
  this.route = function (routeConfig) {

    var resolve = function (url, baseName, path, secure) {
      if (!path) {
        path = '';
      }
      //console.log("BASENAME:", baseName);
      var routeDef = {};
      routeDef.url = url;
      routeDef.templateUrl = routeConfig.getViewsDirectory() + path + baseName + '.html';
      routeDef.controller = baseName + 'Controller';
      routeDef.controllerAs = baseName;                        
      routeDef.secure = (secure) ? secure : false;
      routeDef.resolve = {
        load: ['$q', '$rootScope', function ($q, $rootScope) {
          var dependencies = [routeConfig.getControllersDirectory() + path + baseName + 'Controller.js'];
          return resolveDependencies($q, $rootScope, dependencies);
        }]
      };
      
      return routeDef;
    };
    
    var resolveSearchDepends = function (url, baseName, path, secure) {
      if (!path) path = '';
      //console.log("BASENAME:", baseName);
      var routeDef = {};
      routeDef.url = url;

      routeDef.templateUrl = function($stateParams) {
        var proto = $stateParams.protoID;                    
        if($stateParams.protoID == "call" || $stateParams.protoID == "registration") proto = "standard";
        return routeConfig.getViewsDirectory() + path + baseName +"/"+ baseName + proto+'.tmpl.html'
      };                                                             

      routeDef.controllerProvider = function($stateParams) {
        return baseName + $stateParams.protoID + 'Controller';
      };                                                             
      /*routeDef.controllerAs = baseName;                        
      */
      routeDef.secure = (secure) ? secure : false;
      return routeDef;
    };
    
    var resolveNoDepends = function (url, baseName, path, secure) {
      if (!path) path = '';
      //console.log("BASENAME:", baseName);
      var routeDef = {};
      routeDef.url = url;
      routeDef.templateUrl = routeConfig.getViewsDirectory() + path + baseName + '.html';
      routeDef.controller = baseName + 'Controller';
      routeDef.controllerAs = baseName;                        
      routeDef.secure = (secure) ? secure : false;
      return routeDef;
    };
    
    var resolveAbstractSettingsIndex = function (url, baseName, secure) {
      //console.log("BASENAME:", baseName);
      var routeDef = {
        abstract: true,
        url: url,
        views: {  
          '@' : {
            templateUrl: routeConfig.getViewsDirectory() + 'settings.tmpl.html'
          },
          'settingsnav@settings' : {
            templateUrl: routeConfig.getViewsDirectory() + 'settings-navigation.tmpl.html',                                
            controller: 'settingsNavController'
          }
        },
        secure: (secure) ? secure : false                                           
      };
      //console.log(routeDef);
      return routeDef;
    };
    
    var resolveSettingsIndex = function (url, baseName, secure, profile) {
      var routeDef = {};                                
      routeDef.url = url;
      routeDef.views = {
        'settingsmain@settings' : {
          templateUrl: function(a) {
            return routeConfig.getViewsDirectory() + baseName + "/" + a.paramID+'.tmpl.html'
          },                              
          controllerProvider: function ($stateParams){                              
            return "Settings"+ profile + $stateParams.paramID + 'Controller';
          }
        },
      };
      
      routeDef.secure = (secure) ? secure : false;
      
      routeDef.resolve = {
        load: ['$q', '$rootScope', '$stateParams', function ($q, $rootScope, $stateParams) {
          var dependencies = [routeConfig.getControllersDirectory() + baseName +"/" + $stateParams.paramID + 'Controller.js'];
          return resolveDependencies($q, $rootScope, dependencies);
        }]
      };                
      
      return routeDef;
    };
    
    
    var resolveDependencies = function ($q, $rootScope, dependencies) {
      var defer = $q.defer();
      
      //require(dependencies, function () {
      //    defer.resolve();
      //    $rootScope.$apply()
      //});
      
      return defer.promise;
    };
    
    return {
      resolve: resolve,
      resolveNoDepends: resolveNoDepends,
      resolveSearchDepends: resolveSearchDepends,
      resolveAbstractSettingsIndex: resolveAbstractSettingsIndex,
      resolveSettingsIndex: resolveSettingsIndex
    }
  }(this.routeConfig);
  
};

export default routeResolver;
