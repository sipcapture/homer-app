/* global angular, window */

import {forEach} from 'lodash';

import gridOptions from '../data/grid/options';
import gridRowTemplate from '../data/grid/row_template.html';
import gridColumnDefinitions from '../data/grid/collumns/definitions';
import gridColumnDefinitionsUserExtCr from '../data/grid/collumns/definitions_user_ext_cr';

class SearchCall {
  constructor($scope, EventBus, $location, SearchService,
    $timeout, $window, $homerModal, UserProfile, localStorageService, $filter, SweetAlert,
    $state, EVENTS, $log, CONFIGURATION, SearchHelper, StyleHelper, TimeMachine) {
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
    this.SweetAlert = SweetAlert;
    this.$state = $state;
    this.EVENTS = EVENTS;
    this.$log = $log;
    this.CONFIGURATION = CONFIGURATION;
    this.SearchHelper = SearchHelper;
    this.StyleHelper = StyleHelper;
    this.TimeMachine = TimeMachine;
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
    this.updateTime();

    this.EventBus.subscribe(this.EVENTS.TIME_CHANGE, () => {
      this.updateTime();
      this.processSearchResult();
    });

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

    /* this.gridOpts.columnDefs = gridColumnDefinitions;*/
    this.gridOpts.columnDefs = [];
    this.gridOpts.rowIdentity = function(row) {
      return row.id;
    };
    this.gridOpts.onRegisterApi = (gridApi) => {
      this.gridApi = gridApi;
      this.gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
        this.$log.debug(row);
      });
    };
  }

  async processSearchResult() {
    const query = this.createQuery();

    try {
      this.dataLoading = true;

      const response = await this.SearchService.searchCallByParam(query);
      let data = response.data;
      let keys = response.keys;
      
      this.dataLoading = false;
      /* displayName: this.$filter('translate')('hepic.pages.results.'+v) ? this.$filter('translate')('hepic.pages.results.'+v) : v,*/

      if (keys) {
        this.gridOpts.columnDefs = [];
        if (this.gridOpts.columnDefs.length == 0) {
          let columns = [];
          keys.forEach(function(v) {
            let column = {
              field: v,
              displayName: v,
              resizable: true,
              type: 'string',
              width: '*',
              visible: true,
            };
            
            if (v == 'sid') {
              column['cellTemplate'] = '<div class="ui-grid-cell-contents" ng-click="grid.appScope.$ctrl.showTransaction(row, $event)">'
                +'<span ng-style="grid.appScope.$ctrl.getCallIDColor(row.entity.sid)" title="{{COL_FIELD}}">{{COL_FIELD}}</span></div>';
	      column['width'] = '10%';
            } else if (v == 'id') {
              column['cellTemplate'] = '<div  ng-click="grid.appScope.$ctrl.showMessage(row, $event)" '
                +'class="ui-grid-cell-contents"><span>{{COL_FIELD}}</span></div>';
            } else if (v == 'create_date') {
              column['cellTemplate'] = '<div class="ui-grid-cell-contents" title="date">'
                +'{{grid.appScope.$ctrl.dateConvert(row.entity.create_date)}}</div>';
              column['type'] = 'date';
	      column['width'] = '12%';
	      /* Prepend Column */
              columns.unshift(column);
		return;
            } else if (v == 'table') {
              columns['visible'] = false;
              return;
            }
            /* Append Column */ 
            columns.push(column);
          });
          this.gridOpts.columnDefs = columns;
        }
      }

      if (data) {
        this.restoreState();
        this.count = data.length;
        this.gridOpts.data = data;
        this.Data = data;
        this.$timeout(() => {
          angular.element(this.$window).resize();
        }, 200);
      }
    } catch (err) {
      this.$log.error(['SearchCall'], err);
    }
  }

  updateTime() {
    this.timezone = this.TimeMachine.getTimezone();
    this.timedate = this.TimeMachine.getTimerange();
  }

  killParam(param) {
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
  }

  editParam(param) {
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
  }

  swapParam(param) {
    if (!this.searchParamsBackup[param]) {
      this.searchParamsBackup[param] = this.searchParams[param];
      delete this.searchParams[param];
    } else {
      this.searchParams[param] = this.searchParamsBackup[param];
      delete this.searchParamsBackup[param];
    }
  }

  createQuery() {
    const query = {
      param: {},
      timestamp: {
        from: this.timedate.from.getTime(),
        to: this.timedate.to.getTime(),
      },
    };

    const transaction = this.UserProfile.getProfile('transaction');
    let limit = this.UserProfile.getProfile('limit');
    const value = this.UserProfile.getProfile('search');

    /* query manipulation functions & store */
    this.searchParams = value;

    /* preference processing */
    const queryBody = {};
    const searchQueryObject = this.$location.search();
    if (searchQueryObject.query) {
      let rison = searchQueryObject.query;
      rison = rison.substring(1, rison.length - 2);
      const ar = rison.split('\',');
      for (let i = 0; i < ar.length; i++) {
        const va = ar[i].split(':\'');
        queryBody[va[0]] = va[1];
      }
    }

    if (Object.keys(queryBody).length == 0) {
      /* make construct of query */
      query.param.transaction = {};
      query.param.limit = limit;
      query.param.search = value;
      query.param.location = {};
      query.param.timezone = this.timezone;
      forEach(transaction.transaction, function(v) {
        query.param.transaction[v.name] = true;
      });
    } else {
      query.param.transaction = {};

      const searchValue = {};
      if (queryBody.limit) {
        limit = queryBody.limit;
      }
      if (queryBody.startts) {
        query.timestamp.from = queryBody.startts * 1000;
      }
      if (queryBody.endts) {
        query.timestamp.to = queryBody['endts'] * 1000;
      }

      if (queryBody.startdate) {
        let v = new Date(queryBody.startdate);
        query.timestamp.from = v.getTime();
      }
      if (queryBody.enddate) {
        let v = new Date(queryBody.enddate);
        query.timestamp.to = v.getTime();
        console.log(query);
      }

      if (queryBody.trancall) query.param.transaction.call = true;
      if (queryBody.tranreg) query.param.transaction.registration = true;
      if (queryBody.tranrest) query.param.transaction.rest = true;

      if (queryBody.search_callid) searchValue.callid = queryBody.search_callid;
      if (queryBody.search_ruri_user) searchValue.ruri_user = queryBody.search_ruri_user;
      if (queryBody.search_from_user) searchValue.from_user = queryBody.search_from_user;
      if (queryBody.search_to_user) searchValue.to_user = queryBody.search_to_user;

      query.param.limit = limit;
      query.param.search = searchValue;
      query.param.location = {};
    }
    return query;
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
  
    let proto = localrow.entity.table.replace('hep_proto_','');
    
    const searchData = {
      timestamp: {
        from: parseInt(localrow.entity.create_date) - 300*1000,
        to: parseInt(localrow.entity.create_date) + 300*100,
      },
      param: {
        search: {
     
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
    
    searchData.param.search[proto] = {
        id: parseInt(localrow.entity.id),
        sid: localrow.entity.sid,
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
    const dt = new Date(parseInt(value));
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

  getCallIDColor(str, flag) {
    let hash = 0;
    let i = 0;
    for (i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    i = hash;
    let col = ((i >> 24) & 0xAF).toString(16) + ((i >> 16) & 0xAF).toString(16) +
                        ((i >> 8) & 0xAF).toString(16) + (i & 0xAF).toString(16);
    if (col.length < 6) col = col.substring(0, 3) + '' + col.substring(0, 3);
    if (col.length > 6) col = col.substring(0, 6);
    if (flag) return col;
    else return {'color': '#' + col};
  }

  showTransaction(localrow, event) {
    const rows = this.gridApi.selection.getSelectedRows();
    const sids = [];
    const uuids = [];
    let nodes = [];
    
    let protoTable = localrow.entity.table.replace('hep_proto_','');
        
    
    console.log(localrow);

    sids.push(localrow.entity.sid);
    if (localrow.entity.uuid && localrow.entity.uuid.length > 1) uuids.push(localrow.entity.uuid);

    if (localrow.entity.correlation_id && sids.indexOf(localrow.entity.correlation_id) == -1 && localrow.entity.correlation_id.length > 1) {
      sids.push(localrow.entity.correlation_id);
    }

    forEach(rows, function(row) {
      if (sids.indexOf(row.sid) == -1) {
        sids.push(row.sid);
      }
      if (row.correlation_id && sids.indexOf(row.correlation_id) == -1 && row.correlation_id.length > 1) {
        sids.push(row.correlation_id);
      }
      if (nodes.indexOf(row.dbnode) == -1) nodes.push(row.dbnode);

      if (row.uuid && row.uuid.length > 1 && uuids.indexOf(row.uuid) == -1) {
        uuids.push(row.uuid);
      }
    });

    let stop;
    if (localrow.entity.cdr_stop && (localrow.entity.cdr_stop > (localrow.entity.create_date / 1000))) {
      stop = (localrow.entity.cdr_stop * 1000);
    } else {
      stop = parseInt(localrow.entity.create_date);
    }
      
    const searchData = {
      timestamp: {
        from: parseInt(localrow.entity.create_date - (300 * 1000)),
        to: parseInt(stop + (300 * 1000)),
      },
      param: {
        search: {
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
    
    searchData.param.search[protoTable] = {
        id: parseInt(localrow.entity.id),
	callid: sids,
	uuid: uuids,
    };

    /* set to to our last search time */
    // const timezone = this.UserProfile.getProfile('timezone');
    localrow.entity.trans = 'call';
    searchData['param']['transaction'][localrow.entity.trans] = true;
    const trwindowId = '' + localrow.entity.sid + '_' + localrow.entity.dbnode;

    nodes = this.UserProfile.getProfile('node');

    let searchProfile = this.UserProfile.getProfile('search');
    if (searchProfile.hasOwnProperty('uniq')) {
      searchData['param']['search']['uniq'] = searchProfile.uniq;
    }

    searchData['param']['timezone'] = this.timezone;

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
