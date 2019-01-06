import 'angular-clock';
import 'angular-clock/dist/angular-clock.css';
import '../style/rsearch-widget.css';

import {cloneDeep} from 'lodash';

class RsearchWidget {
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
    this.newObject = this.UserProfile.profileScope.search;
    this.newResult = this.UserProfile.profileScope.result;
    this.newResult.limit = this.newResult.limit || this.UserProfile.profileScope.limit;
    this.newResult.restype = this.type_result[0];
    this.newNode = this.UserProfile.profileScope.node;
    this.newNode.node = this.db_node[0];
    this.timerange = this.UserProfile.profileScope.timerange;                                         
  }

  get gmtOffset() {
    return this._widget.config.location.offset || '+1';
  }

  get locationName() {
    return this._widget.config.location.desc.toUpperCase() || 'unknown';
  }

  delete() {
    this.onDelete({uuid: this._widget.uuid});
  }

  update(widget) {
    this._widget = widget;
    this.onUpdate({uuid: this._widget.uuid, widget});
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
    
    let protoID = 'call';
    this.searchForProtocol(protoID);    

  }

  searchForProtocol(protoID) {
    const { from, to, custom } = this.TimeMachine.getTimerangeUnix();

    this.$state.go(this.ROUTER.REMOTE.NAME, {
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

  openSettings() {
    this.$uibModal.open({
      component: 'rsearchWidgetSettings',
      resolve: {
        widget: () => {
          return cloneDeep(this._widget);
        },
        timezones: () => {
          return this.TIMEZONES;
        },
      },
    }).result.then((widget) => {
      this.update(widget);
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error(['ResearchWidget', 'settings'], error);
      }
    });
  }
}

export default RsearchWidget;
