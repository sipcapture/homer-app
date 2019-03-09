/* global angular, window */

import {get, forEach, isArray, isEmpty} from 'lodash';
import Promise from 'bluebird';
import swal from 'sweetalert2';

import gridOptions from '../data/grid/options';
import gridRowTemplate from '../data/grid/row_template.html';

class SearchCall {
  constructor($scope, EventBus, $location, SearchService,
    $timeout, $window, $homerModal, UserProfile, $filter,
    $state, EVENTS, log, CONFIGURATION, SearchHelper, StyleHelper,
    TimeMachine, uiGridConstants, ROUTER, homerHelper) {
    'ngInject';
    this.$scope = $scope;
    this.EventBus = EventBus;
    this.$location = $location;
    this.SearchService = SearchService;
    this.$timeout = $timeout;
    this.$window = $window;
    this.$homerModal = $homerModal;
    this.UserProfile = UserProfile;
    this.$filter = $filter;
    this.$state = $state;
    this.EVENTS = EVENTS;
    this.CONFIGURATION = CONFIGURATION;
    this.SearchHelper = SearchHelper;
    this.StyleHelper = StyleHelper;
    this.TimeMachine = TimeMachine;
    this.expandme = true;
    this.showtable = true;
    this.gridOpts = gridOptions;
    this.gridOpts.gridRowTemplate = gridRowTemplate;
    this.searchParamsBackup = {};
    this.fileOneUploaded = true;
    this.fileTwoUploaded = false;
    this.log = log;
    this.log.initLocation('SearchCall');
    this.searchText = null; // search results, regex results filter
    this.uiGridConstants = uiGridConstants;
    this.localStorage = window.localStorage;
    this.uiGridState = this.getUiGridState();
    this.ROUTER = ROUTER;
    this.homerHelper = homerHelper;
    this.selectedRows = [];

    this.timeChangeEventListener = null;
    this.gridStateResetEventListener = null;
  }

  $onInit() {
    this.initData();

    this.gridOpts.columnDefs = [];
    this.gridOpts.rowIdentity = function(row) {
      return row.id;
    };

    this.gridOpts.onRegisterApi = (gridApi) => {
      this.gridApi = gridApi;
      this.gridApi.colMovable.on.columnPositionChanged(this.$scope, () => this.saveUiGridState(this.gridApi));
      this.gridApi.colResizable.on.columnSizeChanged(this.$scope, () => this.saveUiGridState(this.gridApi));
      this.gridApi.grouping.on.aggregationChanged(this.$scope, () => this.saveUiGridState(this.gridApi));
      this.gridApi.grouping.on.groupingChanged(this.$scope, () => this.saveUiGridState(this.gridApi));
      this.gridApi.core.on.columnVisibilityChanged(this.$scope, () => this.saveUiGridState(this.gridApi));
      this.gridApi.core.on.filterChanged(this.$scope, () => this.saveUiGridState(this.gridApi));
      this.gridApi.core.on.sortChanged(this.$scope, () => this.saveUiGridState(this.gridApi));
      this.gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => this.rowSelectionChanged(row));
    };

    this.gridStateResetEventListener = this.EventBus.subscribe(this.EVENTS.GRID_STATE_RESET, () => {
      this.resetUiGridState();
    });

