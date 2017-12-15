/*global angular*/
var injectParams = ['$scope', '$location', '$rootScope','authService','eventbus', '$state', '$timeout','dialogs','userProfile','messagesService','SweetAlert','EVENTS','CONFIGURATION'];

var HepicController = function ($scope, $location, $rootScope, authService, eventbus, $state, $timeout, $dialogs, userProfile, messagesService, SweetAlert, EVENTS, CONFIGURATION) {

  var vm = this,appTitle = 'HEPIC ' + HEPIC_VERSION;
  vm.isCollapsed = false;
  vm.appTitle = appTitle;
  
  vm.highlight = function (path) {
    return $location.path().substr(0, path.length) === path;
  };

  $rootScope.hepicApp = 'HEPIC';
  $rootScope.homerVersion = HEPIC_VERSION;
  console.log('HEPIC HOMER:', $rootScope.homerVersion);

  $scope.header = 'templates/empty.html';
  $scope.menu = 'templates/empty.html';
  $scope.ribbon = 'templates/empty.html';
  $scope.footer = 'templates/empty.html';
  $scope.shortcut = 'templates/empty.html';
  $scope.templateSet = false;
  $scope.messagesQuanity = 0;
  $scope.messagesPool = [];
  $scope.showNewMessage = false;
  
  $rootScope.currentUser = {};
  angular.extend($rootScope, { center: {}, markers: {}, });

  angular.element(document).on('click', function (event) {
    if (!angular.element(event.target).closest('.js-dropdown').length ) {
      angular.element('.active.js-dropdown > a, .open.js-dropdown > a').click();
    } else {
      if (!angular.element('.active.js-dropdown > a, .open.js-dropdown > a').is(event.target) && !angular.element(event.target).closest('.js-dropdown .dropdown-content').length) {
        if (!($scope.flagCloseMenu &&  angular.element(event.target).is('.dropdown-toggle')) ) {
          angular.element('.active.js-dropdown > a, .open.js-dropdown > a').click();
        }
      }
    }
    $scope.flagCloseMenu = angular.element(event.target).is('.dropdown-toggle');
  });
        
  vm.loginOrOut = function () {
    setLoginLogoutText();
    var isAuthenticated = authService.user.isAuthenticated;
    if (isAuthenticated) { //logout 
      authService.logout().then(function () {
        $state.go('login');
        return;
      });
    }
    redirectToLogin();
  };

  function redirectToLogin() {
    $state.go('login');
  }

  function toggle(obj) {
    if (obj == 'boolDropDownAlert') {
      $scope.boolDropDownAlert = !$scope.boolDropDownAlert;
    } else {
      $scope.boolDropDownAlert = false;
    }
    if (obj == 'boolDropDownSearch') {
      $scope.boolDropDownSearch = !$scope.boolDropDownSearch;
    } else {
      $scope.boolDropDownSearch = false;
    }
    if (obj == 'boolDropDownUserMenu') {
      $scope.boolDropDownUserMenu = !$scope.boolDropDownUserMenu;
    } else {
      $scope.boolDropDownUserMenu = false;
    }
    if (obj == 'boolDropDownLastMenu') {
      $scope.boolDropDownLastMenu = !$scope.boolDropDownLastMenu;
    } else {
      $scope.boolDropDownLastMenu = false;
    }
    if (obj == 'boolDropDownRefreshMenu') {
      $scope.boolDropDownRefreshMenu = !$scope.boolDropDownRefreshMenu;
    } else {
      $scope.boolDropDownRefreshMenu = false;
    }
  }

  $scope.showAlertBox = function() {
    toggle('boolDropDownAlert');
  };
  $scope.showSearchBox = function() {
    toggle('boolDropDownSearch');
  };
  $scope.showUserMenuBox = function() {
    toggle('boolDropDownUserMenu');
  };
  $scope.showLastMenuBox = function() {
    toggle('boolDropDownLastMenu');
  };

  $scope.showRefreshMenuBox = function(text) {
    toggle('boolDropDownRefreshMenu');
    if (text) {
      $scope.textAutoUp = text;
    }
  };

  $scope.textAutoUp = 'off';
  $scope.searchClass = 'btn btn-primary';
  $scope.showMenu = function() {
    $scope.showLeftMenu = !$scope.showLeftMenu;
  };

  $scope.doLogout = function() {
    $scope.showLeftMenu = false;
    $scope.dropDownUserMenuClass = '';
    messagesService.closeWebsocket();
    
    authService.logout().then(function () {
      console.log('redirect to LOGIN');
      eventbus.broadcast(EVENTS.USER_LOGGED_OUT, 2);
      return;
    });
  };

  $scope.doResetProfile = function() {
    $scope.showLeftMenu = false;
    $scope.dropDownUserMenuClass = '';
    userProfile.deleteAllProfile();
    $location.path(homer.modules.auth.routes.logout);
  };
        
  $scope.doResetDashboard = function() {
    $scope.showLeftMenu = false;
    $scope.dropDownUserMenuClass = '';

    SweetAlert.swal({
      title: 'Are you sure?',
      text: 'Your will not be able to recover this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, reset it!',
      closeOnConfirm: true,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
        if ($scope.dashboard) $scope.dashboard.widgets = [];
        userProfile.resetDashboards();
        $scope.doLogout();
      }
    });
  };

  $scope.doUserProfile = function() {
    eventbus.broadcast(EVENTS.SHOW_USER_PROFILE, '1');
  };

  $scope.showSettings = function() {
    console.log('SEEE!!');
    $state.go('settings.profile', { paramID: 'user' });
    //eventbus.broadcast(EVENTS.SHOW_USER_SETTINGS, '1');
  };

  $scope.showUserMessages = function() {
    eventbus.broadcast(EVENTS.SHOW_USER_MESSAGES, '1');
  };

  $scope.doSaveGridState = function() {
    eventbus.broadcast(EVENTS.GRID_STATE_SAVE, '1');
  };

  $scope.doRestoreGridState = function() {
    eventbus.broadcast(EVENTS.GRID_STATE_RESTORE, '1');
  };

  $scope.doResetGridState = function() {
    eventbus.broadcast(EVENTS.GRID_STATE_RESET, '1');
    $state.go('dashboard', { boardID: 'home' });
  };
        
  $scope.addDashBoardDialog = function() {
    console.log('PROCEDURE ADD NEW');
    var dlg = $dialogs.create('templates/dialogs/newdialog.html', 'newDashboardCtrl', {}, {
      keyboard: true,
      backdrop: 'static'
    });
  
    dlg.result.then(function(dashboard) {
      if (dashboard.name != 'upload') {
        $scope.dashboardname = dashboard.name;
        console.log('NEW REQUEST',  EVENTS.DASHBOARD_NEW_ITEM);
        eventbus.broadcast(EVENTS.DASHBOARD_NEW_ITEM, dashboard);
      } else {
        console.log('SEND!!!!!!!!!!!');
        eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, dashboard.name);
      }
    }, function() {
      $scope.name = 'No name, defaulting to New';
    });
  };
        
        
  function setLoginLogoutText() {
    vm.loginLogoutText = (authService.user.isAuthenticated) ? 'Logout' : 'Login';
  }

        
  /* close popup */
  $scope.closeMessage = function(index) {
    console.log('CLOSE', index);
    $scope.messagesPool.splice(index, 1);
    $scope.messagesQuanity = $scope.messagesPool.length;
  };
                
  /********************************* EVENTS *****************************************************/
   
  var deregisterLoggedIn = eventbus.subscribe(EVENTS.USER_LOGGED_IN, function() {
    if (!messagesService.isInit()) messagesService.initSocket();

    if (!$scope.templateSet) {
      $scope.header = 'templates/header.html';
      $scope.menu = 'templates/left-panel.html';
      $scope.ribbon = 'templates/ribbon.html';
      $scope.footer = 'templates/footer.html';
      $scope.shortcut = 'templates/shortcut.html';
      $scope.templateSet = true;
      if ($state.current.name != '' && $state.current.name != 'login') {
        $state.go($state.current, {}, {
          reload: true
        });
      }
    }
  });
        
  var deregisterLoggedOut = eventbus.subscribe(EVENTS.USER_LOGGED_OUT, function() {
    authService.logoutSession();
    console.log('LOGOIYT111', authService.user);

    if ($scope.templateSet) {
      $scope.header = null;
      $scope.menu = null;
      $scope.ribbon = null;
      $scope.footer = null;
      $scope.shortcut = null;
      $scope.templateSet = false;
    }
    
    redirectToLogin();
  });
        
  var deregisterShowNotify = eventbus.subscribe(EVENTS.SHOW_NOTIFY, function(event, message) {
    console.log('SHOW NOTIFY', message);
    
    SweetAlert.swal({
      title: 'Notify: '+message.title,
      text: message.message,
      timer: 5000,
      type: 'info'
    });
  });

  var deregisterLoginStatusChanged = eventbus.subscribe(EVENTS.LOGIN_STATUS_CHANGED, function (loggedIn) {
    setLoginLogoutText(loggedIn);
  });
        
  var deregisterShowMessageDialog = eventbus.subscribe(EVENTS.SHOW_NEW_MESSAGE, function (event, message) {
    console.log('New Message', message);
    
    var newMessage = {
      title: 'new',
      sender: message.sender,
      text: message.message,
      class: 'massage__wr-notification_red',
      timerecv: message.timestamp
    };
    
    $scope.messagesPool.push(newMessage);
    $scope.messagesQuanity = $scope.messagesPool.length;
    
    /* new message */  
    $scope.showNewMessage = true;
    $scope.newmessage = {
      title: 'new',
      sender: message.sender,
      text: 'New message from [' + message.sender +']',
      class: 'massage__wr-notification_blue',
      timerecv: message.timestamp
    };

    $timeout(function(){ $scope.showNewMessage = false; },6000);
  });

  var deregisterRedirect = eventbus.subscribe(EVENTS.REDIRECT_TO_LOGIN, function () {
    console.log('REDIRECT ON....');
    if ($scope.templateSet) {
      console.log('SET');
      $scope.header = null;
      $scope.menu = null;
      $scope.ribbon = null;
      $scope.footer = null;
      $scope.shortcut = null;
      $scope.templateSet = false;
    }
    redirectToLogin();
  });
        
  var deregisterWebSocket = eventbus.subscribe(EVENTS.WEBSOCKET_OPEN, function () {
    console.log('REDIRECT ON....');
    messagesService.sendSystemMessage(authService.user.name,'registration', 'User logged in');
  });
        
    /* COMMAND */
  var deregisterWebsocketCommand = eventbus.subscribe(EVENTS.WEBSOCKET_COMMAND, function (event, message) {
    console.log('Websocket Command:', message.command);
    
    if (message.command == 'logout') {
      $scope.doLogout();
    } else if (message.command == 'redirect') {
      $state.go(message.type, JSON.parse(message.message));
    } else if (message.command == 'message') {
      SweetAlert.swal({
        title: 'New Message from: '+message.sender + ', Event: '+message.event,
        text: message.message,
        timer: 5000,
        type: 'info'
      });
    } else if (message.command == 'version') {
      SweetAlert.swal({
        title: 'Version request',
        text: 'Your current version: '+CONFIGURATION.VERSION+'. \nSystem:' + message.message,
        timer: 5000,
        type: 'info'
      });
    } else {
      console.log('UNKNOWN COMMAND:', message.command);
    }
  });

  setLoginLogoutText();
  
  // cancel interval on scope destroy
  $scope.$on('$destroy', function(){
    console.log('destroy hepicController');

    deregisterLoginStatusChanged();
    deregisterLoggedIn();
    deregisterRedirect();
    deregisterLoggedOut();
    deregisterShowNotify();
    deregisterShowMessageDialog();
    deregisterWebSocket();
    deregisterWebsocketCommand();
  });

};

HepicController.$inject = injectParams;
export default HepicController;
