    var injectParams = ['$http', '$rootScope','eventbus', '$q', 'EVENTS'];

    var authFactory = function ($http, $rootScope, eventbus, $q, EVENTS) {

        var serviceBase = '/api/v2/',
            factory = {
                loginPath: '/login',
                user: {
                    isAuthenticated: false,
		    name: null,
		    firstname: null,
		    lastname: null,
		    gid: 10,
                    permissions: null
                }
            };
        
	factory.login = function (username, password, auth_type) {
		var defer = $q.defer();

                $http.post(serviceBase + 'session', { username: username, password: password, auth_type: auth_type }).then(
				/* good response */
                                function (results) {
                                    console.log(results.data);
                                    if(results.data.auth == false) {
                                         defer.reject('Unknown Username / Password combination');
                                    }
                                    else {
                                        changeAuth(true, results.data.data);
                                        console.log(results.data.data.group);
                                        eventbus.broadcast(EVENTS.USER_LOGGED_IN, factory.user);
                                        defer.resolve(factory.user);
                                    }
                                },
                                /* bad response */
                                function (results) {
                                        console.log(results);
                                        defer.reject('Unknown Username / Password combination');
                                }
                            );

                            return defer.promise;
	};


	
	factory.session = function () {
                        var defer = $q.defer();

                        $http.get('api/v2/session').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == false) {
                                changeAuth(false, null);
                                eventbus.broadcast(EVENTS.NOT_AUTHORIZED, factory.user);
                                defer.reject('Unknown Session');
                            }
                            else {
                                changeAuth(true, results.data.data);
                                eventbus.broadcast(EVENTS.USER_LOGGED_IN, factory.user);
                                defer.resolve(factory.user);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown. BAD response!');
                        }
                    );

                    return defer.promise;
        };

	factory.getUser = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/account/user').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown');
                            }
                            else {
                                changeAuth(true, results.data.data);
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
	};

        factory.fullUser = function () {

                   var defer = $q.defer();

                   $http.get('api/v2/account/user').then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                                defer.reject('unknown username');
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };

	factory.updateUser = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/account/user', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };
        
        factory.updatePassword = function (profile) {

                   var defer = $q.defer();

                   $http.put('api/v2/account/password', profile).then(
                        /* good response */
                        function (results) {
                            if(results.data.auth == "false") {
                                console.log("SESSION:" + results.data.auth);
                            }
                            else {
                                defer.resolve(results.data);
                            }
                        },
                        /* bad response */
                        function (results) {
                                defer.reject('Unknown Username');
                        }
                    );

                    return defer.promise;
        };


        factory.logout = function () {
                    // we should only remove the current user.
                    // routing back to login login page is something we shouldn't
                    // do here as we are mixing responsibilities if we do.
                    var defer = $q.defer();

                    console.log("LOGOUT");
                    changeAuth(false, null);
                                                    
                    $http.delete('api/v2/session').then(
                        /* good response */
                        function (results) {
                            defer.resolve(false);
                        },
                        /* bad response */
                        function (results) {
                            defer.reject(false);
                        }
                    );

                    return defer.promise;

        };
        
        factory.logoutSession = function () {
                    console.log("LOGOUT");
                    changeAuth(false, null);                                                    
        };

        factory.getCurrentLoginUser = function () {
               return factory.user;
        };

        factory.redirectToLogin = function () {
            console.log("REDIRECT");            
            eventbus.broadcast(EVENTS.REDIRECT_TO_LOGIN, null);
        };

        function changeAuth(loggedIn, data) {

            factory.user.isAuthenticated = loggedIn;

            if(loggedIn)
            {
                factory.user.name = data.username;
                factory.user.gid = data.gid;
                factory.user.uuid = data.uuid;
                factory.user.permissions = data.group.split(",");
                factory.user.firstname = data.firstname;
                factory.user.lastname = data.lastname;
            }
            
            eventbus.broadcast(EVENTS.LOGIN_STATUS_CHANGED, loggedIn);
        }
        
        return factory;
    };

    authFactory.$inject = injectParams;

export default authFactory;
