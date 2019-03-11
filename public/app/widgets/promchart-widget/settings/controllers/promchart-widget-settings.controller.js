class PromchartWidgetSettings {
  constructor($scope, $http, UserProfile, HEPICSOURCES, CONFIGURATION, EventBus, EVENTS, log) {
    'ngInject';
    this.$scope = $scope;
    this.$http = $http;
    this.UserProfile = UserProfile;
    this.HEPICSOURCES = HEPICSOURCES;
    this.CONFIGURATION = CONFIGURATION;
    this.EventBus = EventBus;
    this.EVENTS = EVENTS;
    this.log = log;
    this.log.initLocation('promchartWidgetSettings');
  }

  $onInit() {
    this.config = this.resolve.config;
    this._config = angular.copy(this.config);
    this.panel = {};
    this.mainTag = '';
    
    /* Chart options */
    this.metricsdatasources = {"prometheus": this.HEPICSOURCES.DATA['prometheus']};    
    //this.panel.metricsdatasources = this.HEPICSOURCES.DATA[0];    
    this.log.debug('DB', this.metricsdatasources);
    
    const dbdata = [];
    
    this.displayExpertMode = false;
    this.expertMode = 'Switch to expert mode';
    this.expertClass = 'glyphicon glyphicon-chevron-down';
    //this.updateDebugUrl(0);
  
    if (!this._config.dataquery) {
      this._config.dataquery = {};
      this._config.dataquery.data = [];
    }
  
    if (!this._config.dataquery.data) {
      this._config.dataquery.data = [];
    }
  
    this.newObject = {};

    this.dataformats = [
      {
        id: 1,
        label: 'Default',
        value: 'raw',
      },
      {
        id: 2,
        label: 'Bytes',
        value: 'byte',
      },
      {
        id: 3,
        label: 'Numbers',
        value: 'number',
      },
    ];
  
    this.charts = [
      {
        id: 2,
        label: 'Line',
        value: 'line',
      }, {
        id: 3,
        label: 'Area',
        value: 'areaspline',
      }, {
        id: 4,
        label: 'Bar',
        value: 'bar',
      }, {
        id: 5,
        label: 'Scatter',
        value: 'scatter',
      }, {
        id: 6,
        label: 'Pie',
        value: 'pie',
      }, {
        id: 7,
        label: 'Horizontal Bar',
        value: 'horizontal',
      },
    ];
  
    this.library = [{
      id: 3,
      label: 'D3JS',
      value: 'd3',
    }];
  
    this.legend_align = [{
      name: 'center',
      value: 'center',
    }, {
      name: 'right',
      value: 'right',
    }, {
      name: 'left',
      value: 'left',
    }];
  
    this.legend_layout = [{
      name: 'horizontal',
      value: 'horizontal',
    }, {
      name: 'vertical',
      value: 'vertical',
    }];
  }

  dismiss() {
    this.modalInstance.dismiss();
  };
  
  remove() {
    this.log.debug('done remove');
    this.dashboard.widgets.splice(this.dashboard.widgets.indexOf(widget), 1);
    this.modalInstance.close();
  };
  
  save() {
    angular.extend(this.config, this._config);
    this.modalInstance.close(this.config);
  };

  updateDebugUrl(index) {
    const url = this.CONFIGURATION.APIURL + this._config.dataquery.data[index]['rawpath'];
    try {
      const objQuery = JSON.parse(this._config.dataquery.data[index]['rawquery']);
      this.debug = `curl -v --cookie 'HEPICSSID=HEPICSSID' -X POST \\\n-d '${JSON.stringify(objQuery)}' \\\n ` +
        `"${window.location.protocol}//${window.location.host}/${url}"\n`;
      this.parsingStatus = 'No syntax errors';
      this.parsingColorClass = 'green';
    } catch (e) {
      this.parsingStatus = `Bad parsing: ["${e.message}"]`;
      this.parsingColorClass = 'red';
    }
    this.parsingStatus = 'SQL/InfluxQL';
    this.parsingColorClass = 'green';
  };
  
  tagTransform(newTag) {
    return {
      name: newTag,
      value: newTag,
    };
  }

  popuplateMainCategory() {

    this.myRemotedata = [];
          
    const urlMetrics = this.CONFIGURATION.APIURL + 'prometheus/label';
    this.$http.get(urlMetrics).then((resp) => {
      if (resp && resp.status && resp.status === 200) {        
        resp.data.forEach((val) => this.myRemotedata.push({name: val, value: val}));
        //this.myRemotedata = resp.data;           
      } else {
        this.log.error('popuplate main category', 'fail to get data');
      }
    }).catch((err) => {
      this.log.error('popuplate main category', err);
    });
  };

  /* changing metrics for Elastic */
  checkSourceSelection(param, index) {
    this.page = 0;
    this.searchTerm = '';
    this.log.debug('source selecttion...');

    let countervalue = this._config.dataquery.data[index][param].value;
    this._config.dataquery.data[index]['type'] = {};
    this._config.dataquery.data[index]['rawpath'] = [];
    this._config.dataquery.data[index]['rawquery'] = [];
    this.popuplateSourceTypeData(index, countervalue);
    this.mainTag = countervalue;
  };

  /* changing metrics for Elastic */
  checkTagSelection(index) {
    this.log.debug(index);
    let mainTag = this._config.dataquery.data[index]['main'].value;
    if (this._config.dataquery.data[index]['typetag']) {
      let typeTag = this._config.dataquery.data[index]['typetag'].value;
      this._config.dataquery.data[index]['tag'] = {};
      this.popuplateTagsData(index, mainTag, typeTag);
    }
  };

  checkMainSelection(index) {  
    this.log.debug(index);
  
    const mainTag = this._config.dataquery.data[index]['main'].value;
  
    this._config.dataquery.data[index]['type'] = [];
    this._config.dataquery.data[index]['tag'] = [];
    this._config.dataquery.data[index]['rawpath'] = [];
    this._config.dataquery.data[index]['rawquery'] = [];
  
    this.popuplateSourceTypeData(index, mainTag);
    this.popuplateTags(index, mainTag);
  };

  // ==========================================================================================
  //  Chart basic settings
  // ==========================================================================================
  
  // ------------------------------------------------------------------------------------------
  //  Select Chart
  // ------------------------------------------------------------------------------------------
  selectType() {
    if (this._config.chart.type.value == 'pie') {
      this._config.panel.total = true;
    } else {
      if (this._config.panel) this._config.panel.total = false;
    }
  };

  // ------------------------------------------------------------------------------------------
  //  Select Engine
  // ------------------------------------------------------------------------------------------
  selectEngine() {
    if (this._config.chart.update) this._config.chart.update.clear();
  };

  // ==========================================================================================
  //  Filters
  // ==========================================================================================
  
  // add an item
  addFilter() {
    if (!this._config.panel.filters) {
      this._config.panel.filters = [];
    }
    this._config.panel.filters.push({
      type: this._config.panel.filter.type,
      value: this._config.panel.filtervalue.value,
    });
  };

  /* add QUERY */
  addQuery() {
    if (!this._config.panel.queries) {
      this._config.panel.queries = [];
    }
  
    let index = this._config.panel.queries.length;
    index++;
  
    this._config.panel.queries.push({
      name: 'A' + index,
      type: {
        name: this.panel.metricsdatasource.name,
        alias: this.panel.metricsdatasource.alias,
      },
      value: 'query',
    });
  };

  /* edit QUERY */
  editQuery(index) {
    let alias = this._config.panel.queries[index].type.alias;
    this.dataAlias = alias;
    this.displayQuery = true;
    this.fieldsdata = this.HEPICSOURCES.DATA[alias].fields;
    this.dataSourceName = this.HEPICSOURCES.DATA[alias].name;
    this.log.debug('fieldsdata', this.fieldsdata);
    this.log.debug('hepicsource', this.HEPICSOURCES.DATA[alias]);
    this.localindex = index;
  
    /* MAIN CATEGORY*/
    this.popuplateMainCategory();
  
    if (!this._config.dataquery.data) {
      this._config.dataquery.data = {};
    }
  
    if (!this._config.dataquery.data[index]) {
      this._config.dataquery.data[index] = {};
      this._config.dataquery.data[index].sum = false;
    }
  
    if (Array.isArray(this._config.dataquery.data[index])) {
      this._config.dataquery.data[index] = {};
    }
  
    /* populate editQuery */
    if (this._config.dataquery.data[index]['main'] && this._config.dataquery.data[index]['main'].value) {
      this.popuplateSourceTypeData(index, this._config.dataquery.data[index]['main'].value);
      this.mainTag = this._config.dataquery.data[index]['main'].value;
      this.popuplateTags(index, this.mainTag);
  
      if (this._config.dataquery.data[index]['typetag'] && this._config.dataquery.data[index]['typetag'].value) {
        const mainTag = this._config.dataquery.data[index]['main'].value;
        const typeTag = this._config.dataquery.data[index]['typetag'].value;
        this.popuplateTagsData(index, mainTag, typeTag);
      }
    }
  };

  showExpertMode() {
    this.displayExpertMode = !this.displayExpertMode;
    if (this.displayExpertMode) {
      this.expertMode = 'Switch to normal mode';
      this.expertClass = 'glyphicon glyphicon-chevron-up';
    } else {
      this.expertMode = 'Switch to expert mode';
      this.expertClass = 'glyphicon glyphicon-chevron-down';
    }
  };

  // remove an item
  removeFilter(index) {
    this._config.panel.filters.splice(index, 1);
  };

  removeQuery(index) {
    this._config.panel.queries.splice(index, 1);
    /* remove data */
    this._config.dataquery.data[index] = {};
  };
}

export default PromchartWidgetSettings;
