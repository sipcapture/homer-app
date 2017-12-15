    var injectSessionRecovererParams = ['$q', '$timeout', 'eventbus', '$rootScope', '$location', 'EVENTS'];

    var sessionRecovererFactory = function ($q, $timeout, eventbus, $rootScope, $location, EVENTS) {

        var factory = {};

        factory.request = function (config) {
	        // console.log(config); // Contains the data about the request before it is sent.
	        // Return the config or wrap it in a promise if blank.
		//Lorenzo, here is timeout : 10 seconds = 10000 ms 
		var mytimeout = 10000;
	        config.timeout = $timeout(function(){ config.timedOut = true },mytimeout,false);

        	return config || $q.when(config);
	},

	factory.responseError = function (response) {
	
	        // Session has expired                  
	        if (response.status == 403){
	                
	                 $rootScope.loggedIn = false;	                 
	                 //authService.logoutSession();	                 
	                 console.log("EXPIRED. Do redirect");
	                 eventbus.broadcast(EVENTS.USER_LOGGED_OUT);	                 
	                 //eventbus.broadcast(EVENTS.SHOW_NOTIFY);	                 
	                 //$state.go('login');
	                 //$location.path('/login');
                } 
		else {

			if(response.config.timedOut){ //if rejected because of the timeout - show a popup 
				var message = {
					title: "Timeout",
					message: "Request take too long... "+(mytimeout/1000)+" seconds"
				}
				eventbus.broadcast(EVENTS.SHOW_NOTIFY, message);

        		}
			/* another stuff.... 503, 501... but better to check */
			else 
			{
				var message = {
					title: "test",
					message: "Just message"
				}
				eventbus.broadcast(EVENTS.SHOW_NOTIFY, message);
			}
		} 

	        return $q.reject(response);
        };

        return factory;
    };

    sessionRecovererFactory.$inject = injectSessionRecovererParams;
export default sessionRecovererFactory;
