import {cloneDeep} from 'lodash';

export default class prometheuschartWidget {
  constructor($log, $uibModal, $http, ModalHelper, EVENTS, CONFIGURATION, log, EventBus, TimeMachine) {
    'ngInject'; // inject all modules above
    this.$log = $log; // log service
    this.$uibModal = $uibModal; // boostrap modal component
    this.ModalHelper = ModalHelper; // homer modal helper service
    this.CONFIGURATION = CONFIGURATION;
    this.$http = $http;
    this.EventBus = EventBus;
    this.EVENTS = EVENTS;
    this.log = log;
    this.TimeMachine = TimeMachine;
    this.options = {
      chart: {
        type: 'lineChart',
        height: 400,
        margin: {
          top: 20,
          right: 20,
          bottom: 40,
          left: 100,
        },
        x: function(d) {
          return d[0];
        },
        y: function(d) {
          return parseInt(d[1]);
        },
        useInteractiveGuideline: true,
        dispatch: {
          stateChange: function(e) {
            console.log('stateChange');
          },
          changeState: function(e) {
            console.log('changeState');
          },
          tooltipShow: function(e) {
            console.log('tooltipShow');
          },
          tooltipHide: function(e) {
            console.log('tooltipHide');
          },
        },
        xAxis: {
          axisLabel: 'Time (ms)',
          tickFormat: function(d) {
            return new Date(d * 1000).toLocaleTimeString();
          },
        },
        yAxis: {
          tickFormat: function(d) {
            return d3.format('.02f')(d);
          },
          axisLabelDistance: 10,
        },
        callback: function(chart) {

        },
      },
    };
    this.data = [];
    this.timeChangeListener = null;
  }

  $onInit() {
    this._widget = cloneDeep(this.widget);
    this.updateMetricDatabase();
    this.createListeners();
  }

  updateMetricDatabase() {

    let timedate = this.TimeMachine.getTimerange();    
    let timezone = this.TimeMachine.getTimezone();
    let diff = (new Date().getTimezoneOffset() - timezone.value) * 60 * 1000;

    if (!this._widget.config.selectedMetrics.length) {
      this.data = [];
      return;
    }

    const prometheusMetrics = this.CONFIGURATION.APIURL + 'prometheus/value';

    const payload = {
      param: { metrics: this._widget.config.selectedMetrics },
      timestamp: {
        from: timedate.from.getTime() - diff,
        to: timedate.to.getTime() - diff
      },
    };
    
    this.$http.post(prometheusMetrics, payload).then((resp) => {
      if (resp && resp.status && resp.status === 200) {
        this.updateChartData(resp.data);
      } else {
        this.log.error('Prometheus widget', 'fail to get data');
      }
    }).catch((err) => {
      this.log.error('Prometheus widget', err);
    });
  };

  updateChartData(newData) {
    this.data = [];

    newData.forEach((metric) => {
      this.data.push({
        classed: 'dashed',
        key: metric.name,
        strokeWidth: 2,
        values: metric.values,
      });
    });
  }

  createListeners() {
    const self = this;
    this.timeChangeListener = this.EventBus.subscribe(this.EVENTS.TIME_CHANGE, function() {
      self.updateMetricDatabase();
    });
  }

  delete() {
    this.onDelete({uuid: this._widget.uuid});
  }

  update(widget) {
    this._widget = widget;
    this.onUpdate({uuid: this._widget.uuid, widget});
    this.updateMetricDatabase();
  }

  openSettings() {
    this.$uibModal.open({
      component: 'prometheuschartWidgetSettings',
      resolve: {
        widget: () => {
          return this._widget;
        },
      },
    }).result.then((widget) => {
      this.update(widget);
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error(['prometheuschartWidgetSettings', 'settings'], error);
      }
    });
  }
}
