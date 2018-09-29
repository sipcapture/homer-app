/* global angular, window, Blob */
import Promise from 'bluebird';
import {cloneDeep, has} from 'lodash';
import fileSaver from 'file-saver';

import dataFields from '../data/fields';
import dataIndexes from '../data/indexes';
import dataTypeTransaction from '../data/type_transaction';
import dataTypeMonoStatus from '../data/type_mono_status';
import dataTypeResult from '../data/type_result';
import dataMethodList from '../data/method_list';
import dataTypeMethod from '../data/type_method';
import dataTypeCallStatus from '../data/type_call_status';
import dataDbNode from '../data/db_node';

class ProtosearchWidget {
  constructor($scope, $state, UserProfile, $log, SearchService, $uibModal,
  CONFIGURATION, ModalHelper, ROUTER, TimeMachine) {
    'ngInject';
    this.$scope = $scope;
    this.$state = $state;
    this.UserProfile = UserProfile;
    this.$log = $log;
    this.SearchService = SearchService;
    this.$uibModal = $uibModal;
    this.CONFIGURATION = CONFIGURATION;
    this.ModalHelper = ModalHelper;
    this.ROUTER = ROUTER;
    this.TimeMachine = TimeMachine;
  }

  $onInit() {
    this._widget = cloneDeep(this.widget);
    this._widget.config = this._widget.config || {};
    this._widget.config.title = this._widget.config.title || 'ProtoSearch';
    this._widget.fields = this._widget.fields || [];

    // To-do: check if all the vars below are needed
    this.indexes = dataIndexes.indexes;
            
    this.type_transaction = dataTypeTransaction;
    this.type_mono_status = dataTypeMonoStatus;
    this.type_result = dataTypeResult;
    this.method_list = dataMethodList;
    this.db_node_selected = [];

    this.SearchService.loadNode().then((data) => {
      this.db_node = data.length ? data : dataDbNode;
    }).then(() => {
      this.type_method_selected = [];
      this.type_method = dataTypeMethod;
      this.type_call_status = dataTypeCallStatus;

      if (this.UserProfile.profileScope.search && this.UserProfile.profileScope.search instanceof Array) {
        this.UserProfile.profileScope.search={};
      }
      this.newObject = this.UserProfile.profileScope.search;
      this.newResult = this.UserProfile.profileScope.result;
      this.newResult.limit = this.newResult.limit || this.UserProfile.profileScope.limit;
      this.newResult.restype = this.type_result[0];
      this.newNode = this.UserProfile.profileScope.node;
      this.newNode.node = this.db_node[0];
      this.timerange = this.UserProfile.profileScope.timerange;
      // END To-do
    }).catch((error) => {
      this.$log.error('[ProtosearchWidget]', '[load node]', error);
    });
  }

  delete() {
    this.onDelete({uuid: this._widget.uuid});
  }

  update(widget) {
    this.onUpdate({uuid: widget.uuid, widget});
  }

