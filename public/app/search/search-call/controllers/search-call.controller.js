/* global angular, window */

import { forEach } from 'lodash';

import gridOptions from '../data/grid/options';
import gridRowTemplate from '../data/grid/row_template.html';
import gridColumnDefinitions from '../data/grid/collumns/definitions';
import gridColumnDefinitionsUserExtCr from '../data/grid/collumns/definitions_user_ext_cr';

const SearchCall = function($scope, $rootScope, EventBus, $http, $location, SearchService,
  $timeout, $window, $homerModal, UserProfile, localStorageService, $filter, SweetAlert, $state, EVENTS, $log, CONFIGURATION) {
  'ngInject';
  const self = this;

  self.$onInit = function () {
  };

  self.expandme = true;
  self.showtable = true;
  self.dataLoading = false;

  gridColumnDefinitions.forEach(function(column) {
    column.displayName = $filter('translate')(column._hepic_translate);
  });

  if (CONFIGURATION.USER_EXT_CR) {
    gridColumnDefinitions.push.apply(gridColumnDefinitionsUserExtCr);
  }
      
  self.gridOpts = gridOptions;
  self.gridOpts.columnDefs = gridColumnDefinitions;
  self.gridOpts.gridRowTemplate = gridRowTemplate;

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
      $log.error('[SearchCall]', error);
    }).finally(function() {
      self.dataLoading = false;
    });
  };

  UserProfile.getAllServerRemoteProfile();

  /* first get profile */
  UserProfile.getAll().then(function() {
    self.processSearchResult();
  }).catch(function(error) {
    $log.error('[SearchCall]', error);
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
      url: 'app/search/hepic-modal/templates/message.html',
      cls: 'homer-modal-message',
      id: 'message' + self.hashCode(messagewindowId),
      divLeft: event.clientX.toString() + 'px',
      divTop: event.clientY.toString() + 'px',
      params: search_data,
      onOpen: function() {
        $log.debug('modal1 message opened from url ' + this.id);
      },
      controller: 'TransactionMessage'
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
        result = 'hepic.pages.status.init';
        break;
      case 2:
        result = 'hepic.pages.status.unauth';
        break;
      case 3:
        result = 'hepic.pages.status.progress';
        break;
      case 4:
        result = 'hepic.pages.status.ringing';
        break;
      case 5:
        result = 'hepic.pages.status.connected';
        break;
      case 6:
        result = 'hepic.pages.status.moved';
        break;
      case 7:
        result = 'hepic.pages.status.busy';
        break;
      case 8:
        result = 'hepic.pages.status.userfail';
        break;
      case 9:
        result = 'hepic.pages.status.hardfail';
        break;
      case 10:
        result = 'hepic.pages.status.finished';
        break;
      case 11:
        result = 'hepic.pages.status.canceled';
        break;
      case 12:
        result = 'hepic.pages.status.timeout';
        break;
      case 13:
        result = 'hepic.pages.status.badterm';
        break;
      case 14:
        result = 'hepic.pages.status.declined';
        break;
      case 15:
        result = 'hepic.pages.status.unknownterm';
        break;
      default:
        result = 'hepic.pages.status.unknown';
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
      url: 'app/search/hepic-modal/templates/call.html',
      cls: 'homer-modal-content',
      id: 'trans' + self.hashCode(trwindowId),
      params: search_data,
      divLeft: event.clientX.toString() / 2 + 'px',
      divTop,
      onOpen: function() {
        $log.debug('modal1 transaction opened from url', this.id);
      },
      controller: 'TransactionDetail'
    });
  }; // END showTransaction

  self.showInfo = function(row) {
    $log.debug(row);
  };

  self.fileOneUploaded = true;
  self.fileTwoUploaded = false;

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

export default SearchCall;