    this.timeChangeEventListener = this.EventBus.subscribe(this.EVENTS.TIME_CHANGE, () => {
      if (this.homerHelper.isCurrentUiRouterState(this.$state, this.ROUTER.SEARCH.NAME)) {
        this._updateUiRouterState();
        this.processSearchResult();
      }
    });
  }

  $onDestroy() {
    this.saveUiGridState();
    this.destroyEventListeners();
  }

  destroyEventListeners() {
    this.gridStateResetEventListener();
    this.timeChangeEventListener();
  }

  async initData() {
    try {
      this.EventBus.broadcast(this.EVENTS.TIME_CHANGE_BY_URL);
      await this.UserProfile.getAll();
      await this.UserProfile.getAllServerRemoteProfile();
      await this.processSearchResult();
    } catch (err) {
      this.log.error(err);
    }
  }

  _updateUiRouterState(notify = false) {
    const timerange = this.TimeMachine.getTimerange();

    this.$state.params.to = timerange.to.getTime();
    this.$state.params.from = timerange.from.getTime();
    this.$state.params.custom = timerange.custom;
    this.$state.params.timezone = this.TimeMachine.getTimezone();

    this.$state.target(this.ROUTER.SEARCH.NAME, this.$state.params, {notify});
  }

  getUiGridColumnDefs(colNames = []) {
    if (!colNames || isEmpty(colNames)) {
      throw new Error('array of col names should be present as argument');
    }

    function getDefaultDefs(colNames) {
      return colNames.map((name) => {
        return {
          field: name,
          displayName: name,
          resizable: true,
          type: 'string',
          width: '*',
          visible: true,
        };
      });
    }

    function getEnrichedDefs(columnDefs) {
      const enrichedColumns = [];
      columnDefs.forEach((col) => {
        if (col.name === 'sid' || col.field === 'sid') {
          col.cellTemplate = '<div class="ui-grid-cell-contents" ng-click="grid.appScope.$ctrl.showTransaction(row, $event)">'
            +'<span ng-style="grid.appScope.$ctrl.getCallIDColor(row.entity.sid)" title="{{COL_FIELD}}">{{COL_FIELD}}</span></div>';
          col.width = '10%';
        } else if (col.name === 'id' || col.field === 'id') {
          col.cellTemplate = '<div  ng-click="grid.appScope.$ctrl.showMessage(row, $event)" '
            +'class="ui-grid-cell-contents"><span>{{COL_FIELD}}</span></div>';
        } else if (col.name === 'create_date' || col.field === 'create_date') {
          col.cellTemplate = '<div class="ui-grid-cell-contents" title="date">'
            +'{{grid.appScope.$ctrl.dateConvert(row.entity.create_date)}}</div>';
          col.type = 'date';
          col.width = '12%';
        } else if (col.name === 'table' || col.field === 'table') {
          col.visible = false;
        }

        if (col.name === 'create_date' || col.field === 'create_date') {
          enrichedColumns.unshift(col);
        } else {
          enrichedColumns.push(col);
        }
      });
      return enrichedColumns;
    }

    return getEnrichedDefs(getDefaultDefs(colNames));
  }

  async processSearchResult() {
    if (isArray(this.data) && !isEmpty(this.data)) {
      this.saveUiGridState();
    }

    const query = this.createQuery();

    try {
      const response = await this.SearchService.searchCallByParam(query);

      this.gridOpts.data = [];
      this.selectedRows = [];

      const {data, keys} = response;

      if (isArray(keys) && !isEmpty(keys)) {
        this.gridOpts.columnDefs = this.getUiGridColumnDefs(keys);
        this.gridApi.core.notifyDataChange(this.uiGridConstants.dataChange.ALL);
      }

      await this.restoreUiGridState();

      this.gridOpts.data = data;
      this.data = data;

      this.$timeout(() => {
        angular.element(this.$window).resize();
      }, 200);
    } catch (err) {
      this.log.error(err);
    }
  }

  killParam(param) {
    swal({
      title: 'Remove Filter?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      timer: 240000,
    }).then((resp) => {
      if (!resp.dismiss) {
        delete this.searchParams[param];
        this.processSearchResult();
      }
    });
  }

  editParam(param) {
    swal({
      title: `Edit Filter: [${param}]`,
      type: 'info',
      showCancelButton: true,
      confirmButtonText: 'Update',
      input: 'textarea',
      inputValue: JSON.stringify(this.searchParams[param]),
      inputPlaceholder: 'Type search parameters here',
      timer: 240000,
    }).then((resp) => {
      if (!resp.dismiss) {
        this.searchParams[param] = JSON.parse(resp.value);
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
    let {search, limit, transaction, from, to, timezone} = this.$state.params;
    this.timezone = timezone;

    const query = {
      param: {},
      timestamp: {from, to},
    };

    this.log.debug('time from:', query.timestamp.from, new Date(query.timestamp.from));
    this.log.debug('time to:', query.timestamp.to, new Date(query.timestamp.to));

    /* query manipulation functions & store */
    this.searchParams = search;

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
      query.param.search = search;
      query.param.location = {};
      query.param.timezone = this.timezone;
      forEach(get(transaction, 'transaction'), function(v) {
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
        this.log.debug('query', query);
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
    let proto = localrow.entity.table.replace('hep_proto_', '');

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
        this.log.debug('modal1 message opened from url ' + this.id);
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
    const sids = [];
    const uuids = [];
    let nodes = [];

    let protoTable = localrow.entity.table.replace('hep_proto_', '');

    sids.push(localrow.entity.sid);
    if (localrow.entity.uuid && localrow.entity.uuid.length > 1) uuids.push(localrow.entity.uuid);

    if (localrow.entity.correlation_id && sids.indexOf(localrow.entity.correlation_id) == -1 && localrow.entity.correlation_id.length > 1) {
      sids.push(localrow.entity.correlation_id);
    }

    forEach(this.selectedRows, function(row) {
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
      bindings: {
        searchText: this.searchText,
        matchJSON: this.matchJSON,
      },
      onOpen: () => {
        this.log.debug('modal1 transaction opened from url', this.id);
      },
    });
  }

  // Horrible design. Create a proper filter instead
  matchJSON(project) {
    // Match all if no terms are entered
    if (!this.searchText) return project;

    function splitTerms(text) {
      if (text == null) return [];
      return text.toLowerCase().split(/\s+/).filter((term) => term.length > 0);
    }

    function walkTerms(obj, ignored, terms) {
      console.log('Walking', obj, ignored, terms);
      if (ignored == null) {
        ignored = [];
      }
      if (terms == null) {
        terms = [];
      }
      for (let key in obj) {
        // Ignore specified keys
        if (ignored.indexOf(key) !== -1) continue;
        // Ignore properties added by Angular
        if (key.startsWith('$$')) continue;
        // Ignore `null`, `undefined` or Array values
        if (obj[key] == null || obj[key].constructor === Array) continue;
        if (obj[key].constructor === Object) {
          walkTerms(obj[key], terms);
          continue;
        }
        if (typeof(obj[key]) === 'string') {
          Array.prototype.push.apply(terms, splitTerms(obj[key]));
          continue;
        }
        // Must be a boolean or number
        terms.push(obj[key].toString());
      }
      return terms;
    }

    // Match if all terms are matched
    console.log('Filtering', project);
    let searchTerms = splitTerms(this.searchText);
    let projectTerms = walkTerms(project.data);
    let unmatchedTerms = searchTerms.filter(function(searchTerm) {
      return projectTerms.filter(function(projectTerm) {
        return projectTerm.indexOf(searchTerm) !== -1;
      }).length === 0;
    });
    return unmatchedTerms.length === 0;
  }

  showInfo(row) {
    this.log.debug(row);
  }

  getUiGridState() {
    return this.localStorage.getItem('hepic.localStorageGrid');
  }

  rowSelectionChanged(row) {
    if (row.isSelected) this.selectedRows.push(row.entity);
    else this.selectedRows.splice(this.selectedRows.findIndex((item) => item.id === row.entity.id), 1);
  }

  saveUiGridState(state) {
    this.uiGridState = state ? state.saveState.save() : this.gridApi.saveState.save();
    this.localStorage.setItem('hepic.localStorageGrid', JSON.stringify(this.uiGridState));
  }

  restoreUiGridState(state) {
    this.uiGridState = state || this.getUiGridState();
    if (this.uiGridState) {
      return this.gridApi.saveState.restore(this.$scope, JSON.parse(this.uiGridState));
    }
    return Promise.resolve();
  }

  resetUiGridState() {
    this.uiGridState = {};
    this.gridApi.saveState.restore(this.$scope, this.uiGridState);
    this.localStorage.setItem('hepic.localStorageGrid', JSON.stringify(this.uiGridState));
  }

  searchData() {
    this.gridOpts.data = this.$filter('messageSearch')(this.data, this.gridOpts, this.searchText);
  }
}

export default SearchCall;
