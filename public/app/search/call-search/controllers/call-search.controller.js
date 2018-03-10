/* global angular, window */

import {forEach} from 'lodash';

import gridOptions from '../data/grid/options';
import gridRowTemplate from '../data/grid/row_template.html';
import gridColumnDefinitions from '../data/grid/collumns/definitions';
import gridColumnDefinitionsUserExtCr from '../data/grid/collumns/definitions_user_ext_cr';

class SearchCall {
  constructor($scope, EventBus, $location, SearchService,
    $timeout, $window, $homerModal, UserProfile, localStorageService, $filter, SweetAlert,
    $state, EVENTS, $log, CONFIGURATION, SearchHelper, StyleHelper) {
    'ngInject';
    this.$scope = $scope;
    this.EventBus = EventBus;
    this.$location = $location;
    this.SearchService = SearchService;
    this.$timeout = $timeout;
    this.$window = $window;
    this.$homerModal = $homerModal;
    this.UserProfile = UserProfile;
    this.localStorageService = localStorageService;
    this.$filter = $filter;
    this.SweetAlet = SweetAlert;
    this.$state = $state;
    this.EVENTS = EVENTS;
    this.$log = $log;
    this.CONFIGURATION = CONFIGURATION;
    this.SearchHelper = SearchHelper;
    this.StyleHelper = StyleHelper;
    this.expandme = true;
    this.showtable = true;
    this.dataLoading = false;
    this.gridOpts = gridOptions;
    this.gridOpts.gridRowTemplate = gridRowTemplate;
    this.autorefresh = false;
    this.searchParamsBackup = {};
    this.UserProfile.getAllServerRemoteProfile();
    this.fileOneUploaded = true;
    this.fileTwoUploaded = false;
    this.state = localStorageService.get('localStorageGrid');
  }

