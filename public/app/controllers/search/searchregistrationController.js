    var injectParams = ['$scope', '$rootScope', 'eventbus', '$http', '$location', 'searchService', '$timeout', '$window', '$homerModal', 'userProfile',
        'localStorageService', '$filter', 'SweetAlert', '$state', 'EVENTS'
    ];

    var RegistrationSearchController = function($scope, $rootScope, eventbus, $http, $location, searchService, $timeout, $window, $homerModal, userProfile, localStorageService, $filter, SweetAlert, $state, EVENTS) {

        console.log("SEARCH REGISTRATION");

        var that = this;

        $scope.infosearch = "Registration Search Results";

        //$rootScope.loggedIn = false;
        $scope.expandme = true;
        $scope.showtable = true;
        $scope.dataLoading = false;

        var fromTime = 0;
        var toTime = 0;        

        $scope.$on("$destroy", function() {
            eventbus.broadcast(EVENTS.DESTROY_REFESH, "1");
            myListener();
        });

        var myListener = eventbus.subscribe(EVENTS.SEARCH_REGISTRATION_SUBMIT, function(event, name, model) {
            $scope.processSearchResult();
        });

        var myRefresh = eventbus.subscribe(EVENTS.WIDGETS_GLOBAL_RELOAD, function(event, name, model) {
            // console.log('timerange change!');
            $scope.bump = true;
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

            /* from && to for transaction */
            fromTime = data.param.from;
            toTime = data.param.to;

            searchService.searchRegistrationByParam(data).then(
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

        $scope.getRegistrationStatus = function(value, transaction) {

            var status = parseInt(value);
            var result = "unknown";
            if (transaction === "registration") {
                switch (status) {
                    case 1:
                        result = "Init";
                        break;
                    case 2:
                        result = "Unauthorized";
                        break;
                    case 3:
                        result = "Registered";
                        break;
                    case 4:
                        result = "Moved";
                        break;
                    case 5:
                        result = "Blocked";
                        break;
                    case 6:
                        result = "Timeout";
                        break;
                    case 7:
                        result = "User Failure";
                        break;
                    case 8:
                        result = "Hard Failure";
                        break;
                    case 9:
                        result = "Unknown Term";
                        break;
                    default:
                        result = "unknown";
                        break;
                }
            } else {
                if (status == 1) result = "Init";
                else if (status == 2) result = "Unauthorized";
                else if (status == 3) result = "Registered";
                else if (status == 4) result = "Moved";
                else if (status == 4) result = "Moved";
                else if (status == 5) result = "Blocked";
                else if (status == 6) result = "Timeout";
                else if (status == 7) result = "Soft Term";
                else if (status == 8) result = "Hard Term";
                else if (status == 9) result = "Unknown";
                else result = "Status " + value;
            }

            return result;
        }

        $scope.getRegistrationStatusColor = function(value, rowIsSelected, transaction) {
            var status = parseInt(value);
            var color = "white";

            if (transaction === "registration") {
                if (rowIsSelected) {
                    switch (status) {
                        case 1:
                            color = "#CC1900";
                            break;
                        case 2:
                            color = "#FF3332";
                            break;
                        case 3:
                            color = "#F41EC7";
                            break;
                        case 4:
                            color = "#B8F2FF";
                            break;
                        case 5:
                            color = "#C0FFAC";
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
                            color = "#71C466";
                            break;
                        case 4:
                            color = "#71C486";
                            break;
                        case 5:
                            color = "#E1FDDD";
                            break;
                        case 6:
                            color = "#E7DDFD";
                            break;
                        case 7:
                            color = "#FDF9DD";
                            break;
                        case 8:
                            color = "#FDE2DD";
                            break;
                        case 9:
                            color = "#FDE2DD";
                            break;
                        case 10:
                            color = "#186600";
                            break;
                        case 11:
                            color = "#FDF9DD";
                            break;
                        case 12:
                            color = "#FF9F9E";
                            break;
                        case 13:
                            color = "#FF9F9E";
                            break;
                        case 14:
                            color = "#FDE2DD";
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

        $scope.getRegistrationIDColor = function(str) {

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


        $scope.getRegistrationExpire = function(start, expire) {
            if (!expire || expire == 0) return '-';
            var now = new Date().getTime();
            var diff = new Date((start + expire) * 1000).getTime();
            if (now > diff) return "Expired";

            var stop = start + (expire);
            console.log('xxxxxxxxxxx', parseInt(now / 1000), start, stop);
            var diff = new Date((stop - (now / 1000))).getTime();
            var hours = Math.floor(diff / 3600) % 24
            var minutes = Math.floor(diff / 60) % 60
            var seconds = diff % 60
            return ("0" + hours).slice(-2) + ":" +
                ("0" + minutes).slice(-2) + ":" +
                ("0" + seconds).slice(-2);
        }
        
        $scope.displayExpire = function(request, response) {
            
            return response ? resposnse : request;
        }

        $scope.showTransaction = function(localrow, event) {

            var rows = $scope.gridApi.selection.getSelectedRows();
            var callids = [];
            var uuids = [];                        
            var nodes = [];

            callids.push(localrow.entity.callid);

            console.log(localrow);

            if (callids.indexOf(localrow.entity.hep_correlation_id) == -1 && localrow.entity.hep_correlation_id.length > 1) callids.push(localrow.entity.hep_correlation_id);
            if(localrow.entity.uuid && localrow.entity.uuid.length > 1) uuids.push(localrow.entity.uuid);
                        

            angular.forEach(rows, function(row, key) {
                if (callids.indexOf(row.callid) == -1) callids.push(row.callid);
                if (callids.indexOf(row.hep_correlation_id) == -1 && row.hep_correlation_id.length > 1) callids.push(row.hep_correlation_id);
                if (nodes.indexOf(row.dbnode) == -1) nodes.push(row.dbnode);
		if (row.uuid && row.uuid.length > 1 && uuids.indexOf(row.uuid) == -1) {
                        console.log("UUID", row.uuid);
                        uuids.push(row.uuid);
                }
            });

            console.log(localrow);

            var stop = localrow.entity.cdr_stop > (localrow.entity.micro_ts / 1000000) ? (localrow.entity.cdr_stop * 1000) : parseInt(localrow.entity.micro_ts / 1000);
            //from: parseInt(localrow.entity.micro_ts / 1000 - (5 * 1000)),
            //to: parseInt(stop + (300 * 1000))            
            var stop = localrow.entity.cdr_stop > (localrow.entity.micro_ts / 1000000) ? (localrow.entity.cdr_stop * 1000) : parseInt(localrow.entity.micro_ts / 1000);

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
            
            console.log("SEARCH REG", search_data);

            $homerModal.open({
                url: 'templates/dialogs/transaction/registration.html',
                cls: 'homer-modal-content',
                id: "trans" + trwindowId.hashCode(),
                params: search_data,
                divLeft: event.clientX.toString() / 2 + 'px',
                divTop: ((event.clientY + window.innerHeight / 2) < window.innerHeight) ? event.clientY.toString() + 'px' : (event.clientY - ((event.clientY + window.innerHeight / 1.8) - window.innerHeight)).toString() + 'px',
                onOpen: function() {
                    console.log('modal1 transaction opened from url', this.id);
                },
                controller: 'transactionRegistrationCtrl'
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
            multiSelect: true,
            enablePaging: true,
            paginationPageSizes: [25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 2000],
            paginationPageSize: 25,
            enableFiltering: true,
            rowTemplate: rowtpl,
            exporterMenuPdf: false,

            filterOptions: {
                filterText: "",
                useExternalFilter: false
            },

            columnDefs: [{
                field: 'id',
                displayName: 'Id',
                type: 'number',
                cellTemplate: '<div  ng-click="grid.appScope.showTransaction(row, $event)" class="ui-grid-cell-contents"><span>{{COL_FIELD}}</span></div>',
                width: "*"
            }, {
                field: 'micro_ts',
                displayName: 'Date',
                cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.dateConvert(row.entity.micro_ts)}}</div>',
                //cellFilter: 'date:\'yyyy-MM-dd HH:mm:ss.sss Z\':\'\+0400\'',
                resizable: true,
                type: 'date',
                width: "*",
                minWidth: 180
            }, {
                field: 'callid',
                displayName: 'CallID',
                resizable: true,
                width: "*",
                minWidth: 180,
                type: 'string',
                cellTemplate: '<div class="ui-grid-cell-contents" ng-click="grid.appScope.showTransaction(row, $event)"><span ng-style="grid.appScope.getRegistrationIDColor(row.entity.callid)" title="{{COL_FIELD}}">{{COL_FIELD}}</span></div>'
            }, {
                field: 'from_user',
                displayName: 'From User',
                resizable: true,
                type: 'string',
                width: "*"
            }, {
                field: 'to_user',
                displayName: 'To User',
                resizable: true,
                type: 'string',
                width: "*"
            }, {
                field: 'auth_user',
                displayName: 'Auth user',
                type: 'string',
                resizable: true,
                width: "*"
            }, {
                field: 'geo_cc',
                displayName: 'Geo',
                resizable: true,
                type: 'string',
                width: "*",
                maxWidth: 50,
                cellTemplate: '<div ng-show="COL_FIELD" class="ui-grid-cell-contents" title="{{COL_FIELD}}" alt="{{COL_FIELD}}"><span style="font-size:7px;"><img ng-src="{{grid.appScope.getCountryFlag(row.entity.geo_cc)}}" lazy-src border="0"></span></div>'
            }, {
                field: 'uas',
                type: 'string',
                displayName: 'User Agent',
                width: "*",
            }, {
                field: 'status',
                displayName: 'Status',
                minWidth: 100,
                resizable: true,
                type: 'string',
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents"><span ng-style="grid.appScope.getRegistrationStatusColor(row.entity.status, row.isSelected, row.entity.transaction)" title="status">{{grid.appScope.getRegistrationStatus(row.entity.status,row.entity.transaction)}}</span></div>'
            }, {
                name: 'source',
                field: 'source_ip',
                minWidth: 120,
                resizable: true,
                type: 'string',
                width: "*",
                displayName: 'Source Host',
                cellTemplate: '<div class="ui-grid-cell-contents" title="{{ grid.appScope.getColumnTooltip(row, col) }}">{{COL_FIELD}}</div>'
            }, {
                field: 'source_port',
                displayName: 'SPort',
                minwidth: 80,
                type: 'number',
                width: "*",
                resizable: true
            }, {
                field: 'destination_ip',
                displayName: 'Destination Host',
                minWidth: 120,
                width: "*",
                type: 'string',
                cellTemplate: '<div class="ui-grid-cell-contents" title="{{ grid.appScope.getColumnTooltip(row, col) }}">{{ COL_FIELD }}</div>'
            }, {
                field: 'destination_port',
                minWidth: 50,
                type: 'number',
                width: "*",
                displayName: 'DPort'
            }, {
                field: 'cdr_start',
                visible: false,
                displayName: 'Start',
                type: 'date',
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.dateSecondsConvert(row.entity.cdr_start)}}</div>'
            }, {
                field: 'cdr_stop',
                visible: false,
                displayName: 'Stop',
                type: 'date',
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.dateSecondsConvert(row.entity.cdr_stop)}}</div>'
            }, {
                field: 'proto',
                displayName: 'Proto',
                type: 'number',
                resizable: true,
                width: "*",
                cellTemplate: '<div class="ui-grid-cell-contents" title="proto">{{grid.appScope.protoCheck(row, col)}}</div>'
            }, {
                field: 'expire_rep',
                displayName: 'Expire',
                type: 'date',
                resizable: true,
                cellTemplate: '<div class="ui-grid-cell-contents" title="expire">{{grid.appScope.displayExpire(row.entity.expire_rep, row.entity.expire_req)}} </div>',
                width: "*"
            }, {
                field: 'expired',
                displayName: 'Validity',
                type: 'date',
                resizable: true,
                cellTemplate: '<div class="ui-grid-cell-contents" title="expire">{{grid.appScope.getRegistrationExpire(row.entity.cdr_start, row.entity.expire_rep)}}</div>',
                width: "*"
            }, {
                field: 'node',
                displayName: 'Node',
                visible: false,
                width: "*",
                type: 'string',
            }, {
                field: 'xgroup',
                displayName: 'X-Group',
                visible: false
            }, {
                field: 'capt_id',
                displayName: 'Capture ID',
                visible: false
            }]
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


    RegistrationSearchController.$inject = injectParams;
export default RegistrationSearchController;
