angular.module('dashserv', ['$http'])
.factory('dashboardService', ['$http', '$rootScope',
	
	function ($http, $rootScope) {

		var widgets = {};
		var serviceBase = '/api/dataservice/',
			factory = {
		                loginPath: '/login',
		        user: {
                		    isAuthenticated: false,
		                    roles: null
			}
		};

		var widget = function(name, widget){
			var w = angular.extend({reload: false, frameless: false}, widget);
		        if ( w.edit ){
				var edit = {
					reload: true,
					immediate: false,
					apply: defaultApplyFunction
				};
				angular.extend(edit, w.edit);
				w.edit = edit;
			}
			widgets[name] = w;
			return this;
		};

        }
]);