  $onInit() {
    this.UserProfile.getAll().then(() => {
      this.processSearchResult();
    }).catch((error) => {
      this.$log.error(['SearchCall'], error);
    });

    gridColumnDefinitions.forEach((column) => {
      column.displayName = this.$filter('translate')(column._hepic_translate);
    });

    if (this.CONFIGURATION.USER_EXT_CR) {
      gridColumnDefinitions.push.apply(gridColumnDefinitionsUserExtCr);
    }

    this.gridOpts.columnDefs = gridColumnDefinitions;
    this.gridOpts.rowIdentity = function(row) {
      return row.id;
    };
    this.gridOpts.onRegisterApi = (gridApi) => {
      this.gridApi = gridApi;
      this.gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
        this.$log.debug(row);
      });
    };

    const myListener = this.EventBus.subscribe(this.EVENTS.SEARCH_CALL_SUBMIT, () => {
      this.processSearchResult();
    });

    this.$scope.$on('$destroy', () => {
      this.EventBus.broadcast(this.EVENTS.DESTROY_REFESH, '1');
      myListener();
    });

    this.EventBus.subscribe(this.EVENTS.GRID_STATE_SAVE, () => {
      this.saveState();
    });

    this.EventBus.subscribe(this.EVENTS.GRID_STATE_RESTORE, () => {
      this.restoreState();
    });

    this.EventBus.subscribe(this.EVENTS.GRID_STATE_RESET, () => {
      this.resetState();
    });
  }

  processSearchResult() {
    this.bump = false;
    /* save data for next search */
    const data = {
      param: {},
      timestamp: {},
    };

    const transaction = this.UserProfile.getProfile('transaction');
    let limit = this.UserProfile.getProfile('limit');
    const timezone = this.UserProfile.getProfile('timezone');
    const value = this.UserProfile.getProfile('search');
    let timedate;

    /* force time update for "last x minutes" ranges */
    const timeNow = this.UserProfile.getProfile('timerange_last');
    if (timeNow > 0) {
      console.log('fast-forward to last ' + timeNow + ' minutes...');
      this.diff = (new Date().getTimezoneOffset() - timezone.value);
      const dt = new Date(new Date().setMinutes(new Date().getMinutes() - timeNow + this.diff));
      timedate = {
        from: dt,
        to: new Date(new Date().setMinutes(new Date().getMinutes() + this.diff)),
        custom: 'Now() - ' + timeNow,
      };
      this.UserProfile.setProfile('timerange', timedate);
    } else {
      timedate = this.UserProfile.getProfile('timerange');
    }

    /* query manipulation functions & store */
    this.searchParams = value;
    this.killParam = (param) => {
      this.SweetAlert.swal({
        title: 'Remove Filter?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, delete it!',
        closeOnConfirm: true,
        closeOnCancel: true,
      },
      (isConfirm) => {
        if (isConfirm) {
          delete this.searchParams[param];
          this.processSearchResult();
        }
      });
    };

    this.editParam = (param) => {
      this.SweetAlert.swal({
        title: `Edit Filter: [${param}]`,
        type: 'input',
        showCancelButton: true,
        confirmButtonText: 'Update',
        closeOnConfirm: true,
        closeOnCancel: true,
        inputPlaceholder: this.searchParams[param],
      },
      (input) => {
        if (input) {
          this.searchParams[param] = input;
          this.processSearchResult();
        }
      });
    };

    this.swapParam = (param) => {
      if (!this.searchParamsBackup[param]) {
        this.searchParamsBackup[param] = this.searchParams[param];
        delete this.searchParams[param];
      } else {
        this.searchParams[param] = this.searchParamsBackup[param];
        delete this.searchParamsBackup[param];
      }
    };

    /* preference processing */
    const sObj = {};
    const searchQueryObject = this.$location.search();
    if (searchQueryObject.hasOwnProperty('query')) {
      let rison = searchQueryObject.query;
      rison = rison.substring(1, rison.length - 2);
      const ar = rison.split('\',');
      for (let i = 0; i < ar.length; i++) {
        const va = ar[i].split(':\'');
        sObj[va[0]] = va[1];
      }
    }

    this.diff = (new Date().getTimezoneOffset() - timezone.value);
    this.diff = this.diff * 60 * 1000;
    this.offset = timezone.offset;

    if (Object.keys(sObj).length == 0) {
      /* make construct of query */
      data.param.transaction = {};
      data.param.limit = limit;
      data.param.search = value;
      data.param.location = {};
      data.param.timezone = timezone;
      data.timestamp.from = timedate.from.getTime() - this.diff;
      data.timestamp.to = timedate.to.getTime() - this.diff;
      forEach(transaction.transaction, function(v) {
        data.param.transaction[v.name] = true;
      });
    } else {
      data.timestamp.from = timedate.from.getTime() + this.diff;
      data.timestamp.to = timedate.to.getTime() + this.diff;
      data.param.transaction = {};

      const searchValue = {};
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
      timedate.from = new Date(data.timestamp.from - this.diff);
      timedate.to = new Date(data.timestamp.to - this.diff);
      this.UserProfile.setProfile('timerange', timedate);
      this.EventBus.broadcast(this.EVENTS.SET_TIME_RANGE, timedate);
    }

    this.dataLoading = true;

    this.SearchService.searchCallByParam(data).then((sdata) => {
      if (sdata) {
        this.restoreState();
        this.count = sdata.length;
        this.gridOpts.data = sdata;
        this.Data = sdata;
        this.$timeout(() => {
          angular.element(this.$window).resize();
        }, 200);
      }
    }).catch((error) => {
      this.$log.error(['SearchCall'], error);
    }).finally(() => {
      this.dataLoading = false;
    });
  }

  intToARGB(i) {
    return ((i >> 24) & 0xFF);
  }

  getBkgColorTable() {
    const color = 'hsla(0, 0%, 84%, 1)';
    return {
      'background-color': color,
    };
  }

  showMessage(localrow, event) {
    const searchData = {
      timestamp: {
        from: parseInt(localrow.entity.micro_ts / 1000) - 100,
        to: parseInt(localrow.entity.micro_ts / 1000) + 100,
      },
      param: {
        search: {
          id: parseInt(localrow.entity.id),
          callid: localrow.entity.callid,
        },
        location: {
        },
        transaction: {
          call: false,
          registration: false,
          rest: false,
        },
      },
    };

    /* here should be popup selection by transaction type. Here can trans['rtc'] == true */
    searchData['param']['transaction'][localrow.entity.trans] = true;
    const messagewindowId = '' + localrow.entity.id + '_' + localrow.entity.trans;

    this.$homerModal.open({
      template: '<call-message-detail></call-message-detail>',
      component: true,
      cls: 'homer-modal-message',
      id: 'message' + this.SearchHelper.hashCode(messagewindowId),
      divLeft: event.clientX.toString() + 'px',
      divTop: event.clientY.toString() + 'px',
      params: searchData,
      onOpen: () => {
        this.$log.debug('modal1 message opened from url ' + this.id);
      },
    });
  }

  getColumnValue(row, col) {
    return row.entity[col.field + '_alias'] == undefined ? row.entity[col.field + '_ip'] : row.entity[col.field + '_alias'];
  }

  getColumnTooltip(row, col) {
    return row.entity[col.field + '_ip'];
  }

  protoCheck(row) {
    if (parseInt(row.entity.proto) == 1) return 'udp';
    else if (parseInt(row.entity.proto) == 2) return 'tcp';
    else if (parseInt(row.entity.proto) == 3) return 'wss';
    else if (parseInt(row.entity.proto) == 4) return 'sctp';
    else return 'udp';
  }
    
  eventCheck(row) {
    if (parseInt(row.entity.event) == 1) return 'MOS';
    else if (parseInt(row.entity.event) == 2) return 'Rec';
    else if (parseInt(row.entity.event) == 3) return 'M+R';
    else return 'no';
  }

  dateConvert(value) {
    const dt = new Date(parseInt(value / 1000));
    return this.$filter('date')(dt, 'yyyy-MM-dd HH:mm:ss.sss Z', this.offset);
  }

  dateSecondsConvert(value) {
    const dt = new Date(parseInt(value * 1000));
    return this.$filter('date')(dt, 'yyyy-MM-dd HH:mm:ss.sss Z', this.offset);
  }

  getCountryFlag(value) {
    if (value == '') value = 'UN';
    return '/img/cc/' + value + '.gif';
  }

  getCallStatus(value, transaction) {
    const status = parseInt(value);
    let result = 'unknown';
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
  }

  getCallStatusColor(value, rowIsSelected, transaction) {
    return this.StyleHelper.getCallStatusColor(value, rowIsSelected, transaction);
  };

  getMosColor(rowmos) {
    return this.StyleHelper.getMosColor(rowmos);
  };

  getCallDuration(start, stop) {
    if (stop < start || !stop) return '';
    const diff = new Date((stop - start)).getTime();
    const hours = Math.floor(diff / 3600) % 24;
    const minutes = Math.floor(diff / 60) % 60;
    const seconds = diff % 60;
    return ('0' + hours).slice(-2) + ':' +
        ('0' + minutes).slice(-2) + ':' +
        ('0' + seconds).slice(-2);
  }

  showTransaction(localrow, event) {
    const rows = this.gridApi.selection.getSelectedRows();
    const callids = [];
    const uuids = [];
    let nodes = [];

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

    let stop;
    if (localrow.entity.cdr_stop > (localrow.entity.micro_ts / 1000000)) {
      stop = (localrow.entity.cdr_stop * 1000);
    } else {
      stop = parseInt(localrow.entity.micro_ts / 1000);
    }
      
    const searchData = {
      timestamp: {
        from: parseInt(localrow.entity.micro_ts / 1000 - (5 * 1000)),
        to: parseInt(stop + (300 * 1000)),
      },
      param: {
        search: {
          id: parseInt(localrow.entity.id),
          callid: callids,
          uuid: uuids,
          uniq: false,
        },
        location: {
        },
        transaction: {
          call: false,
          registration: false,
          rest: false,
        },
        id: {
          uuid: localrow.entity.uuid,
        },
      },
    };

    /* set to to our last search time */
    const timezone = this.UserProfile.getProfile('timezone');
    localrow.entity.trans = 'call';
    searchData['param']['transaction'][localrow.entity.trans] = true;
    const trwindowId = '' + localrow.entity.callid + '_' + localrow.entity.dbnode;

    nodes = this.UserProfile.getProfile('node');

    let searchProfile = this.UserProfile.getProfile('search');
    if (searchProfile.hasOwnProperty('uniq')) {
      searchData['param']['search']['uniq'] = searchProfile.uniq;
    }

    searchData['param']['timezone'] = timezone;

    let divTop;
    if ((event.clientY + window.innerHeight / 2) < window.innerHeight) {
      divTop = event.clientY.toString() + 'px';
    } else {
      divTop = (event.clientY - ((event.clientY + window.innerHeight / 1.8) - window.innerHeight)).toString() + 'px';
    }

    this.$homerModal.open({
      template: '<call-detail></call-detail>',
      component: true,
      cls: 'homer-modal-content',
      id: 'trans' + this.SearchHelper.hashCode(trwindowId),
      params: searchData,
      divLeft: event.clientX.toString() / 2 + 'px',
      divTop,
      onOpen: () => {
        this.$log.debug('modal1 transaction opened from url', this.id);
      },
    });
  }

  showInfo(row) {
    this.$log.debug(row);
  }

  saveState() {
    this.state = this.gridApi.saveState.save();
    this.localStorageService.set('localStorageGrid', this.state);
  }

  restoreState() {
    this.state = this.localStorageService.get('localStorageGrid');
    if (this.state) this.gridApi.saveState.restore(this, this.state);
  }

  resetState() {
    this.state = {};
    this.gridApi.saveState.restore(this, this.state);
    this.localStorageService.set('localStorageGrid', this.state);
  }

  searchData() {
    this.gridOpts.data = this.$filter('messageSearch')(this.Data, this.gridOpts, this.searchText);
  }
}

export default SearchCall;
