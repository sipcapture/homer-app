    var injectParams = ['$scope', '$rootScope', '$filter', 'userProfile', 'eventbus', '$interval', '$state', 'EVENTS'];

    var DatepickerController = function ($scope, $rootScope, $filter, userProfile, eventbus, $interval, $state, EVENTS) {

        var dt = new Date(new Date().setHours(new Date().getHours() - 2));
        
        //console.log("REGISTERED", userProfile);

        $scope.timerange = userProfile.profileScope.timerange;
        $scope.timezone = userProfile.profileScope.timezone;        
        
        var stop;
        (function() {
            $scope.$watch(function() {
                return userProfile.profileScope.timerange;
            }, function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.timerange = newVal;
                    updateTimeRange(true);
                }
            });
        })();
        
        (function() {
            $scope.$watch(function() {
                return userProfile.profileScope.timezone;
            }, function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.timezone = newVal;
                    for( var prop in $scope.timezones ) {
                        if( $scope.timezones[prop].value == $scope.timezone.value ) {
                                $scope.timezone.name = $scope.timezones[prop].name;
                                $scope.timezone.offset = $scope.timezones[prop].offset;
                        }
                    }
                    updateTimeRange(true);
                }
            });
        })();
        
        $scope.$watch('timezone.value', function(oldVal, newVal) {

                if(oldVal != newVal) {                                         
                    var diff = oldVal - newVal;
                    var ct = new Date($scope.timerange.customFrom);
                    ct.setMinutes(ct.getMinutes() - diff);                
                    $scope.timerange.customFrom = ct;
                    ct = new Date($scope.timerange.customTo);
                    ct.setMinutes(ct.getMinutes() - diff);                
                    $scope.timerange.customTo = ct;
                    $scope.timerange.to = $scope.timerange.customTo;
                    $scope.timerange.from = $scope.timerange.customFrom;
                    updateTimeRange(false);
                }                
                
                return true;
        });
        
        $scope.timezones = [
         {value: 60, offset: '-0100', name: 'GMT-1', desc: 'GMT-1'},
	 {value: 120, offset: '-0200', name: 'GMT-2', desc: 'GMT-2'},
	 {value: 180, offset: '-0300', name: 'GMT-3', desc: 'GMT-3'},
	 {value: 240, offset: '-0400', name: 'GMT-4 AST', desc: 'Atlantic Standard Time (Canada)'},
	 {value: 300, offset: '-0500', name: 'GMT-5 EST', desc: 'Eastern Standard Time (USA & Canada)'},
	 {value: 360, offset: '-0600', name: 'GMT-6 CST', desc: 'Central Standard Time (USA & Canada)'},
	 {value: 420, offset: '-0700', name: 'GMT-7 MST', desc: 'Mountain Standard Time (USA & Canada)'},
	 {value: 480, offset: '-0800', name: 'GMT-8 PST', desc: 'Pacific Standard Time (USA & Canada)'},
	 {value: 0, offset: '+0000', name: 'GMT+0 UTC', desc: 'Greenwich Mean Time'},
	 {value: -60, offset: '+0100', name: 'GMT+1 CET', desc: 'Central European Time'},
	 {value: -120, offset: '+0200', name: 'GMT+2 EET', desc: 'Eastern European Time'},
	 {value: -180, offset: '+0300', name: 'GMT+3 MSK', desc: 'Moscow Standard Time'},
	 {value: -240, offset: '+0400', name: 'GMT+4', desc: 'GMT +4'},
	 {value: -300, offset: '+0500', name: 'GMT+5', desc: 'GMT +5'},
	 {value: -360, offset: '+0600', name: 'GMT+6', desc: 'GMT +6'},
	 {value: -420, offset: '+0700', name: 'GMT+7', desc: 'GMT +7'},
	 {value: -480, offset: '+0800', name: 'GMT+8 CCT', desc: 'China Coast Time'},
	 {value: -520, offset: '+0900', name: 'GMT+9 JST', desc: 'Japan Standard Time'},
	 {value: -600, offset: '+1000', name: 'GMT+10 EAST', desc: 'East Australian Standard Time'},
	 {value: -660, offset: '+1100', name: 'GMT+11 AEDT', desc: 'Australian Eastern Daylight Time'}
	];
                
        $scope.toggleMin = function() {
            $scope.minDate = $scope.minDate ? null : new Date().setFullYear(2013, 0, 1);
            $scope.maxDate = $scope.maxDate ? null : new Date().setFullYear(2032, 0, 1);
        };
        $scope.toggleMin();
        $scope.dateOptions = {
            formatYear: "yy",
            startingDay: 1,
            showWeeks: false
        };
        $scope.formats = [ "yyyy/MM/dd", "yyyy-MM-dd", "dd.MM.yyyy", "shortDate" ];
        $scope.formatDate = $scope.formats[1];        
        $scope.hstep = 1;
        $scope.mstep = 1;
        $scope.sstep = 1;
        $scope.setFromNow = function() {
            var dt = new Date(new Date().setMinutes(new Date().getMinutes() + 5));
            $scope.timerange = {
                from: new Date(),
                to: dt
            };
            userProfile.setProfile("timerange", $scope.timerange);
            eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
        };
        $scope.timeWindow = false;
        
        function updateTimeRange(refreshCustom) {
            if ($scope.timerange.custom) {
                $scope.filterIndicator = $scope.timerange.custom;
            } else {
                var timeDiff;
                timeDiff = $scope.timerange.to - $scope.timerange.from;
                var namezone = "";
                       
		for( var prop in $scope.timezones ) {
			if( $scope.timezones[prop].value == $scope.timezone.value ) {
				$scope.timezone.name = $scope.timezones[prop].name;
				$scope.timezone.offset = $scope.timezones[prop].offset;
		        }
		}

                $scope.filterIndicator = $filter("date")($scope.timerange.from, "MMM, dd, yyyy, HH:mm:ss") + " to " + $filter("date")($scope.timerange.to, "MMM, dd, yyyy, HH:mm:ss");
                
            }
            if (refreshCustom) {
                $scope.timerange.customFrom = $scope.timerange.from;
                $scope.timerange.customTo = $scope.timerange.to;
            }
        }
        $scope.updateFrequency = "";
        updateTimeRange(true);
        $rootScope.setRange = function(type, tss) {
            //console.log("SELECT RANGE:", tss);
            if ($scope.timerange.to != tss.to || $scope.timerange.from != tss.from) {
                $scope.timerange.to = tss.to;
                $scope.timerange.from = tss.from;
                $scope.timerange.custom = "";
                userProfile.setProfile("timerange", $scope.timerange);
                eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
                updateTimeRange(true);
            }
        };
        $scope.toggleTimeWindow = function() {
            $scope.timeWindow = !$scope.timeWindow;
        };
        $scope.isActive = function(item) {
            if ($scope.timerange.custom == item) {
                return true;
            }
            return false;
        };
                
        $scope.isUpdatingActive = function(item) {
            if ($scope.updateFrequency == item) {
                return true;
            }
            return false;
        };
        $scope.selectCustomeTime = function() {
            $scope.timerange.custom = "";
            $scope.timerange.to = new Date($scope.timerange.customTo);
            $scope.timerange.from = new Date($scope.timerange.customFrom);
            userProfile.setProfile("timerange_last", -1);
            userProfile.setProfile("timerange", $scope.timerange);
            userProfile.setProfile("timezone", $scope.timezone);
            eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
            $scope.timeWindow = false;
            updateTimeRange(false);
        };
        $scope.last = function(min, text) {
            var diff = (new Date().getTimezoneOffset() - $scope.timezone.value);                                     
            var dt = new Date(new Date().setMinutes(new Date().getMinutes() - min + diff));
            $scope.timerange = {
                from: dt,
                to: new Date(new Date().setMinutes(new Date().getMinutes() + diff)),
                custom: text
            };
            userProfile.setProfile("timerange_last", min);
            userProfile.setProfile("timerange", $scope.timerange);
            userProfile.setProfile("timezone", $scope.timezone);
            eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
            $scope.timeWindow = false;
            updateTimeRange(true);
        };        
        
        $scope.dayselect = function(day, text) {
        
            var min = day * 1440;
            var diff = (new Date().getTimezoneOffset() - $scope.timezone.value);                                     
            var bdt = new Date(new Date().setMinutes(new Date().getMinutes() + min + diff));
            var sdt = new Date(new Date().setMinutes(new Date().getMinutes() + min + diff));
            bdt.setHours(0,0,0,0);
            sdt.setHours(23,59,59,99);
                        
            $scope.timerange = {
                from: bdt,
                to: sdt,
                custom: text
            };
            userProfile.setProfile("timerange", $scope.timerange);
            userProfile.setProfile("timezone", $scope.timezone);
            eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
            $scope.timeWindow = false;
            updateTimeRange(true);
        };        
        
        $scope.next = function(min, text) {
            var diff = (new Date().getTimezoneOffset() - $scope.timezone.value);                                     
            var dt = new Date(new Date().setMinutes(new Date().getMinutes() + min + diff));
            $scope.timerange = {
                from: new Date(new Date().setMinutes(new Date().getMinutes() + diff)),
                to: dt,
                custom: text
            };
            userProfile.setProfile("timerange", $scope.timerange);
            userProfile.setProfile("timezone", $scope.timezone);
            eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
            $scope.timeWindow = false;
            updateTimeRange(true);
        };
        $scope.modelDateP = {};
        $scope.open = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.modelDateP[opened] = !$scope.modelDateP[opened];
        };
        $scope.setToNow = function(type) {
             var diff = (new Date().getTimezoneOffset() - $scope.timezone.value);
            if (type == 1) {
                $scope.timerange.customFrom = new Date().setMinutes(new Date().getMinutes() + diff);
            } else {
                $scope.timerange.customTo = new Date().setMinutes(new Date().getMinutes() + diff);
            }
        };
        $scope.refresh = function(seconds, name) {
            console.log("REFRESH:" + seconds);
            seconds = parseInt(seconds);
            if (seconds < 1) {
                eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
                eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_AUTOREFRESH, 0);
                return;
            } else {
                eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_AUTOREFRESH, 1);
	    }
            if (angular.isDefined(stop)) {
                $scope.cancelRefresh();
            }
            $scope.timeWindow = false;
            $scope.activeInterval = true;
            if ($state.current.name == "result") {
                stop = $interval(function() {
                    $scope.timerange.to.setSeconds($scope.timerange.to.getSeconds() + seconds);
                    userProfile.setProfile("timerange", $scope.timerange);
                    userProfile.setProfile("timezone", $scope.timezone);
                    eventbus.broadcast("resultSearchSubmit", "fullsearch");
                }, seconds * 1e3);
            } else {
                stop = $interval(function() {
                    updateTimeRange(false);
                    $scope.timerange.from.setSeconds($scope.timerange.from.getSeconds() + seconds);
                    $scope.timerange.to.setSeconds($scope.timerange.to.getSeconds() + seconds);
                    userProfile.setProfile("timerange", $scope.timerange);
                    userProfile.setProfile("timezone", $scope.timezone);
                    eventbus.broadcast(EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
                }, seconds * 1e3);
            }
            $scope.updateFrequency = name;
        };
        $scope.cancelRefresh = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
                $scope.activeInterval = false;
            }
            $scope.timeWindow = false;
            $scope.updateFrequency = "";
        };
        var deregisterRefresh = eventbus.subscribe('destroyRefresh', function(event, name, model) {
            $scope.cancelRefresh();
        });
        var deregisterTimeRange = eventbus.subscribe('setTimeRange', function(event, timeRange, model) {
            $scope.timerange = timeRange;
            console.log("SET RANGE", $scope.timerange);
            userProfile.setProfile("timerange", $scope.timerange);            
            updateTimeRange(true);                        
        });

	
	// cancel interval on scope destroy
        $scope.$on('$destroy', function(){
		console.log("destroy datepickerController");

                deregisterRefresh();
		deregisterTimeRange();
	});


    };

    DatepickerController.$inject = injectParams;
export default DatepickerController;
