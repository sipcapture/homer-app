const influxdbchartWidget = function($scope, $timeout, UserProfile, $rootScope, EventBus,
  $interval, $uibModal, InfluxdbchartService, EVENTS, HEPICSOURCES, CONFIGURATION, log, ModalHelper, TimeMachine) {
  'ngInject';

  log.initLocation('influxdbchartWidet');
  const self = this;

  if (!$scope.config) {
    $scope.config = {};
  }

  self.d3Chart = {
    data: {},
    events: {},
    api: {},
    config: {},
  };

  EventBus.subscribe(EVENTS.TIME_CHANGE, function() {
    createChart();
  });

  /* MAIN FUNCTIONS */

  self.$onInit = function() {
    $scope.config = self.widget.config;
    self.widget.api.resizeStart = resizeStart;
    self.widget.api.resizeStop = resizeStop;
    self.widget.api.resizeUpdate = resizeUpdate;
    self.widget.api.refresh = refresh;

    if (!$scope.config) $scope.config = {};
    if (!$scope.config.fields) {};
    if (!$scope.config.title) $scope.config.title = ' QuickSearch';
    $scope.fields = $scope.config.fields;
    /* api */
    /* custom dataformat */
    $scope.formatDefault = function(d) {
      return d3.format('.0f')(d);
    };

    $scope.formatBytes = function(a, b) {
      if (0 === a) return '0 Bytes';
      let c = 1024;
      let d = b || 2;
      let e = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      let f = Math.floor(Math.log(a) / Math.log(c));
      return parseFloat((a / Math.pow(c, f)).toFixed(d)) + ' ' + e[f];
    };

    $scope.formatNumbers = function(value) {
      let newValue = value;
      if (value >= 1000) {
        let suffixes = ['', 'k', 'm', 'b', 't'];
        let suffixNum = Math.floor(('' + value).length / 3);
        let shortValue = '';
        for (let precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
          const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
          if (dotLessShortValue.length <= 2) {
            break;
          }
        }
        if (shortValue % 1 != 0) shortNum = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
      }
      return newValue;
    };

    $scope.switchFormat = function(d) {
      if (!$scope.config.format) return d;
      switch ($scope.config.format.value) {
      case 'number':
        return $scope.formatNumbers(d);
        break;
      case 'byte':
        return $scope.formatBytes(d);
        break;
      default:
        return $scope.formatDefault(d);
        break;
      }
    };

    $scope.d3Enabled = false;

    if ($scope.config.chart.hasOwnProperty('library') && $scope.config.chart.library.value == 'd3') {
      $scope.d3Enabled = true;
    }

    createChart();
  };

  self.update = function(widget) {
    self.onUpdate({uuid: widget.uuid, widget});
  };

  self.delete = function() {
    self.onDelete({uuid: self.widget.uuid});
  };

  self.openSettings = function() {
    $uibModal.open({
      component: 'influxdbchartWidgetSettings',
      resolve: {
        config: () => {
          return $scope.config;
        },
      },
    }).result.then((config) => {
      self.widget.config = config;
      self.update(self.widget);
      $scope.config = config;
      $scope.fields = $scope.config.fields;
      createChart();
    });
  };

  $scope.refreshWidget = function() {
    refresh();
  };

  /* API FUNCTION */
  function refresh() {
    log.debug('refresh');
    applyChart();
  };

  function resizeUpdateWithTimeout() {
    if (self.d3Chart.api) self.d3Chart.api.updateWithTimeout(200);
  };

  function resizeStart() {};

  function resizeUpdate() {
    log.debug('resize update');
    if (self.d3Chart.api) self.d3Chart.api.update();
  };

  function resizeStop() {
    if (self.d3Chart.api) self.d3Chart.api.update();
  };

  /** ****************************** [PREPARING CHART DATA]  *******************************************/

  function queryBuilder(qvr, filters, limit, total, index) {
    let query = JSON.parse(qvr);

    let timedate = TimeMachine.getTimerange();
    let timezone = TimeMachine.getTimezone();
    let diff = (new Date().getTimezoneOffset() - timezone.value) * 60 * 1000;

    query.timestamp.from = timedate.from.getTime() - diff;
    query.timestamp.to = timedate.to.getTime() - diff;

    query.param.limit = limit;
    query.param.total = total;
    query.param.query = [];

    let tsDiff = parseInt((query.timestamp.to - query.timestamp.from) / 1000 / 60 / 60);
    let indexRange = 60;
    let fromDate = new Date(query.timestamp.from);

    if (tsDiff < 4) {
      indexRange = 60;
      fromDate.setSeconds(0);
    } else if (tsDiff > 4 && tsDiff < 50) {
      indexRange = 3600;
      fromDate.setMinutes(0);
      fromDate.setSeconds(0);
    } else {
      indexRange = 86400;
      fromDate.setHours(0);
      fromDate.setMinutes(0);
      fromDate.setSeconds(0);
    }

    query.param.precision = indexRange;
    query.param.bfrom = parseInt(fromDate.getTime() / 1000);
    return query;
  };

  /* HERE WE CALL IT FIRST TIME OR ON Engine/Chart change */
  function loadNewChart(sipdata, scObject) {
    const config = $scope.config;
    /* DRAW DATA */
    if (config) {
      $scope.d3Enabled = true;
      if ($scope.config.chart.type && $scope.config.chart.type.hasOwnProperty('value')) {
        hepiChartD3Draw($scope, $scope.config.chart.type['value'], sipdata, scObject);
      }
    }
  };

  /* ONLY APPLY NEW DATA */
  function loadDataChart(sipdata, scObject) {
    const config = $scope.config;
    /* DRAW DATA */
    if (config) {
      $scope.d3Enabled = true;
      if ($scope.config.chart.type && $scope.config.chart.type.hasOwnProperty('value')) {
        hepiChartD3PrepareData($scope.config.chart.type['value'], sipdata, scObject);
      }
    }
  };

  function dataBuilder(dobj) {
    let obj = {};

    if (typeof dobj == 'object') {
      if (dobj.hasOwnProperty('main')) {
        obj['main'] = dobj['main'].value;
      }

      if (dobj.hasOwnProperty('database')) {
          obj['database'] = "\""+dobj['database'].name+"\"";
      }

      if (dobj.hasOwnProperty('retention')) {
        obj['retention'] = "\""+dobj['retention'].name+"\"";        
      }

      if (dobj.hasOwnProperty('value')) {
        obj['value'] = dobj['value'];
      }

      if (dobj.hasOwnProperty('type')) {
        const daz = [];
        angular.forEach(dobj['type'], function(tobj, tkey) {
          daz.push(tobj['value']);
        });

        obj['type'] = daz;
      }

      if (dobj.hasOwnProperty('tag')) {
        const daz = [];
        angular.forEach(dobj['tag'], function(tobj, tkey) {
          daz.push(tobj['value']);
        });

        obj['tag'] = daz;
      }

      if (dobj.hasOwnProperty('typetag') && dobj['typetag'].value.length > 0) {
        obj['typetag'] = dobj['typetag'].value;
      }
    }

    return obj;
  };

  function createChart() {
    const config = $scope.config;

    if (config.dataquery && config.dataquery.data) {
      let hepiChartobjQuery = {};
      let hepiChartobjParam = {};

      for (let i = 0; i < config.dataquery.data.length; i++) {
        let myData = config.dataquery.data[i];
        let dalias = '';
        if (config.panel.queries[i] && config.panel.queries[i].type) dalias = config.panel.queries[i].type.alias;
        if (dalias == 'influxdb') {
          if (angular.equals(hepiChartobjQuery, {})) {
            let dDD = HEPICSOURCES.DATA[dalias];
            let sum = false;
            if (config.dataquery.data[i]['sum']) sum = config.dataquery.data[i]['sum'];
            let limit = 500;
            if (config.dataquery.data[i]['limit']) limit = parseInt(config.dataquery.data[i]['limit']);
            if (limit < 1) limit = 500;
            dDD.settings.limit = limit;

            hepiChartobjQuery = queryBuilder(dDD.settings.query, '', dDD.settings.limit, sum, i);
            hepiChartobjParam.path = dDD.settings.path;
          };
          let nData = dataBuilder(myData);
          hepiChartobjQuery.param.query.push(nData);
        }
      };

      if (!angular.equals(hepiChartobjQuery, {})) {
        InfluxdbchartService.get(config, hepiChartobjParam.path, hepiChartobjQuery).then(function(sdata) {
          loadNewChart(sdata, hepiChartobjQuery);
          resizeUpdateWithTimeout();
        }).catch(function(err) {
          log.error('create chart', err);
        });
      };
    };
  };

  function applyChart() {
    const config = $scope.config;

    if (config.dataquery && config.dataquery.data) {
      let hepiChartobjQuery = {};
      let hepiChartobjParam = {};

      for (let i = 0; i < config.dataquery.data.length; i++) {
        const myData = config.dataquery.data[i];
        const dalias = config.panel.queries[i].type.alias;
        if (dalias == 'influxdb') {
          if (angular.equals(hepiChartobjQuery, {})) {
            let dDD = HEPICSOURCES.DATA[dalias];
            let sum = false;
            if (config.dataquery.data[i]['sum']) sum = config.dataquery.data[i]['sum'];
            let limit = 500;
            if (config.dataquery.data[i]['limit']) limit = parseInt(config.dataquery.data[i]['limit']);
            if (limit < 1) limit = 500;
            dDD.settings.limit = limit;

            hepiChartobjQuery = queryBuilder(dDD.settings.query, '', dDD.settings.limit, sum, i);
            hepiChartobjParam.path = dDD.settings.path;
          };

          const nData = dataBuilder(myData);
          hepiChartobjQuery.param.query.push(nData);
        }
      };

      if (!angular.equals(hepiChartobjQuery, {})) {
        InfluxdbchartService.get(config, hepiChartobjParam.path, hepiChartobjQuery).then(function(sdata) {
          loadDataChart(sdata, hepiChartobjQuery);
        }).catch(function(err) {
          log.error('apply chart', err);
        });
      };
    };
  };

  /** ************************************** D3 FUNCTIONS ***********************/

  function hepichartD3Data(data, scObject) {
    let timefield = 'reporttime';
    log.debug('hepichartD3Data', data);

    let names = [];
    let values = {};
    let timefields = [];
    let timefieldData;
    let preparedData = [];

    // save every little cycle here!
    for (let each = 0; each < data.length; each++) {
      let seen = new Set();
      let dataLoc = data[each];
      for (let ind = 0; ind < dataLoc.length; ++ind) {
        let entry = dataLoc[ind];
        let name = entry['table'] + '.' + entry['countername'];
        let value = parseInt(entry['value']);
        if (!seen.has(name)) {
          seen.add(name);
          names.push(name);
          values[name] = {};
        }
        timefieldData = entry[timefield];
        timefields.push(timefieldData);
        values[name][timefieldData] = (values[name][timefieldData] || 0) + value;
      }
    }

    if (UserProfile.getServerProfile('dashboard')) {
      $scope.multicolor = UserProfile.getServerProfile('dashboard').multicolor;
    } else {
      $scope.multicolor = false;
    }

    angular.forEach(names, function(name) { // Order and fill empty data
      if (!name) return;
      let valuesData = [];
      let total = 0;

      timefields.forEach(function(timefield) {
        total = total + (parseInt(values[name][timefield]) || 0);
        valuesData.push({
          timefield: timefield,
          value: parseInt(values[name][timefield]) || 0,
        });
      });

      /* multicolor option for series */
      if (!$scope.colorSet) {
        $scope.colorSet = [];
      }
      if (!$scope.multicolor) {
        if (!$scope.colorSet[name]) {
          $scope.colorSet[name] = '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
      }

      preparedData.push({
        color: $scope.colorSet[name],
        key: name,
        values: valuesData,
      });
    });

    resizeUpdate();
    return preparedData;
  };

  function hepichartD3BarData(data, scObject) {
    let names = [];
    let values = {};
    let preparedData = [];
    let valuesData = [];

    angular.forEach(data, function(dataLoc, key) {
      angular.forEach(dataLoc, function(entry) {
        let name = '';
        let value = 0;

        name = entry['countername'];
        value = parseInt(entry['value']);

        if (names.indexOf(name) === -1) { // Getting names
          names.push(name);
        }

        if (!(name in values)) { // Create key if don't exists
          values[name] = {};
          values[name] = 0;
        }

        values[name] = value + values[name];
      });
    });

    angular.forEach(names, function(name) { // Order and fill empty data
      if (!$scope.colorSet) {
        $scope.colorSet = [];
      }
      if (!$scope.multicolor && !$scope.colorSet[name]) {
        $scope.colorSet[name] = '#' + Math.floor(Math.random() * 16777215).toString(16);
      }

      valuesData.push({
        color: $scope.colorSet[name],
        label: name,
        value: parseInt(values[name]) || 0,
      });
    });

    if (!$scope.colorSet) {
      $scope.colorSet = [];
    }
    if (!$scope.multicolor && !$scope.colorSet[name]) {
      $scope.colorSet[name] = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    preparedData.push({
      color: $scope.colorSet[name],
      key: 'Cumulative',
      values: valuesData,
    });

    return preparedData;
  };

  function hepichartD3PieData(data, scObject) {
    let names = [];
    let values = {};
    let preparedData = [];

    angular.forEach(data, function(dataLoc, key) {
      angular.forEach(dataLoc, function(entry) {
        let name = '';
        let value = 0;

        name = entry['countername'];
        value = parseInt(entry['value']);

        if (names.indexOf(name) === -1) { // Getting names
          names.push(name);
        }

        if (!(name in values)) { // Create key if don't exists
          values[name] = {};
          values[name] = 0;
        }

        values[name] = value + values[name];
      });
    });

    angular.forEach(names, function(name) { // Order and fill empty data
      if (!$scope.colorSet) {
        $scope.colorSet = [];
      }
      if (!$scope.multicolor && !$scope.colorSet[name]) {
        $scope.colorSet[name] = '#' + Math.floor(Math.random() * 16777215).toString(16);
      }

      preparedData.push({
        color: $scope.colorSet[name],
        key: name,
        value: parseInt(values[name]) || 0,
      });
    });

    return preparedData;
  };

  function hepichartD3SumData(data, scObject) {
    let names = [];
    let values = {};
    let preparedData = [];
    let total = [];

    angular.forEach(data, function(dataLoc, key) {
      angular.forEach(dataLoc, function(entry) {
        let name = '';
        let value = 0;

        name = entry['countername'];
        value = parseInt(entry['value']);

        if (names.indexOf(name) === -1) { // Getting names
          names.push(name);
        }

        if (!(name in values)) { // Create key if don't exists
          values[name] = {};
          values[name] = 0;
          total[name] = 0;
        }

        total[name] ++;
        values[name] = value + values[name];
      });
    });

    angular.forEach(names, function(name) { // Order and fill empty data
      if (!$scope.colorSet) {
        $scope.colorSet = [];
      }

      if (!$scope.multicolor && !$scope.colorSet[name]) {
        $scope.colorSet[name] = '#' + Math.floor(Math.random() * 16777215).toString(16);
      }

      preparedData.push({
        color: $scope.colorSet[name],
        key: name,
        values: [{
          key: name,
          value: parseInt((values[name] || 0) / total[name]),
        }],
      });
    });
    return preparedData;
  };


  /** ****************** OPTIONS FOR CHARTS ****************/

  function hepiChartD3lineChart(customData) {
    self.d3Chart.options = {
      chart: {
        type: 'lineChart',
        interpolate: 'basis',
        margin: {
          top: 40,
          right: 20,
          bottom: 40,
          left: 75,
        },
        x: function(d) {
          return d.timefield;
        },
        y: function(d) {
          return d.value;
        },
        useInteractiveGuideline: true,
        reduceXTicks: true,
        xAxis: {
          axisLabel: 'Time',
          tickFormat: function(d) {
            return d3.time.format('%H:%M')(new Date(d * 1000));
          },
        },
        yAxis: {
          // axisLabel: 'Packets',
          tickFormat: function(d) {
            return $scope.switchFormat(d) || d3.format('.01f')(d);
            return d3.format('.01f')(d);
          },
          axisLabelDistance: -10,
        },
        showLegend: true,
        valueFormat: d3.format('.0f'),
        callback: function(chart) {
          $timeout(function() {
            d3.selectAll('.nvtooltip').remove();
            d3.selectAll('.nvtooltip').style('opacity', 0);
          }, 100);
        },
      },
    };

    self.d3Chart.data = customData;
  };

  function hepiChartD3pieChart(customData) {
    self.d3Chart.options = {
      chart: {
        type: 'pieChart',
        margin: {
          top: 30,
          right: 0,
          bottom: 0,
          left: 0,
        },
        x: function(d) {
          return d.key;
        },
        y: function(d) {
          return d.value;
        },
        duration: 500,
        labelThreshold: 15.01,
        labelSunbeamLayout: true,
        showLegend: false,
      },
    };
  };

  function hepiChartD3scatterChart(customData) {
    self.d3Chart.options = {
      chart: {
        type: 'scatterChart',
        margin: {
          top: 40,
          right: 20,
          bottom: 40,
          left: 75,
        },
        scatter: {
          onlyCircles: false,
        },
        showDistX: true,
        showDistY: true,
        duration: 350,
        x: function(d) {
          return d.timefield;
        },
        y: function(d) {
          return d.value;
        },
        useInteractiveGuideline: true,
        xAxis: {
          tickFormat: function(d) {
            return d3.time.format('%H:%M')(new Date(d * 1000));
          },
        },
        yAxis: {
          tickFormat: function(d) {
            return $scope.switchFormat(d) || d3.format('.0f')(d);
          },
          axisLabelDistance: -10,
        },
        zoom: {
          enabled: true,
          scaleExtent: [1, 10],
          useFixedDomain: false,
          useNiceScale: false,
          horizontalOff: false,
          verticalOff: true,
          unzoomEventType: 'dblclick.zoom',
        },
        showLegend: false,
        valueFormat: d3.format('.0f'),
        callback: function(chart) {
          $timeout(function() {
            d3.selectAll('.nvtooltip').remove();
            d3.selectAll('.nvtooltip').style('opacity', 0);
          }, 100);
        },
      },
    };
  };

  function hepiChartD3stackedAreaChart(customData) {
    self.d3Chart.options = {
      chart: {
        type: 'stackedAreaChart',
        margin: {
          top: 40,
          right: 20,
          bottom: 30,
          left: 75,
        },
        x: function(d) {
          return d.timefield;
        },
        y: function(d) {
          return d.value;
        },
        useVoronoi: false,
        duration: 300,
        reduceXTicks: true,
        useInteractiveGuideline: false,
        xAxis: {
          showMaxMin: false,
          tickFormat: function(d) {
            return d3.time.format('%H:%M')(new Date(d * 1000));
          },
        },
        valueFormat: d3.format('.0f'),
        yAxis: {
          tickFormat: function(d) {
            return $scope.switchFormat(d) || d3.format('.0f')(d);
          },
        },
        callback: function(chart) {
          $timeout(function() {
            d3.selectAll('.nvtooltip').style('opacity', 0);
            d3.selectAll('.nvtooltip').remove();
          }, 150);
        },
      },
    };
  };

  function hepiChartD3multiBarChart(customData) {
    self.d3Chart.options = {
      chart: {
        type: 'multiBarChart',
        margin: {
          top: 40,
          right: 20,
          bottom: 40,
          left: 75,
        },
        x: function(d) {
          return d.timefield;
        },
        y: function(d) {
          return d.value;
        },
        showValues: true,
        reduceXTicks: true,
        stacked: true,
        duration: 500,

        xAxis: {
          showMaxMin: false,
          tickFormat: function(d) {
            return d3.time.format('%H:%M')(new Date(d * 1000));
          },
        },
        callback: function(chart) {
          chart.multibar.dispatch.on('elementClick', function(e) {
            log.debug('elementClick in callback', e.data);
          });

          $timeout(function() {
            d3.selectAll('.nvtooltip').remove();
            d3.selectAll('.nvtooltip').style('opacity', 0);
          }, 100);
        },
        yAxis: {
          tickFormat: function(d) {
            return $scope.switchFormat(d) || d3.format('.0f')(d);
          },
        },
        valueFormat: d3.format('.0f'),
      },
    };
  };

  function hepiChartD3multiBarHorizontalChart(customData) {
    self.d3Chart.options = {
      chart: {
        type: 'multiBarHorizontalChart',
        margin: {
          top: 40,
          right: 20,
          bottom: 40,
          left: 75,
        },
        x: function(d) {
          return d.key;
        },
        y: function(d) {
          return d.value;
        },
        showValues: true,
        showControls: true,
        stacked: false,
        duration: 500,
        callback: function(chart) {
          $timeout(function() {
            d3.selectAll('.nvtooltip').remove();
            d3.selectAll('.nvtooltip').style('opacity', 0);
          }, 100);
        },
        showXAxis: false,
        showYAxis: false,
        yAxis: {
          tickFormat: function(d) {
            return $scope.switchFormat(d) || d3.format('.0f')(d);
          },
        },
        valueFormat: d3.format('.0f'),
      },
    };
  };

  /** ***************** CHECK OF TYPE *****************/

  function hepiChartD3Draw($scope, type, data, scObject) {
    log.debug(type);

    let customData;
    $scope.d3Enabled = true;

    if (type == 'pie') {
      customData = hepichartD3PieData(data, scObject);
      hepiChartD3pieChart();
    } else if (type == 'scatter') {
      customData = hepichartD3Data(data, scObject);
      hepiChartD3scatterChart();
    } else if (type == 'line') {
      customData = hepichartD3Data(data, scObject);
      hepiChartD3lineChart();
    } else if (type == 'areaspline') {
      customData = hepichartD3Data(data, scObject);
      hepiChartD3stackedAreaChart();
    } else if (type == 'bar') {
      customData = hepichartD3Data(data, scObject);
      hepiChartD3multiBarChart();
    } else if (type == 'horizontal') {
      customData = hepichartD3SumData(data, scObject);
      hepiChartD3multiBarHorizontalChart();
    } else {
      customData = hepichartD3Data(data, scObject);
      hepiChartD3stackedAreaChart();
    }

    hepiChartD3ApplyData(type, customData);
  };

  function hepiChartD3PrepareData(type, data, scObject) {
    log.debug('prepare data', type);

    let customData;
    if (type == 'pie') {
      customData = hepichartD3PieData(data, scObject);
    } else if (type == 'horizontal') {
      customData = hepichartD3SumData(data, scObject);
    } else if (type == 'scatter') {
      customData = hepichartD3Data(data, scObject);
    } else if (type == 'line') {
      customData = hepichartD3Data(data, scObject);
    } else if (type == 'areaspline') {
      customData = hepichartD3Data(data, scObject);
    } else if (type == 'bar') {
      customData = hepichartD3Data(data, scObject);
    } else {
      customData = hepichartD3BarData(data, scObject);
    }

    hepiChartD3ApplyData(type, customData);
    /* UPDATE DATA*/
  };

  function hepiChartD3ApplyData(type, customData) {
    log.debug('custom', customData);
    self.d3Chart.data = customData;
  };
};

export default influxdbchartWidget;