  openSettings() {
  
    console.log(this._widget.fields);
  
    this.$uibModal.open({
      component: 'protosearchWidgetSettings',
      resolve: {
        widget: () => {
          return this._widget;
        },
      },
    }).result.then((widget) => {
      this.update(widget);
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error('[ProtosearchWidget]', '[settings]', error);
      }
    });
  }

  // process the form
  processSearchForm() {
    if (this.newObject instanceof Array) {
      this.newObject = {};
    }

    this.searchObject = {};

    for (var key in this.newObject) {

	console.log("K", key);
	console.log("V", this.newObject[key]);

        let myLocalObject = this._widget.fields.find(function(obj) {
		    return obj.name == key;
	});	

	if(myLocalObject) {
	    
	    console.log("OBJ", myLocalObject);
	    
	    let subKey = myLocalObject.hepid + "_"+myLocalObject.profile;
	
	    let lobj = {
	        name: myLocalObject.field_name,
	        value: this.newObject[key],
	        type: myLocalObject.type,
	        hepid: myLocalObject.hepid,
	        profile: myLocalObject.profile,	    
	    }	
	    if(!this.searchObject.hasOwnProperty(subKey)) this.searchObject[subKey]=[];

	    this.searchObject[subKey].push(lobj);	    	    	    
	}
		
	console.log("OB", myLocalObject);
    }

    if(Object.getOwnPropertyNames(this.searchObject).length === 0)
    {
        let subKey = this.widget.config.protocol_id.value + "_"+this.widget.config.protocol_profile.value;                    
        this.searchObject[subKey]=[];
    }
    
    console.log("SEARCH", this.searchObject);
    console.log("RRR1", this.widget.config.protocol_id);
    console.log("RRR2", this.widget.config.protocol_profile);
    
    console.log("FORMS1", this._widget.fields);
    console.log("FORMS2", this.newObject);
    console.log("FORMS3", this.searchObject);
    
    this.UserProfile.setProfile('search', this.searchObject);
    this.UserProfile.setProfile('result', this.newResult);
    this.UserProfile.setProfile('node', this.newNode);
    this.UserProfile.setProfile('limit', this.newResult.limit);
    this.isBusy = true;
    
    let tres = this.newResult.restype.name;
    
    if (tres === 'pcap') {
      this.processSearchResult(0);
    } else if (tres === 'text') {
      this.processSearchResult(1);
    } else if (tres === 'cloud') {
      this.processSearchResult(2);
    } else if (tres === 'count') {
      this.processSearchResult(3);
    } else {
      let protoID = 'call';
      if (has(this.newResult, 'transaction.name')) {
        if (this.newResult.transaction.name === 'registration') {
          protoID = 'registration'; // to-do: find out what is it
        }
      }
      this.searchForProtocol(protoID);
    }
  }

  searchForProtocol(protoID) {
    const { from, to, custom } = this.TimeMachine.getTimerangeUnix();

    this.$state.go(this.ROUTER.SEARCH.NAME, {
      protoID,
      search: this.searchObject,
      limit: this.newResult.limit,
      transaction: this.newResult.transaction || {},
      timezone: this.TimeMachine.getTimezone(),
      from,
      to,
      custom,
    });
  }

  clearSearchForm() {
    this.UserProfile.profileScope.search = {};
    this.UserProfile.setProfile('search', this.newObject);
    this._nullifyObjectKeys(this.newObject);
  }

  _nullifyObjectKeys(obj) {
    Object.keys(obj).forEach(key => obj[key] = null);
  }

  processSearchResult(type) {
    /* save data for next search */
    let data = {param: {}, timestamp: {}};
    let transaction = this.UserProfile.getProfile('transaction');
    let limit = this.UserProfile.getProfile('limit');
    let timedate = this.UserProfile.getProfile('timerange');
    let value = this.UserProfile.getProfile('search');
    let node = this.UserProfile.getProfile('node').dbnode;


    console.log("VALUE",value);
    
    /* make construct of query */
    data.param.transaction = {};
    data.param.location = {};
    data.param.limit = limit;
    data.param.search = value;
    data.param.location.node = node;
    data.timestamp.from = timedate.from.getTime();
    data.timestamp.to = timedate.to.getTime();
    
    angular.forEach(transaction.transaction, function(v) {
      data.param.transaction[v.name] = true;
    });
    
    let ts = new Date().getTime();
    
    this.SearchService.makePcapTextData(data, type).then((msg) => {
      this.isBusy = false;

      let filename;
      let contentType;
      let error;

      // To-do: refactor the condition logic below, current one is confusing
      if (type == 0) {
        filename = 'HEPIC_'+ts+'.pcap';
        contentType = 'application/pcap';
      } else if (type == 1) {
        filename = 'HEPIC_'+ts+'.txt';
        contentType = 'attachment/text;charset=utf-8';
      } else if (type == 2) {
        if (msg.data && msg.data.hasOwnProperty('url')) {
          window.sweetAlert({
            title: 'Export Done!',
            text: `Your PCAP can be accessed <a target='_blank' href='${msg.data.url}'>here</a>`,
            html: true,
          });
        } else {
          error = 'Please check your settings';
          if (msg.data && msg.data.hasOwnProperty('exceptions')) {
            error = msg.data.exceptions;
          }
          window.sweetAlert({
            title: 'Error',
            type: 'error',
            text: `Your PCAP couldn't be uploaded!<BR>${error}`,
            html: true,
          });
        }
        return;
      } else if (type == 3) {
        if (msg.data && msg.data.hasOwnProperty('cnt')) {
          window.sweetAlert({
            title: 'Count done!',
            text: `We found: [${msg.data.cnt}] records`,
            html: true,
          });
        } else {
          error = 'Please check your settings';
          window.sweetAlert({
            title: 'Error',
            type: 'error',
            text: 'Count could not be provided!<BR>',
            html: true,
          });
        }
        return;
      }
      // END To-do
      const blob = new Blob([msg], {type: contentType}); // to-do: define Blob lib
      fileSaver.saveAs(blob, filename);
    }).catch((error) => {
      this.$log.error('[ProtosearchWidget]', '[make pcap text data]', error);
    });
  }

  getIndexType(type) {
    if (this.indexes.hasOwnProperty(type)) {
      if (this.indexes[type].index == 1) {
        return 'Normal index';
      } else if (this.indexes[type].index == 2) {
        return 'Wildcard index';
      }
    }
    return 'Full-Scan Search Field. Use with Caution.';
  }

  getIndexIconType(type) {
    if (this.indexes.hasOwnProperty(type)) {
      if (this.indexes[type].index == 1) {
        return 'fa-bars';
      } else if (this.indexes[type].index == 2) {
        return 'fa-search-plus';
      }
    }
    return 'fa-warning';
  }

  filterStringList(userInput) {
    return new Promise((resolve) => {
      const filtered = this.method_list.filter((method) => !method.toLowerCase().indexOf(userInput.toLowerCase()));
      this.newObject.method = userInput;
      resolve(filtered);
    });
  }

  itemMethodSelected(item) {
    this.$log.debug('Handle item string selected in controller:', item);
  }
}

export default ProtosearchWidget;
