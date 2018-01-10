/* global angular, window */

import { forEach } from 'lodash';

import data_grid_options from '../data/grid_options';

const SearchCallController = function($scope, $rootScope, EventBus, $http, $location, SearchService,
  $timeout, $window, $homerModal, UserProfile, localStorageService, $filter, SweetAlert, $state, EVENTS, $log, CONFIGURATION) {
  'ngInject';
  const self = this;

  self.$onInit = function () {
  };

  self.infosearch = $filter('translate')('hepic.pages.search.RESULTS') || 'Search Results';

  //$rootScope.loggedIn = false;
  self.expandme = true;
  self.showtable = true;
  self.dataLoading = false;

  $scope.$on('$destroy', function() {
    EventBus.broadcast(EVENTS.DESTROY_REFESH, '1');
    myListener();
  });

  var myListener = EventBus.subscribe(EVENTS.SEARCH_CALL_SUBMIT, function() {
    self.processSearchResult();
  });

  /* Autorefresh Event Handler - fires ON/OFF */
  self.autorefresh = false;

  // process the form
  self.processSearchResult = function() {
    self.bump = false;
    /* save data for next search */
    var data = {
      param: {},
      timestamp: {}
    };

    var transaction = UserProfile.getProfile('transaction');
    var limit = UserProfile.getProfile('limit');
    var timezone = UserProfile.getProfile('timezone');
    var value = UserProfile.getProfile('search');
    let timedate;

    /* force time update for "last x minutes" ranges */
    var timeNow = UserProfile.getProfile('timerange_last');
    if (timeNow > 0) {
      console.log('fast-forward to last ' + timeNow + ' minutes...');
      var diff = (new Date().getTimezoneOffset() - timezone.value);
      var dt = new Date(new Date().setMinutes(new Date().getMinutes() - timeNow + diff));
      timedate = {
        from: dt,
        to: new Date(new Date().setMinutes(new Date().getMinutes() + diff)),
        custom: 'Now() - ' + timeNow
      };
      UserProfile.setProfile('timerange', timedate);
    } else {
      timedate = UserProfile.getProfile('timerange');
    }

    /* query manipulation functions & store */
    self.searchParams = value;
    self.killParam = function(param) {
      SweetAlert.swal({
        title: 'Remove Filter?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, delete it!',
        closeOnConfirm: true,
        closeOnCancel: true
      },
      function(isConfirm) {
        if (isConfirm) {
          delete self.searchParams[param];
          self.processSearchResult();
        }
      });
    };

    self.editParam = function(param) {
      SweetAlert.swal({
        title: `Edit Filter: [${param}]`,
        type: 'input',
        showCancelButton: true,
        confirmButtonText: 'Update',
        closeOnConfirm: true,
        closeOnCancel: true,
        inputPlaceholder: self.searchParams[param]
      },
      function(input) {
        if (input) {
          self.searchParams[param] = input;
          self.processSearchResult();
        }
      });
    };

    self.searchParamsBackup = {};
    self.swapParam = function(param) {
      if (!self.searchParamsBackup[param]) {
        self.searchParamsBackup[param] = self.searchParams[param];
        delete self.searchParams[param];
      } else {
        self.searchParams[param] = self.searchParamsBackup[param];
        delete self.searchParamsBackup[param];
      }
    };

    /* preference processing */
    var sObj = {};
    var searchQueryObject = $location.search();
    if (searchQueryObject.hasOwnProperty('query')) {
      var rison = searchQueryObject.query;
      rison = rison.substring(1, rison.length - 2);
      var ar = rison.split('\',');
      for (let i = 0; i < ar.length; i++) {
        var va = ar[i].split(':\'');
        sObj[va[0]] = va[1];
      }
    }

    self.diff = (new Date().getTimezoneOffset() - timezone.value);
    diff = self.diff * 60 * 1000;
    self.offset = timezone.offset;

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
      forEach(transaction.transaction, function(v) {
        data.param.transaction[v.name] = true;
      });
    } else {

      data.timestamp.from = timedate.from.getTime() + diff;
      data.timestamp.to = timedate.to.getTime() + diff;
      data.param.transaction = {};

      var searchValue = {};

      if (sObj.hasOwnProperty('limit')) limit = sObj['limit'];
      if (sObj.hasOwnProperty('startts')) {
        data.timestamp.from = sObj['startts'] * 1000;
      }
      if (sObj.hasOwnProperty('endts')) {
        data.timestamp.to = sObj['endts'] * 1000;
      }

      if (sObj.hasOwnProperty('startdate')) {
        let v = new Date(sObj['startdate']);
        data.timestamp.from = v.getTime();
      }
      if (sObj.hasOwnProperty('enddate')) {
        let v = new Date(sObj['enddate']);
        data.timestamp.to = v.getTime();
        console.log(data);
      }

      if (sObj.hasOwnProperty('trancall')) data.param.transaction['call'] = true;
      if (sObj.hasOwnProperty('tranreg')) data.param.transaction['registration'] = true;
      if (sObj.hasOwnProperty('tranrest')) data.param.transaction['rest'] = true;

      if (sObj.hasOwnProperty('search_callid')) searchValue['callid'] = sObj['search_callid'];
      if (sObj.hasOwnProperty('search_ruri_user')) searchValue['ruri_user'] = sObj['search_ruri_user'];
      if (sObj.hasOwnProperty('search_from_user')) searchValue['from_user'] = sObj['search_from_user'];
      if (sObj.hasOwnProperty('search_to_user')) searchValue['to_user'] = sObj['search_to_user'];

      data.param.limit = limit;
      data.param.search = searchValue;
      data.param.location = {};

      /* set back timerange */
      timedate.from = new Date(data.timestamp.from - diff);
      timedate.to = new Date(data.timestamp.to - diff);
      UserProfile.setProfile('timerange', timedate);
      EventBus.broadcast(EVENTS.SET_TIME_RANGE, timedate);
    }

    self.dataLoading = true;

    SearchService.searchCallByParam(data).then(function(sdata) {
      if (sdata) {
        self.restoreState();
        self.count = sdata.length;
        self.gridOpts.data = sdata;
        self.Data = sdata;
        $timeout(function() {
          angular.element($window).resize();
        }, 200);
      }
    }).catch(function (error) {
      $log.error('search-call', error);
    }).finally(function() {
      self.dataLoading = false;
    });
  };

  UserProfile.getAllServerRemoteProfile();

  /* first get profile */
  UserProfile.getAll().then(function() {
    self.processSearchResult();
  }).catch(function(error) {
    $log.error('search-call', error);
  });

  self.hashCode = function(str) { // java String#hashCode
    var hash = 0;
    if (str) {
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return hash;
  };

  self.intToARGB = function(i) {
    return ((i >> 24) & 0xFF);
  };

  self.getBkgColorTable = function() {
    var color = 'hsla(0, 0%, 84%, 1)';
    return {
      'background-color': color
    };
  };

  self.showMessage = function(localrow, event) {
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
    var messagewindowId = '' + localrow.entity.id + '_' + localrow.entity.trans;

    $homerModal.open({
      url: 'templates/dialogs/message.html',
      //template: homer_message_template,
      cls: 'homer-modal-message',
      id: 'message' + self.hashCode(messagewindowId),
      divLeft: event.clientX.toString() + 'px',
      divTop: event.clientY.toString() + 'px',
      params: search_data,
      onOpen: function() {
        $log.debug('modal1 message opened from url ' + this.id);
      },
      controller: 'messageCtrl'
    });
  };

  self.getColumnValue = function(row, col) {
    return row.entity[col.field + '_alias'] == undefined ? row.entity[col.field + '_ip'] : row.entity[col.field + '_alias'];
  };
  self.getColumnTooltip = function(row, col) {
    return row.entity[col.field + '_ip'];
  };

  self.protoCheck = function(row) {
    if (parseInt(row.entity.proto) == 1) return 'udp';
    else if (parseInt(row.entity.proto) == 2) return 'tcp';
    else if (parseInt(row.entity.proto) == 3) return 'wss';
    else if (parseInt(row.entity.proto) == 4) return 'sctp';
    else return 'udp';
  };
    
  self.eventCheck = function(row) {
    if (parseInt(row.entity.event) == 1) return 'MOS';
    else if (parseInt(row.entity.event) == 2) return 'Rec';
    else if (parseInt(row.entity.event) == 3) return 'M+R';
    else return 'no';
  };

  self.dateConvert = function(value) {
    var dt = new Date(parseInt(value / 1000));
    return $filter('date')(dt, 'yyyy-MM-dd HH:mm:ss.sss Z', self.offset);
  };

  self.dateSecondsConvert = function(value) {
    var dt = new Date(parseInt(value * 1000));
    return $filter('date')(dt, 'yyyy-MM-dd HH:mm:ss.sss Z', self.offset);
  };

  self.getCountryFlag = function(value) {
    if (value == '') value = 'UN';
    return '/img/cc/' + value + '.gif';
  };

  self.getCallStatus = function(value, transaction) {
    var status = parseInt(value);
    var result = 'unknown';
    if (transaction === 'call') {
      switch (status) {
      case 1:
        result = $filter('translate')('hepic.pages.status.INIT') || 'Init';
        break;
      case 2:
        result = $filter('translate')('hepic.pages.status.UNAUTH') || 'Unauthorized';
        break;
      case 3:
        result = $filter('translate')('hepic.pages.status.PROGRESS') || 'Progress';
        break;
      case 4:
        result = $filter('translate')('hepic.pages.status.RINGING') || 'Ringing';
        break;
      case 5:
        result = $filter('translate')('hepic.pages.status.CONNECTED') || 'Connected';
        break;
      case 6:
        result = $filter('translate')('hepic.pages.status.MOVED') || 'Moved';
        break;
      case 7:
        result = $filter('translate')('hepic.pages.status.BUSY') || 'Busy';
        break;
      case 8:
        result = $filter('translate')('hepic.pages.status.USERFAIL') || 'User Failure';
        break;
      case 9:
        result = $filter('translate')('hepic.pages.status.HARDFAIL') || 'Hard Failure';
        break;
      case 10:
        result = $filter('translate')('hepic.pages.status.FINISHED') || 'Finished';
        break;
      case 11:
        result = $filter('translate')('hepic.pages.status.CANCELED') || 'Canceled';
        break;
      case 12:
        result = $filter('translate')('hepic.pages.status.TIMEOUT') || 'Timeout';
        break;
      case 13:
        result = $filter('translate')('hepic.pages.status.BADTERM') || 'Bad Term';
        break;
      case 14:
        result = $filter('translate')('hepic.pages.status.DECLINED') || 'Declined';
        break;
      case 15:
        result = $filter('translate')('hepic.pages.status.UNKNOWNTERM') || 'Unknown Term';
        break;
      default:
        result = $filter('translate')('hepic.pages.status.UNKNOWN') || 'unknown';
        break;
      }
    }

    return result;
  };

  self.getCallStatusColor = function(value, rowIsSelected, transaction) {
    var status = parseInt(value);
    var color = 'white';

    if (transaction === 'call') {
      if (rowIsSelected) {
        switch (status) {
        case 1:
          color = '#CC1900';
          break;
        case 2:
          color = '#FF3332';
          break;
        case 3:
          color = '#B8F2FF';
          break;
        case 4:
          color = '#B8F2FF';
          break;
        case 5:
          color = '#44c51a';
          break;
        case 6:
          color = '#D7CAFA';
          break;
        case 7:
          color = '#FFF6BA';
          break;
        case 8:
          color = 'F41EC7';
          break;
        case 9:
          color = 'F41EC7';
          break;
        case 10:
          color = '#186600';
          break;
        case 11:
          color = '#FFF6BA';
          break;
        case 12:
          color = '#FF7F7E';
          break;
        case 13:
          color = '#FF7F7E';
          break;
        case 14:
          color = 'F41EC7';
          break;
        case 15:
          color = 'F41EC7';
          break;
        default:
          color = 'FFF6BA';
        }
      } else {
        switch (status) {
        case 1:
          color = '#9E1E1E';
          break;
        case 2:
          color = '#FF3332';
          break;
        case 3:
          color = '#DDF8FD';
          break;
        case 4:
          color = '#DDF8FD';
          break;
        case 5:
          color = '#44c51a';
          break;
        case 6:
          color = '#E7DDFD';
          break;
        case 7:
          color = '#CCB712';
          break;
        case 8:
          color = '##BC270B';
          break;
        case 9:
          color = '#CEB712';
          break;
        case 10:
          color = '#186600';
          break;
        case 11:
          color = '#CEB712';
          break;
        case 12:
          color = '#FF9F9E';
          break;
        case 13:
          color = '#FF9F9E';
          break;
        case 14:
          color = '#CDB712';
          break;
        case 15:
          color = '#FDE2DD';
          break;
        default:
          color = 'FFF6BA';
        }
      }
    }

    return {
      'color': color
    };
  };


  self.getMosColor = function(rowmos) {
    var mos = parseInt(rowmos / 100);
    if (mos <= 2) {
      return {
        'color': 'red'
      };
    } else if (mos <= 3) {
      return {
        'color': 'orange'
      };
    } else {
      return {
        'color': 'green'
      };
    }
  };


  self.getCallIDColor = function(str) {
    if (str === undefined || str === null) return str;

    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    i = hash;
    var col = ((i >> 24) & 0xAF).toString(16) + ((i >> 16) & 0xAF).toString(16) +
    ((i >> 8) & 0xAF).toString(16) + (i & 0xAF).toString(16);
    if (col.length < 6) col = col.substring(0, 3) + '' + col.substring(0, 3);
    if (col.length > 6) col = col.substring(0, 6);
    return {
      'color': '#' + col
    };
  };


  self.getCallDuration = function(start, stop) {
    if (stop < start || !stop) return '';
    var diff = new Date((stop - start)).getTime();
    var hours = Math.floor(diff / 3600) % 24;
    var minutes = Math.floor(diff / 60) % 60;
    var seconds = diff % 60;
    return ('0' + hours).slice(-2) + ':' +
        ('0' + minutes).slice(-2) + ':' +
        ('0' + seconds).slice(-2);
  };

  self.showTransaction = function(localrow, event) {
    var rows = self.gridApi.selection.getSelectedRows();
    var callids = [];
    var uuids = [];
    var nodes = [];

    callids.push(localrow.entity.callid);
    if (localrow.entity.uuid && localrow.entity.uuid.length > 1) uuids.push(localrow.entity.uuid);

    if (callids.indexOf(localrow.entity.hep_correlation_id) == -1 && localrow.entity.hep_correlation_id.length > 1) {
      callids.push(localrow.entity.hep_correlation_id);
    }

    forEach(rows, function(row) {
      if (callids.indexOf(row.callid) == -1) {
        callids.push(row.callid);
      }
      if (callids.indexOf(row.hep_correlation_id) == -1 && row.hep_correlation_id.length > 1) {
        callids.push(row.hep_correlation_id);
      }
      if (nodes.indexOf(row.dbnode) == -1) nodes.push(row.dbnode);

      if (row.uuid && row.uuid.length > 1 && uuids.indexOf(row.uuid) == -1) {
        uuids.push(row.uuid);
      }
    });

    var stop;
    if (localrow.entity.cdr_stop > (localrow.entity.micro_ts / 1000000)) {
      stop = (localrow.entity.cdr_stop * 1000);
    } else {
      stop = parseInt(localrow.entity.micro_ts / 1000);
    }
      
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
    var timezone = UserProfile.getProfile('timezone');
    localrow.entity.trans = 'call';
    search_data['param']['transaction'][localrow.entity.trans] = true;
    var trwindowId = '' + localrow.entity.callid + '_' + localrow.entity.dbnode;

    nodes = UserProfile.getProfile('node');

    var search_profile = UserProfile.getProfile('search');
    if (search_profile.hasOwnProperty('uniq')) {
      search_data['param']['search']['uniq'] = search_profile.uniq;
    }

    search_data['param']['timezone'] = timezone;

    let divTop;
    if ((event.clientY + window.innerHeight / 2) < window.innerHeight) {
      divTop = event.clientY.toString() + 'px';
    } else {
      divTop = (event.clientY - ((event.clientY + window.innerHeight / 1.8) - window.innerHeight)).toString() + 'px';
    }

    $homerModal.open({
      url: 'templates/dialogs/transaction/call.html',
      //template: homer_call_template,
      cls: 'homer-modal-content',
      id: 'trans' + self.hashCode(trwindowId),
      params: search_data,
      divLeft: event.clientX.toString() / 2 + 'px',
      divTop,
      onOpen: function() {
        $log.debug('modal1 transaction opened from url', this.id);
      },
      controller: 'transactionCallCtrl'
    });
  }; // END showTransaction

  self.showInfo = function(row) {
    $log.debug(row);
  };

  self.fileOneUploaded = true;
  self.fileTwoUploaded = false;

       
  var myColumnDefs = [
    {
      field: 'id',
      displayName: $filter('translate')('hepic.pages.results.ID') ? $filter('translate')('hepic.pages.results.ID') : 'Id',
      type: 'number',
      cellTemplate: '<div  ng-click="grid.appScope.$ctrl.showTransaction(row, $event)" class="ui-grid-cell-contents"><span>{{COL_FIELD}}</span></div>',
      width: '*'
    },
    {
      field: 'micro_ts',
      displayName: $filter('translate')('hepic.pages.results.DATE') ? $filter('translate')('hepic.pages.results.DATE') : 'Date',
      cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.$ctrl.dateConvert(row.entity.micro_ts)}}</div>',
      resizable: true,
      type: 'date',
      width: '*',
      minWidth: 180
    },
    {
      field: 'callid',
      displayName: $filter('translate')('hepic.pages.results.CALLID') ? $filter('translate')('hepic.pages.results.CALLID') : 'CallID',
      resizable: true,
      width: '*',
      minWidth: 180,
      type: 'string',
      cellTemplate: '<div class="ui-grid-cell-contents" ng-click="grid.appScope.$ctrl.showTransaction(row, $event)"><span ng-style="grid.appScope.$ctrl.getCallIDColor(row.entity.callid)" title="{{COL_FIELD}}">{{COL_FIELD}}</span></div>'
    },
    {
      field: 'from_user',
      displayName: $filter('translate')('hepic.pages.results.FROMUSER') ? $filter('translate')('hepic.pages.results.FROMUSER') : 'From User',
      resizable: true,
      type: 'string',
      width: '*'
    },
    {
      field: 'ruri_user',
      displayName: $filter('translate')('hepic.pages.results.RURIUSER') ? $filter('translate')('hepic.pages.results.RURIUSER') : 'RURI user',
      type: 'string',
      resizable: true,
      width: '*'
    },
    {
      field: 'to_user',
      displayName: $filter('translate')('hepic.pages.results.TOUSER') ? $filter('translate')('hepic.pages.results.TOUSER') : 'To User',
      resizable: true,
      type: 'string',
      width: '*'
    },
    {
      field: 'geo_cc',
      displayName: $filter('translate')('hepic.pages.results.GEODST') ? $filter('translate')('hepic.pages.results.GEODST') : 'Geo',
      resizable: true,
      type: 'string',
      width: '*',
      maxWidth: 50,
      cellTemplate: '<div ng-show="COL_FIELD" class="ui-grid-cell-contents" title="{{COL_FIELD}}" alt="{{COL_FIELD}}"><span style="font-size:7px;"><img ng-src="{{grid.appScope.$ctrl.getCountryFlag(row.entity.geo_cc)}}" lazy-src border="0"></span></div>'
    },
    {
      field: 'uas',
      type: 'string',
      displayName: $filter('translate')('hepic.pages.results.USERAGENT') ? $filter('translate')('hepic.pages.results.USERAGENT') : 'User Agent',
      width: '*',
    },
    {
      field: 'status',
      displayName: $filter('translate')('hepic.pages.results.STATUS') ? $filter('translate')('hepic.pages.results.STATUS') : 'Status',
      minWidth: 100,
      resizable: true,
      type: 'string',
      width: '*',
      cellTemplate: '<div class="ui-grid-cell-contents"><span ng-style="grid.appScope.$ctrl.getCallStatusColor(row.entity.status, row.isSelected, row.entity.transaction)" title="status">{{grid.appScope.$ctrl.getCallStatus(row.entity.status,row.entity.transaction)}}</span></div>'
    },
    {
      name: 'source',
      field: 'source_ip',
      minWidth: 120,
      resizable: true,
      type: 'string',
      width: '*',
      displayName: $filter('translate')('hepic.pages.results.SRCIP') ? $filter('translate')('hepic.pages.results.SRCIP') : 'Source Host',
      cellTemplate: '<div class="ui-grid-cell-contents" title="{{ grid.appScope.$ctrl.getColumnTooltip(row, col) }}">{{COL_FIELD}}</div>'
    },
    {
      field: 'source_port',
      displayName: $filter('translate')('hepic.pages.results.SRCPORT') ? $filter('translate')('hepic.pages.results.SRCPORT') : 'SPort',
      minwidth: 80,
      type: 'number',
      width: '*',
      resizable: true
    },
    {
      field: 'destination_ip',
      displayName: $filter('translate')('hepic.pages.results.DSTIP') ? $filter('translate')('hepic.pages.results.DSTIP') : 'Destination Host',
      minWidth: 120,
      width: '*',
      type: 'string',
      cellTemplate: '<div class="ui-grid-cell-contents" title="{{ grid.appScope.$ctrl.getColumnTooltip(row, col) }}">{{ COL_FIELD }}</div>'
    },
    {
      field: 'destination_port',
      minWidth: 50,
      type: 'number',
      width: '*',
      displayName: $filter('translate')('hepic.pages.results.DSTPORT') ? $filter('translate')('hepic.pages.results.DSTPORT') : 'DPort'
    },
    {
      field: 'cdr_duration',
      displayName: $filter('translate')('hepic.pages.results.DURATION') ? $filter('translate')('hepic.pages.results.DURATION') : 'Duration',
      type: 'date',
      minWidth: 80,
      width: '*',
      cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.$ctrl.getCallDuration(row.entity.cdr_start, row.entity.cdr_stop)}}</div>'
    },
    {
      field: 'reserve',
      displayName: $filter('translate')('hepic.pages.results.RESERVED') ? $filter('translate')('hepic.pages.results.RESERVED') : 'MOS',
      type: 'string',
      minWidth: 40,
      width: '*',
      cellTemplate: '<div class="ui-grid-cell-contents"><span ng-style="grid.appScope.$ctrl.getMosColor(row.entity.reserve)">{{ row.entity.reserve ? (row.entity.reserve / 100) : "" }}</span></div>'
    },
    {
      field: 'cdr_start',
      visible: false,
      displayName: $filter('translate')('hepic.pages.results.CDRSTART') ? $filter('translate')('hepic.pages.results.CDRSTART') : 'Start',
      type: 'date',
      width: '*',
      cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.$ctrl.dateSecondsConvert(row.entity.cdr_start)}}</div>'
    },
    {
      field: 'cdr_stop',
      visible: false,
      displayName: $filter('translate')('hepic.pages.results.CDRSTOP') ? $filter('translate')('hepic.pages.results.CDRSTOP') : 'Stop',
      type: 'date',
      width: '*',
      cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.$ctrl.dateSecondsConvert(row.entity.cdr_stop)}}</div>'
    },
    {
      field: 'proto',
      displayName: $filter('translate')('hepic.pages.results.PROTO') ? $filter('translate')('hepic.pages.results.PROTO') : 'Proto',
      type: 'number',
      resizable: true,
      width: '*',
      cellTemplate: '<div class="ui-grid-cell-contents" title="proto">{{grid.appScope.$ctrl.protoCheck(row, col)}}</div>'
    },
    {
      field: 'event',
      displayName: $filter('translate')('hepic.pages.results.EVENT') ? $filter('translate')('hepic.pages.results.EVENT') : 'Event',
      type: 'string',
      resizable: true,
      width: '*',
      cellTemplate: '<div class="ui-grid-cell-contents" title="proto">{{grid.appScope.$ctrl.eventCheck(row, col)}}</div>'
    },
    {
      field: 'node',
      displayName: $filter('translate')('hepic.pages.results.NODE') ? $filter('translate')('hepic.pages.results.NODE') : 'Node',
      visible: false,
      width: '*',
      type: 'string',
    },
    {
      field: 'hep_correlation_id',
      displayName: $filter('translate')('hepic.pages.results.CORRELATION_ID') ? $filter('translate')('hepic.pages.results.CORRELATION_ID') : 'Correlation ID',
      visible: false
    },
    {
      field: 'srd',
      displayName: $filter('translate')('hepic.pages.results.SRD') ? $filter('translate')('hepic.pages.results.SRD') : 'SRD',
      visible: false
    },
    {
      field: 'sss',
      displayName: $filter('translate')('hepic.pages.results.SSS') ? $filter('translate')('hepic.pages.results.SSS') : 'SSS',
      visible: false
    },
    {
      field: 'geo_lat',
      displayName: $filter('translate')('hepic.pages.results.GEOLAT') ? $filter('translate')('hepic.pages.results.GEOLAT') : 'GEO Lat',
      visible: false
    },
    {
      field: 'geo_lan',
      displayName: $filter('translate')('hepic.pages.results.GEOLAN') ? $filter('translate')('hepic.pages.results.GEOLAN') : 'GEO Lan',
      visible: false
    },
    {
      field: 'sdp_ap',
      displayName: $filter('translate')('hepic.pages.results.SDPAUDIO') ? $filter('translate')('hepic.pages.results.SDPAUDIO') : 'SDP Audio',
      visible: false
    },
    {
      field: 'codec_in_audio',
      displayName: $filter('translate')('hepic.pages.results.SDPCODEC') ? $filter('translate')('hepic.pages.results.SDPCODEC') : 'Codec Audio',
      visible: false
    },
    {
      field: 'sdmedia_ip',
      displayName: $filter('translate')('hepic.pages.results.SDPMEDIA') ? $filter('translate')('hepic.pages.results.SDPMEDIA') : 'SDP Media IP',
      visible: false
    },
    {
      field: 'xgroup',
      displayName: $filter('translate')('hepic.pages.results.XGROUP') ? $filter('translate')('hepic.pages.results.XGROUP') : 'X-Group',
      visible: false
    },
    {
      field: 'mos',
      displayName: $filter('translate')('hepic.pages.results.MOS') ? $filter('translate')('hepic.pages.results.MOS') : 'MOS 2',
      visible: false
    }
  ];

  if (CONFIGURATION.USER_EXT_CR) {
    myColumnDefs = myColumnDefs.concat([
      {
        field: 'tradeid',
        displayName: $filter('translate')('hepic.pages.extended.TRADE_ID') || 'H.TradeID',
        visible: false
      },
      {
        field: 'origtrunkid',
        displayName: $filter('translate')('hepic.pages.extended.ORIG_ID') || 'H. Orig.TrID',
        visible: false
      },
      {
        field: 'termtrunkid',
        displayName: $filter('translate')('hepic.pages.extended.TERM_ID') || 'H. Term.TrID',
        visible: false
      },
      {
        field: 'hashrateid',
        displayName: $filter('translate')('hepic.pages.extended.RATE_ID') || 'H. RateID',
        visible: false
      },
      {
        field: 'hashrouteid',
        displayName: $filter('translate')('hepic.pages.extended.ROUTE_ID') || 'H. RouteID',
        visible: false
      },
      {
        field: 'mos',
        displayName: 'MOS 2',
        visible: false
      }
    ]);
  }
        
      
  self.gridOpts = data_grid_options;
  self.gridOpts.columnDefs = myColumnDefs;
  self.gridOpts.rowTemplate = '<div ng-style="row.isSelected && {} || grid.appScope.$ctrl.getBkgColorTable(row.entity.callid)">' +
        '<div ng-dblclick="grid.appScope.$ctrl.showTransaction(row, $event)"  ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div>' +
        '</div>';

  self.state = localStorageService.get('localStorageGrid');

  self.saveState = function() {
    self.state = self.gridApi.saveState.save();
    localStorageService.set('localStorageGrid', self.state);
  };

  self.restoreState = function() {
    self.state = localStorageService.get('localStorageGrid');
    if (self.state) self.gridApi.saveState.restore(self, self.state);
  };

  self.resetState = function() {
    self.state = {};
    self.gridApi.saveState.restore(self, self.state);
    localStorageService.set('localStorageGrid', self.state);
  };


  EventBus.subscribe(EVENTS.GRID_STATE_SAVE, function() {
    console.log('save');
    self.saveState();
  });

  EventBus.subscribe(EVENTS.GRID_STATE_RESTORE, function() {
    console.log('restore');
    self.restoreState();
  });

  EventBus.subscribe(EVENTS.GRID_STATE_RESET, function() {
    console.log('reset');
    self.resetState();
  });

  self.gridOpts.rowIdentity = function(row) {
    return row.id;
  };

  self.gridOpts.onRegisterApi = function(gridApi) {
    self.gridApi = gridApi;
    gridApi.selection.on.rowSelectionChanged($scope, function(row) {
      //$state.go('contact.details.view', {contactId: row.entity.contactId});
      $log.debug(row);
    });
  };

  self.searchData = function() {
    self.gridOpts.data = $filter('messageSearch')(self.Data, self.gridOpts, self.searchText);
  };
};

export default SearchCallController;
