/* global angular */
import Promise from 'bluebird';
import { cloneDeep, has } from 'lodash';
import fileSaver from 'file-saver';

import controller from './quicksearch-widget.settings.controller.js';
import template from '../templates/quicksearch-widget.settings.template.html';

import data_fields from '../data/fields';
import data_indexes from '../data/indexes';
import data_type_transaction from '../data/type_transaction';
import data_type_mono_status from '../data/type_mono_status';
import data_type_result from '../data/type_result';
import data_method_list from '../data/method_list';
import data_type_method from '../data/type_method';
import data_type_call_status from '../data/type_call_status';
import data_db_node from '../data/db_node';

const injectParams = [
  '$scope',
  '$state',
  'userProfile',
  '$log',
  'searchService',
  '$uibModal',
  'CONFIGURATION'
];

const QuicksearchWidgetCtrl = function($scope, $state, userProfile, $log, searchService, $uibModal, CONFIGURATION) {
  const self = this;

  self.$onInit = function () {
    self._widget = cloneDeep(self.widget);
    self._widget.config = self._widget.config || {};
    self._widget.config.title = self._widget.config.title || 'QuickSearch';
    self._widget.fields = self._widget.fields || data_fields;

    // To-do: check if all the vars below are needed
    self.indexes = data_indexes.indexes;

    if (CONFIGURATION.USER_EXT_CR) {
      self.indexes = angular.extend(self.indexes, data_indexes.user_ext_cr_indexes);
    }
            
    self.type_transaction = data_type_transaction;
    self.type_mono_status = data_type_mono_status;
    self.type_result = data_type_result;
    self.method_list = data_method_list;
    self.db_node_selected = [];

    searchService.loadNode().then(function (data) {
      self.db_node = data.length ? data : data_db_node;
    }).then(function () {
      self.type_method_selected = [];
      self.type_method = data_type_method;
      self.type_call_status = data_type_call_status;

      if (userProfile.profileScope.search && userProfile.profileScope.search instanceof Array) {
        userProfile.profileScope.search={};
      }
      self.newObject = userProfile.profileScope.search;
      self.newResult = userProfile.profileScope.result;
      self.newResult.limit = self.newResult.limit || userProfile.profileScope.limit;
      self.newResult.restype =  self.type_result[0];
      self.newNode = userProfile.profileScope.node;
      self.newNode.node =  self.db_node[0];
      self.timerange = userProfile.profileScope.timerange;
      // END To-do
    }).catch(function (error) {
      $log.error('quicksearch', 'widget', 'controller', error);
    });
  };

  self.delete = function () {
    self.onDelete({ widget: self._widget });
  };

  self.update = function (widget) {
    self.onUpdate({ widget });
  };

  self.openSettings = function () {
    $uibModal
      .open({
        controllerAs: '$ctrl',
        controller,
        template,
        resolve: {
          widget: function () {
            return self._widget;
          }
        }
      })
      .result.then(function (widget) {
        self.update(widget);
      }).catch(function (error) {
        if (!(error === 'cancel' || error === 'escape key press')) {
          $log.error(error);
        }
      });
  };

  /* update if timerange will be changed */
  (function () {
    $scope.$watch(function () {
      return userProfile.profileScope.search;
    }, function (newVal, oldVal) {
      if ( newVal !== oldVal ) {
        self.newObject = newVal;
      }
    });
  }());

  // process the form
  self.processSearchForm = function() {
    if (self.newObject instanceof Array) {
      self.newObject = {};
    }

    self._widget.fields.forEach(function (field) {
      self.newObject[field.name] = self.newObject[field.name] || '';
    });
    
    userProfile.setProfile('search', self.newObject);
    userProfile.setProfile('result', self.newResult);
    userProfile.setProfile('node', self.newNode);
    userProfile.setProfile('limit', self.newResult.limit);
    self.isBusy = true;
    
    var tres = self.newResult.restype.name;
    
    if (tres === 'pcap') {
      self.processSearchResult(0);
    } else if (tres === 'text') {
      self.processSearchResult(1);
    } else if (tres === 'cloud') {
      self.processSearchResult(2);
    } else if (tres === 'count') {
      self.processSearchResult(3);
    } else {
      let protoID = 'call';
      if (has(self.newResult, 'transaction.name')) {
        if (self.newResult.transaction.name === 'registration') {
          protoID = 'registration'; //To-do: find out what is it
        }
      }
      
      $state.go('searchCall', { protoID });
    }
  };

  self.clearSearchForm = function() {
    userProfile.profileScope.search = {};
    userProfile.setProfile('search', self.newObject);
  };

  self.processSearchResult = function(type) {
    /* save data for next search */
    var data = {param:{}, timestamp:{}};
    
    var transaction = userProfile.getProfile('transaction');
    var limit = userProfile.getProfile('limit');
    var timedate = userProfile.getProfile('timerange');
    var value = userProfile.getProfile('search');
    var node = userProfile.getProfile('node').dbnode;
    
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
    
    var ts = new Date().getTime();
    
    searchService.makePcapTextData(data, type).then(function (msg) {
      self.isBusy = false;

      let filename;
      let content_type;
      let error;

      // To-do: refactor the condition logic below, current one is confusing
      if (type == 0) {
        filename = 'HEPIC_'+ts+'.pcap';
        content_type = 'application/pcap';
      } else if (type == 1) {
        filename = 'HEPIC_'+ts+'.txt';
        content_type = 'attachment/text;charset=utf-8';
      } else if (type == 2) {
        if (msg.data && msg.data.hasOwnProperty('url')) {
          window.sweetAlert({
            title: 'Export Done!',
            text: `Your PCAP can be accessed <a target='_blank' href='${msg.data.url}'>here</a>`,
            html: true
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
            html: true
          });
        }
        return;
      } else if (type == 3) {
        if (msg.data && msg.data.hasOwnProperty('cnt')) {
          window.sweetAlert({
            title: 'Count done!',
            text: `We found: [${msg.data.cnt}] records`,
            html: true
          });
        } else {
          error = 'Please check your settings';
          window.sweetAlert({
            title: 'Error',
            type: 'error',
            text: 'Count could not be provided!<BR>',
            html: true
          });
        }
        return;
      }
      // END To-do
      var blob = new Blob([msg], {type: content_type});
      fileSaver.saveAs(blob, filename);
    }).catch(function (error) {
      $log.error('quicksearch', 'widget', 'controller', error);
    });
  };

  self.getIndexType = function(type) {
    if (self.indexes.hasOwnProperty(type)) {
      if (self.indexes[type].index == 1) {
        return 'Normal index';
      } else if (self.indexes[type].index == 2) {
        return 'Wildcard index';
      }
    }
    return 'Full-Scan Search Field. Use with Caution.';
  };

  self.getIndexIconType = function(type) {
    if (self.indexes.hasOwnProperty(type)) {
      if (self.indexes[type].index == 1) {
        return 'fa-bars';
      } else if (self.indexes[type].index == 2) {
        return 'fa-search-plus';
      }
    }
    return 'fa-warning';
  };

  self.filterStringList = function(userInput) {
    return new Promise(function (resolve) {
      const filtered = self.method_list.filter(method => !method.toLowerCase().indexOf(userInput.toLowerCase()));
      self.newObject.method = userInput;
      resolve(filtered);
    });
  };

  self.itemMethodSelected = function(item) {
    $log.debug('Handle item string selected in controller:', item);
  };
};

QuicksearchWidgetCtrl.$inject = injectParams;
export default QuicksearchWidgetCtrl;
