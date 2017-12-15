    var injectParams = ['$scope', '$rootScope', 'eventbus', '$http', '$location', 'searchService', '$timeout', '$window', '$homerModal', 'userProfile',
        'localStorageService', '$filter', 'SweetAlert', '$state', 'EVENTS'
    ];

    var CallSearchController = function($scope, $rootScope, eventbus, $http, $location, searchService, $timeout, $window, $homerModal, userProfile, localStorageService, $filter, SweetAlert, $state, EVENTS) {

        console.log("SEARCH CALL");

        var that = this;

        $scope.infosearch =  $filter('translate')('hepic.pages.search.RESULTS') || "Search Results";

        //$rootScope.loggedIn = false;
        $scope.expandme = true;
        $scope.showtable = true;
        $scope.dataLoading = false;

        $scope.$on("$destroy", function() {
            eventbus.broadcast(EVENTS.DESTROY_REFESH, "1");
            myListener();
        });

        var myListener = eventbus.subscribe(EVENTS.SEARCH_CALL_SUBMIT, function(event, name, model) {
            $scope.processSearchResult();
        });

        var myRefresh = eventbus.subscribe(EVENTS.WIDGETS_GLOBAL_RELOAD, function(event, name, model) {
            // console.log('timerange change!');
	    if ($scope.autorefresh) { $scope.processSearchResult(); }
            else { $scope.bump = true; }
        });

	/* Autorefresh Event Handler - fires ON/OFF */
	$scope.autorefresh = false;
        var myRefresh = eventbus.subscribe(EVENTS.WIDGETS_GLOBAL_AUTOREFRESH, function(event, name, model) {
		console.log('AUTOREFRESH:',name);
		if (parseInt(name) > 0) $scope.autorefresh = true;
		else $scope.autorefresh = false;
        });


        // process the form
        $scope.processSearchResult = function() {

            $scope.bump = false;

            /* save data for next search */
            var data = {
                param: {},
                timestamp: {}
            };

            var transaction = userProfile.getProfile("transaction");
            var limit = userProfile.getProfile("limit");
            var timezone = userProfile.getProfile("timezone");
            var value = userProfile.getProfile("search");
            var node = userProfile.getProfile("node").dbnode;


            /* force time update for "last x minutes" ranges */
            var timeNow = userProfile.getProfile("timerange_last");
            if (timeNow > 0) {
                console.log('fast-forward to last ' + timeNow + ' minutes...');
                var diff = (new Date().getTimezoneOffset() - timezone.value);
                var dt = new Date(new Date().setMinutes(new Date().getMinutes() - timeNow + diff));
                var timedate = {
                    from: dt,
                    to: new Date(new Date().setMinutes(new Date().getMinutes() + diff)),
                    custom: 'Now() - ' + timeNow
                };
                userProfile.setProfile("timerange", timedate);
            } else {
                var timedate = userProfile.getProfile("timerange");
            }

            /* query manipulation functions & store */
            $scope.searchParams = value;
            $scope.killParam = function(param) {
                SweetAlert.swal({
                        title: "Remove Filter?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            delete $scope.searchParams[param];
                            $scope.processSearchResult();
                        }
                    }
                );
            }

            $scope.editParam = function(param) {
                SweetAlert.swal({
                        title: "Edit Filter: ["+param+"]",
                        type: "input",
                        showCancelButton: true,
                        confirmButtonText: "Update",
                        closeOnConfirm: true,
                        closeOnCancel: true,
			inputPlaceholder: $scope.searchParams[param]
                    },
                    function(input) {
                        if (input) {
                            $scope.searchParams[param] = input;
                            $scope.processSearchResult();
                        }
                    }
                );
            }

            $scope.searchParamsBackup = {};
            $scope.swapParam = function(param) {
                if (!$scope.searchParamsBackup[param]) {
                    $scope.searchParamsBackup[param] = $scope.searchParams[param];
                    delete $scope.searchParams[param];
                } else {
                    $scope.searchParams[param] = $scope.searchParamsBackup[param];
                    delete $scope.searchParamsBackup[param];
                }
            }

            /* preference processing */
            var sObj = {};
            var searchQueryObject = $location.search();
            if (searchQueryObject.hasOwnProperty("query")) {
                var rison = searchQueryObject.query;
                rison = rison.substring(1, rison.length - 2);
                var ar = rison.split('\',');
                for (i = 0; i < ar.length; i++) {
                    var va = ar[i].split(':\'')
                    sObj[va[0]] = va[1];
                }
            }

            $scope.diff = (new Date().getTimezoneOffset() - timezone.value);
            var diff = $scope.diff * 60 * 1000;
            $scope.offset = timezone.offset;

            if (Object.keys(sObj).length == 0) {

                /* make construct of query */
                data.param.transaction = {};
                data.param.limit = limit;
                data.param.search = value;
                data.param.location = {};
                //data.param.location.node = node;
                data.param.timezone = timezone;
                data.timestamp.from = timedate.from.getTime() - diff;
                data.timestamp.to = timedate.to.getTime() - diff;
                angular.forEach(transaction.transaction, function(v, k) {
                    data.param.transaction[v.name] = true;
                });

            } else {

                data.timestamp.from = timedate.from.getTime() + diff;
                data.timestamp.to = timedate.to.getTime() + diff;
                data.param.transaction = {};

                var searchValue = {};

                if (sObj.hasOwnProperty("limit")) limit = sObj["limit"];
                if (sObj.hasOwnProperty("startts")) {
                    data.timestamp.from = sObj["startts"] * 1000;
                }
                if (sObj.hasOwnProperty("endts")) {
                    data.timestamp.to = sObj["endts"] * 1000;
                }

                if (sObj.hasOwnProperty("startdate")) {
                    var v = new Date(sObj["startdate"]);
                    data.timestamp.from = v.getTime();
                }
                if (sObj.hasOwnProperty("enddate")) {
                    var v = new Date(sObj["enddate"]);
                    data.timestamp.to = v.getTime();
                    console.log(data);
                }

                if (sObj.hasOwnProperty("trancall")) data.param.transaction["call"] = true;
                if (sObj.hasOwnProperty("tranreg")) data.param.transaction["registration"] = true;
                if (sObj.hasOwnProperty("tranrest")) data.param.transaction["rest"] = true;

                //search_callid                                       
                if (sObj.hasOwnProperty("search_callid")) searchValue["callid"] = sObj["search_callid"];
                if (sObj.hasOwnProperty("search_ruri_user")) searchValue["ruri_user"] = sObj["search_ruri_user"];
                if (sObj.hasOwnProperty("search_from_user")) searchValue["from_user"] = sObj["search_from_user"];
                if (sObj.hasOwnProperty("search_to_user")) searchValue["to_user"] = sObj["search_to_user"];

                data.param.limit = limit;
                data.param.search = searchValue;
                data.param.location = {};
                //data.param.location.node = node;

                /* set back timerange */
                timedate.from = new Date(data.timestamp.from - diff);
                timedate.to = new Date(data.timestamp.to - diff);
                userProfile.setProfile("timerange", timedate);
                eventbus.broadcast(EVENTS.SET_TIME_RANGE, timedate);
            }

            $scope.dataLoading = true;

            searchService.searchCallByParam(data).then(
                function(sdata) {
                    if (sdata) {
                        $scope.restoreState();
                        $scope.count = sdata.length;
                        $scope.gridOpts.data = sdata;
                        $scope.Data = sdata;
                        $timeout(function() {
                            angular.element($window).resize();
                        }, 200)
                    }
                },
                function(sdata) {
                    return;
                }).finally(
                function() {
                    $scope.dataLoading = false;
                    //$scope.$apply();
                });
        };

        //$timeout(function(){
        //any code in here will automatically have an apply run afterwards
        //     $scope.$apply();
        //});

        userProfile.getAllServerRemoteProfile();

        /* first get profile */
        userProfile.getAll().then(
            function(sdata) {
                $scope.processSearchResult();
            },
            function(sdata) {
                return;
            }).finally(function() {});


        /* DATA */
        $scope.swapData = function() {
            //$scope.gridOpts.data = data1;
            //$scope.$apply();
        };

        $scope.hashCode = function(str) { // java String#hashCode
            var hash = 0;
            if (str) {
                for (var i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
            }
            return hash;
        };

        $scope.intToARGB = function(i) {
            //return ((i>>24)&0xFF).toString(16) + ((i>>16)&0xFF).toString(16) + ((i>>8)&0xFF).toString(16) + (i&0xFF).toString(16);
            return ((i >> 24) & 0xFF);
        }

        $scope.getBkgColorTable = function(callid) {
            var his = $scope.hashCode(callid);
            //var color = "#"+$scope.intToARGB(his);
            //var color = "hsl("+$scope.intToARGB(his)+", 75%, 75%)";
            var color = "hsla(0, 0%, 84%, 1)";
            return {
                "background-color": color
            }
        };

        $scope.showMessage = function(localrow, event) {
            var search_data = {
                timestamp: {
                    from: parseInt(localrow.entity.micro_ts / 1000) - 100,
                    to: parseInt(localrow.entity.micro_ts / 1000) + 100
                },
                param: {
                    search: {
                        id: parseInt(localrow.entity.id),
                        callid: localrow.entity.callid
                    },
                    location: {
                        //node: localrow.entity.dbnode
                    },
                    transaction: {
                        call: false,
                        registration: false,
                        rest: false
                    }
                }
            };


            /* here should be popup selection by transaction type. Here can trans['rtc'] == true */
            search_data['param']['transaction'][localrow.entity.trans] = true;
            var messagewindowId = "" + localrow.entity.id + "_" + localrow.entity.trans;

            $homerModal.open({
                url: 'templates/dialogs/message.html',
                cls: 'homer-modal-message',
                id: "message" + messagewindowId.hashCode(),
                divLeft: event.clientX.toString() + 'px',
                divTop: event.clientY.toString() + 'px',
                params: search_data,
                onOpen: function() {
                    console.log('modal1 message opened from url ' + this.id);
                },
                controller: 'messageCtrl'
            });
        };

        $scope.getColumnValue = function(row, col) {
            return row.entity[col.field + '_alias'] == undefined ? row.entity[col.field + '_ip'] : row.entity[col.field + '_alias'];
        }
        $scope.getColumnTooltip = function(row, col) {
            return row.entity[col.field + '_ip'];
        }

        $scope.protoCheck = function(row, col) {
            if (parseInt(row.entity.proto) == 1) return "udp";
            else if (parseInt(row.entity.proto) == 2) return "tcp";
            else if (parseInt(row.entity.proto) == 3) return "wss";
            else if (parseInt(row.entity.proto) == 4) return "sctp";
            else return "udp";
        }
        
        $scope.eventCheck = function(row, col) {
            if (parseInt(row.entity.event) == 1) return "MOS";
            else if (parseInt(row.entity.event) == 2) return "Rec";
            else if (parseInt(row.entity.event) == 3) return "M+R";
            else return "no";
        }

        $scope.dateConvert = function(value) {

            var dt = new Date(parseInt(value / 1000));
            //dt.setMinutes(dt.getMinutes() + this.diff);    	    	  
            //this.diff  
            return $filter('date')(dt, 'yyyy-MM-dd HH:mm:ss.sss Z', $scope.offset);
        }

        $scope.dateSecondsConvert = function(value) {

            var dt = new Date(parseInt(value * 1000));
            return $filter('date')(dt, 'yyyy-MM-dd HH:mm:ss.sss Z', $scope.offset);
        }

        $scope.getCountryFlag = function(value) {

            if (value == "") value = "UN";

            return "/resources/app/images/cc/" + value + ".gif";
        }

        $scope.getCallStatus = function(value, transaction) {

            var status = parseInt(value);
            var result = "unknown";
            if (transaction === "call") {
                switch (status) {
                    case 1:
                        result = $filter('translate')('hepic.pages.status.INIT') || "Init";
                        break;
                    case 2:
                        result = $filter('translate')('hepic.pages.status.UNAUTH') || "Unauthorized";
                        break;
                    case 3:
                        result = $filter('translate')('hepic.pages.status.PROGRESS') || "Progress";
                        break;
                    case 4:
                        result = $filter('translate')('hepic.pages.status.RINGING') || "Ringing";
                        break;
                    case 5:
                        result = $filter('translate')('hepic.pages.status.CONNECTED') || "Connected";
                        break;
                    case 6:
                        result = $filter('translate')('hepic.pages.status.MOVED') || "Moved";
                        break;
                    case 7:
                        result = $filter('translate')('hepic.pages.status.BUSY') || "Busy";
                        break;
                    case 8:
                        result = $filter('translate')('hepic.pages.status.USERFAIL') || "User Failure";
                        break;
                    case 9:
                        result = $filter('translate')('hepic.pages.status.HARDFAIL') || "Hard Failure";
                        break;
                    case 10:
                        result = $filter('translate')('hepic.pages.status.FINISHED') || "Finished";
                        break;
                    case 11:
                        result = $filter('translate')('hepic.pages.status.CANCELED') || "Canceled";
                        break;
                    case 12:
                        result = $filter('translate')('hepic.pages.status.TIMEOUT') || "Timeout";
                        break;
                    case 13:
                        result = $filter('translate')('hepic.pages.status.BADTERM') || "Bad Term";
                        break;
                    case 14:
                        result = $filter('translate')('hepic.pages.status.DECLINED') || "Declined";
                        break;
                    case 15:
                        result = $filter('translate')('hepic.pages.status.UNKNOWNTERM') || "Unknown Term";
                        break;
                    default:
                        result = $filter('translate')('hepic.pages.status.UNKNOWN') || "unknown";
                        break;
                }
            }

            return result;
        }

        $scope.getCallStatusColor = function(value, rowIsSelected, transaction) {
            var status = parseInt(value);
            var color = "white";

            if (transaction === "call") {
                if (rowIsSelected) {
                    switch (status) {
                        case 1:
                            color = "#CC1900";
                            break;
                        case 2:
                            color = "#FF3332";
                            break;
                        case 3:
                            color = "#B8F2FF";
                            break;
                        case 4:
                            color = "#B8F2FF";
                            break;
                        case 5:
                            color = "#44c51a";
                            break;
                        case 6:
                            color = "#D7CAFA";
                            break;
                        case 7:
                            color = "#FFF6BA";
                            break;
                        case 8:
                            color = "F41EC7";
                            break;
                        case 9:
                            color = "F41EC7";
                            break;
                        case 10:
                            color = "#186600";
                            break;
                        case 11:
                            color = "#FFF6BA";
                            break;
                        case 12:
                            color = "#FF7F7E";
                            break;
                        case 13:
                            color = "#FF7F7E";
                            break;
                        case 14:
                            color = "F41EC7";
                            break;
                        case 15:
                            color = "F41EC7";
                            break;
                        default:
                            color = "FFF6BA";
                    }
                } else {
                    switch (status) {
                        case 1:
                            color = "#9E1E1E";
                            break;
                        case 2:
                            color = "#FF3332";
                            break;
                        case 3:
                            color = "#DDF8FD";
                            break;
                        case 4:
                            color = "#DDF8FD";
                            break;
                        case 5:
                            color = "#44c51a";
                            break;
                        case 6:
                            color = "#E7DDFD";
                            break;
                        case 7:
                            color = "#CCB712";
                            break;
                        case 8:
                            color = "##BC270B";
                            break;
                        case 9:
                            color = "#CEB712";
                            break;
                        case 10:
                            color = "#186600";
                            break;
                        case 11:
                            color = "#CEB712";
                            break;
                        case 12:
                            color = "#FF9F9E";
                            break;
                        case 13:
                            color = "#FF9F9E";
                            break;
                        case 14:
                            color = "#CDB712";
                            break;
                        case 15:
                            color = "#FDE2DD";
                            break;
                        default:
                            color = "FFF6BA";
                    }
                }
            }

            return {
                "color": color
            };
        }


        $scope.getMosColor = function(rowmos) {
            var mos = parseInt(rowmos / 100);
            if (mos <= 2) {
                return {
                    "color": "red"
                };
            } else if (mos <= 3) {
                return {
                    "color": "orange"
                };
            } else {
                return {
                    "color": "green"
                };
            }
        }


        $scope.getCallIDColor = function(str) {

            if(str === undefined || str === null) return str;

            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            i = hash;
            var col = ((i >> 24) & 0xAF).toString(16) + ((i >> 16) & 0xAF).toString(16) +
                ((i >> 8) & 0xAF).toString(16) + (i & 0xAF).toString(16);
            if (col.length < 6) col = col.substring(0, 3) + '' + col.substring(0, 3);
            if (col.length > 6) col = col.substring(0, 6);
            //return '<span style="color:#'+col+';">' + str + '</span>';
            return {
                "color": "#" + col
            };
        }


        $scope.getCallDuration = function(start, stop) {
            if (stop < start || !stop) return "";
            var diff = new Date((stop - start)).getTime();
            var hours = Math.floor(diff / 3600) % 24
            var minutes = Math.floor(diff / 60) % 60
            var seconds = diff % 60
            return ("0" + hours).slice(-2) + ":" +
                ("0" + minutes).slice(-2) + ":" +
                ("0" + seconds).slice(-2);
        }

        $scope.showTransaction = function(localrow, event) {

            var rows = $scope.gridApi.selection.getSelectedRows();
            var callids = [];
            var uuids = [];
            var nodes = [];

            callids.push(localrow.entity.callid);
            if(localrow.entity.uuid && localrow.entity.uuid.length > 1) uuids.push(localrow.entity.uuid);

            console.log(localrow);
            
            console.log("BEFORE",callids);
            console.log("UUID",uuids);

            if (callids.indexOf(localrow.entity.hep_correlation_id) == -1 && localrow.entity.hep_correlation_id.length > 1) callids.push(localrow.entity.hep_correlation_id);

            angular.forEach(rows, function(row, key) {
                if (callids.indexOf(row.callid) == -1) { 
                        console.log("CC", rows);
                        callids.push(row.callid);
                }
                if (callids.indexOf(row.hep_correlation_id) == -1 && row.hep_correlation_id.length > 1) {
                    console.log("CORR",rows);
                    callids.push(row.hep_correlation_id);
                }
                if (nodes.indexOf(row.dbnode) == -1) nodes.push(row.dbnode);

                if (row.uuid && row.uuid.length > 1 && uuids.indexOf(row.uuid) == -1) { 
                        console.log("UUID", row.uuid);
                        uuids.push(row.uuid);
                }
                
            });

            console.log(localrow);

            var stop = localrow.entity.cdr_stop > (localrow.entity.micro_ts / 1000000) ? (localrow.entity.cdr_stop * 1000) : parseInt(localrow.entity.micro_ts / 1000);
            
            console.log("AFTER",callids);

            var search_data = {
                timestamp: {
                    from: parseInt(localrow.entity.micro_ts / 1000 - (5 * 1000)),
                    to: parseInt(stop + (300 * 1000))
                },
                param: {
                    search: {
                        id: parseInt(localrow.entity.id),
                        callid: callids,
                        uuid: uuids,
                        uniq: false
                    },
                    location: {
                        //node: nodes
                    },
                    transaction: {
                        call: false,
                        registration: false,
                        rest: false
                    },
                    id: {
                        uuid: localrow.entity.uuid
                    }
                }
            };

            /* set to to our last search time */
            //var timedate = searchService.getTimeRange();
            var diff = $scope.diff * 60 * 1000;

            var timezone = userProfile.getProfile("timezone");
            var timedate = userProfile.getProfile("timerange");
            //search_data['timestamp']['to'] = timedate.to.getTime() - diff + 300*100;
            localrow.entity.trans = "call";
            search_data['param']['transaction'][localrow.entity.trans] = true;
            var trwindowId = "" + localrow.entity.callid + "_" + localrow.entity.dbnode;

            nodes = userProfile.getProfile("node");
            //search_data['param']['location']['node'] = nodes['dbnode'];

            var search_profile = userProfile.getProfile("search");
            if (search_profile.hasOwnProperty('uniq')) {
                search_data['param']['search']['uniq'] = search_profile.uniq;
            }

            search_data['param']['timezone'] = timezone;

            $homerModal.open({
                url: 'templates/dialogs/transaction/call.html',
                cls: 'homer-modal-content',
                id: "trans" + trwindowId.hashCode(),
                params: search_data,
                divLeft: event.clientX.toString() / 2 + 'px',
                divTop: ((event.clientY + window.innerHeight / 2) < window.innerHeight) ? event.clientY.toString() + 'px' : (event.clientY - ((event.clientY + window.innerHeight / 1.8) - window.innerHeight)).toString() + 'px',
                onOpen: function() {
                    console.log('modal1 transaction opened from url', this.id);
                },
                controller: 'transactionCallCtrl'
            });
        };

        $scope.showInfo = function(row) {

            console.log(row);
        };

        $scope.fileOneUploaded = true;
        $scope.fileTwoUploaded = false;

        /*
	    $scope.getTableHeight = function() {
	        var rowHeight = 30; 
	        var headerHeight = 30;
	        return {
	            height: ($scope.gridOpts.data.length * rowHeight + headerHeight) + "px"
                };
            };
            */

        var rowtpl = '<div ng-style="row.isSelected && {} || grid.appScope.getBkgColorTable(row.entity.callid)">' +
            '<div ng-dblclick="grid.appScope.showTransaction(row, $event)"  ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div>' +
            '</div>';
           
           
       var myColumnDefs = [{
                field: 'id',
                displayName: $filter('translate')('hepic.pages.results.ID') ? $filter('translate')('hepic.pages.results.ID') : 'Id',
                type: 'number',
                cellTemplate: '<div  ng-click="grid.appScope.showTransaction(row, $event)" class="ui-grid-cell-contents"><span>{{COL_FIELD}}</span></div>',
                width: "*"
            }, {
                field: 'micro_ts',
                displayName: $filter('translate')('hepic.pages.results.DATE') ? $filter('translate')('hepic.pages.results.DATE') : 'Date',
                cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.dateConvert(row.entity.micro_ts)}}</div>',
                //cellFilter: 'date:\'yyyy-MM-dd HH:mm:ss.sss Z\':\'\+0400\'',
                resizable: true,
                type: 'date',
                width: "*",
                minWidth: 180
            }, {
                field: 'callid',
                displayName: $filter('translate')('hepic.pages.results.CALLID') ? $filter('translate')('hepic.pages.results.CALLID') : 'CallID',
                resizable: true,
                width: "*",
                minWidth: 180,
                type: 'string',
                cellTemplate: '<div class="ui-grid-cell-contents" ng-click="grid.appScope.showTransaction(row, $event)"><span ng-style="grid.appScope.getCallIDColor(row.entity.callid)" title="{{COL_FIELD}}">{{COL_FIELD}}</span></div>'
            }, {
                field: 'from_user',
                displayName: $filter('translate')('hepic.pages.results.FROMUSER') ? $filter('translate')('hepic.pages.results.FROMUSER') : 'From User',
                resizable: true,
                type: 'string',
                width: "*"
            }, {
                field: 'ruri_user',
                displayName: $filter('translate')('hepic.pages.results.RURIUSER') ? $filter('translate')('hepic.pages.results.RURIUSER') : 'RURI user',
                type: 'string',
                resizable: true,
                width: "*"
            }, {
                field: 'to_user',
                displayName: $filter('translate')('hepic.pages.results.TOUSER') ? $filter('translate')('hepic.pages.results.TOUSER') : 'To User',
                resizable: true,
                type: 'string',
                width: "*"
            }, {
                field: 'geo_cc',
                displayName: $filter('translate')('hepic.pages.results.GEODST') ? $filter('translate')('hepic.pages.results.GEODST') : 'Geo',
                resizable: true,
                type: 'string',
                width: "*",
                maxWidth: 50,
                cellTemplate: '<div ng-show="COL_FIELD" class="ui-grid-cell-contents" title="{{COL_FIELD}}" alt="{{COL_FIELD}}"><span style="font-size:7px;"><img ng-src="{{grid.appScope.getCountryFlag(row.entity.geo_cc)}}" lazy-src border="0"></span></div>'
            }, {
                field: 'uas',
                type: 'string',
                displayName: $filter('translate')('hepic.pages.results.USERAGENT') ? $filter('translate')('hepic.pages.results.USERAGENT') : 'User Agent',
                width: "*",
            }, {
                field: 'status',
                displayName: $filter('translate')('hepic.pages.results.STATUS') ? $filter('translate')('hepic.pages.results.STATUS') : 'Status',
                minWidth: 100,
                resizable: true,
                type: 'string',
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents"><span ng-style="grid.appScope.getCallStatusColor(row.entity.status, row.isSelected, row.entity.transaction)" title="status">{{grid.appScope.getCallStatus(row.entity.status,row.entity.transaction)}}</span></div>'
            }, {
                name: 'source',
                field: 'source_ip',
                minWidth: 120,
                resizable: true,
                type: 'string',
                width: "*",
                displayName: $filter('translate')('hepic.pages.results.SRCIP') ? $filter('translate')('hepic.pages.results.SRCIP') : 'Source Host',
                cellTemplate: '<div class="ui-grid-cell-contents" title="{{ grid.appScope.getColumnTooltip(row, col) }}">{{COL_FIELD}}</div>'
            }, {
                field: 'source_port',
                displayName: $filter('translate')('hepic.pages.results.SRCPORT') ? $filter('translate')('hepic.pages.results.SRCPORT') : 'SPort',
                minwidth: 80,
                type: 'number',
                width: "*",
                resizable: true
            }, {
                field: 'destination_ip',
                displayName: $filter('translate')('hepic.pages.results.DSTIP') ? $filter('translate')('hepic.pages.results.DSTIP') : 'Destination Host',
                minWidth: 120,
                width: "*",
                type: 'string',
                cellTemplate: '<div class="ui-grid-cell-contents" title="{{ grid.appScope.getColumnTooltip(row, col) }}">{{ COL_FIELD }}</div>'
            }, {
                field: 'destination_port',
                minWidth: 50,
                type: 'number',
                width: "*",
                displayName: $filter('translate')('hepic.pages.results.DSTPORT') ? $filter('translate')('hepic.pages.results.DSTPORT') : 'DPort'
            }, {
                field: 'cdr_duration',
                displayName: $filter('translate')('hepic.pages.results.DURATION') ? $filter('translate')('hepic.pages.results.DURATION') : 'Duration',
                type: 'date',
                minWidth: 80,
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.getCallDuration(row.entity.cdr_start, row.entity.cdr_stop)}}</div>'
            }, {
                field: 'reserve',
                displayName: $filter('translate')('hepic.pages.results.RESERVED') ? $filter('translate')('hepic.pages.results.RESERVED') : 'MOS',
                type: 'string',
                minWidth: 40,
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents"><span ng-style="grid.appScope.getMosColor(row.entity.reserve)">{{ row.entity.reserve ? (row.entity.reserve / 100) : "" }}</span></div>'
            }, {
                field: 'cdr_start',
                visible: false,
                displayName: $filter('translate')('hepic.pages.results.CDRSTART') ? $filter('translate')('hepic.pages.results.CDRSTART') : 'Start',
                type: 'date',
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.dateSecondsConvert(row.entity.cdr_start)}}</div>'
            }, {
                field: 'cdr_stop',
                visible: false,
                displayName: $filter('translate')('hepic.pages.results.CDRSTOP') ? $filter('translate')('hepic.pages.results.CDRSTOP') : 'Stop',
                type: 'date',
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.dateSecondsConvert(row.entity.cdr_stop)}}</div>'
            }, {
                field: 'proto',
                displayName: $filter('translate')('hepic.pages.results.PROTO') ? $filter('translate')('hepic.pages.results.PROTO') : 'Proto',
                type: 'number',
                resizable: true,
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents" title="proto">{{grid.appScope.protoCheck(row, col)}}</div>'
            }, {
                field: 'event',
                displayName: $filter('translate')('hepic.pages.results.EVENT') ? $filter('translate')('hepic.pages.results.EVENT') : 'Event',
                type: 'string',
                resizable: true,
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents" title="proto">{{grid.appScope.eventCheck(row, col)}}</div>'
            }, {
                field: 'node',
                displayName: $filter('translate')('hepic.pages.results.NODE') ? $filter('translate')('hepic.pages.results.NODE') : 'Node',
                visible: false,
                width: "*",
                type: 'string',
            }, {
                field: 'hep_correlation_id',
                displayName: $filter('translate')('hepic.pages.results.CORRELATION_ID') ? $filter('translate')('hepic.pages.results.CORRELATION_ID') : 'Correlation ID',
                visible: false
            }, {
                field: 'srd',
                displayName: $filter('translate')('hepic.pages.results.SRD') ? $filter('translate')('hepic.pages.results.SRD') : 'SRD',
                visible: false                
            }, {
                field: 'sss',
                displayName: $filter('translate')('hepic.pages.results.SSS') ? $filter('translate')('hepic.pages.results.SSS') : 'SSS',
                visible: false                
            }, {
                field: 'geo_lat',
                displayName: $filter('translate')('hepic.pages.results.GEOLAT') ? $filter('translate')('hepic.pages.results.GEOLAT') : 'GEO Lat',
                visible: false                
            }, {            
                field: 'geo_lan',
                displayName: $filter('translate')('hepic.pages.results.GEOLAN') ? $filter('translate')('hepic.pages.results.GEOLAN') : 'GEO Lan',
                visible: false                
            }, {                        
                field: 'sdp_ap',
                displayName: $filter('translate')('hepic.pages.results.SDPAUDIO') ? $filter('translate')('hepic.pages.results.SDPAUDIO') : 'SDP Audio',
                visible: false                
            }, {
                field: 'codec_in_audio',
                displayName: $filter('translate')('hepic.pages.results.SDPCODEC') ? $filter('translate')('hepic.pages.results.SDPCODEC') : 'Codec Audio',
                visible: false            
            }, {
                field: 'sdmedia_ip',
                displayName: $filter('translate')('hepic.pages.results.SDPMEDIA') ? $filter('translate')('hepic.pages.results.SDPMEDIA') : 'SDP Media IP',
                visible: false                                
            }, {                                    
                field: 'xgroup',
                displayName: $filter('translate')('hepic.pages.results.XGROUP') ? $filter('translate')('hepic.pages.results.XGROUP') : 'X-Group',
                visible: false                                
            }, {                                    
                field: 'mos',
                displayName: $filter('translate')('hepic.pages.results.MOS') ? $filter('translate')('hepic.pages.results.MOS') : 'MOS 2',
                visible: false                
        }];             

        if(USER_EXT_CR)
        {
            
            myColumnDefs = myColumnDefs.concat([
		{
                	field: 'tradeid',
	                displayName: $filter('translate')('hepic.pages.extended.TRADE_ID') || 'H.TradeID',
        	        visible: false
		}, {
                	field: 'origtrunkid',
	                displayName: $filter('translate')('hepic.pages.extended.ORIG_ID') || 'H. Orig.TrID',
        	        visible: false
		}, {
                	field: 'termtrunkid',
	                displayName: $filter('translate')('hepic.pages.extended.TERM_ID') || 'H. Term.TrID',
        	        visible: false
		}, {
                	field: 'hashrateid',
	                displayName: $filter('translate')('hepic.pages.extended.RATE_ID') || 'H. RateID',
        	        visible: false
		}, {
                	field: 'hashrouteid',
	                displayName: $filter('translate')('hepic.pages.extended.ROUTE_ID') || 'H. RouteID',
        	        visible: false
		}, {
                	field: 'mos',
	                displayName: 'MOS 2',
        	        visible: false
		}]);
        }
            
          
        $scope.gridOpts = {
            saveWidths: true,
            saveOrder: true,
            saveVisible: true,
            saveFocus: false,
            saveScroll: false,
            saveGrouping: false,
            saveGroupingExpandedStates: true,
            enableColumnResizing: true,
            treeRowHeaderAlwaysVisible: false,
            enableSorting: true,
            enableRowSelection: true,
            enableGridMenu: true,
            enableRowHeaderSelection: true,
            showGridFooter: true,
            noUnselect: false,
            //modifierKeysToMultiSelect: true,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            multiSelect: true,
            enablePaging: true,
            paginationPageSizes: [25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 2000],
            paginationPageSize: 25,
            enableFiltering: true,
            rowTemplate: rowtpl,
            exporterMenuPdf: false,
            filterOptions: { filterText: "", useExternalFilter: false },
            columnDefs: myColumnDefs
        };

        $scope.state = localStorageService.get('localStorageGrid');

        //$scope.state = {};

        $scope.saveState = function() {
            $scope.state = $scope.gridApi.saveState.save();
            localStorageService.set('localStorageGrid', $scope.state);
        };

        $scope.restoreState = function() {
            $scope.state = localStorageService.get('localStorageGrid');
            if ($scope.state) $scope.gridApi.saveState.restore($scope, $scope.state);
        };

        $scope.resetState = function() {
            $scope.state = {};
            $scope.gridApi.saveState.restore($scope, $scope.state);
            localStorageService.set('localStorageGrid', $scope.state);
        };


        eventbus.subscribe(EVENTS.GRID_STATE_SAVE, function(event, args) {
            console.log("save");
            $scope.saveState();
        });

        eventbus.subscribe(EVENTS.GRID_STATE_RESTORE, function(event, args) {
            console.log("restore");
            $scope.restoreState();
        });

        eventbus.subscribe(EVENTS.GRID_STATE_RESET, function(event, args) {
            console.log("reset");
            $scope.resetState();
        });



        $scope.gridOpts.rowIdentity = function(row) {
            return row.id;
        };

        $scope.gridOpts.onRegisterApi = function(gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                //$state.go("contact.details.view", {contactId: row.entity.contactId});
                //console.log(row);
            });

        };

        $scope.searchData = function() {
            $scope.gridOpts.data = $filter('messageSearch')($scope.Data, $scope.gridOpts, $scope.searchText);
        };
    };


    CallSearchController.$inject = injectParams;
export default CallSearchController;
