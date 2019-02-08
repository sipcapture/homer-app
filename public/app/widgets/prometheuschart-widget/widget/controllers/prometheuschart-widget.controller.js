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
    this.config = {
      selectedMetrics: [],
      maxChartLength: 10,
    };
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
            return new Date(d).toLocaleTimeString();
          },
        },
        yAxis: {
          axisLabel: this.config.metric,
          tickFormat: function(d) {
            return d3.format('.02f')(d);
          },
          axisLabelDistance: 10,
        },
        callback: function(chart) {
          console.log('!!! lineChart callback !!!');
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
    const { from, to, custom } = this.TimeMachine.getTimerangeUnix();

    if (!this.config.selectedMetrics.length) {
      this.data = [];
      return;
    }

    const prometheusMetrics = this.CONFIGURATION.APIURL + 'prometheus/value';

    const payload = {
      metrics: this.config.selectedMetrics,
      datetime: {
        from,
        to,
        custom
      }
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
    this.data = newData;
  }

  createListeners() {
    const self = this;
    this.timeChangeListener = this.EventBus.subscribe(this.EVENTS.TIME_CHANGE, function() {
      self.updateMetricDatabase();
    });
  }

  destroyEventListeners() {
    this.EventBus.off(this.EVENTS.TIME_CHANGE, this.timeChangeListener);
  }

  $onDestroy() {
    this.destroyEventListeners();
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
        config: () => {
          return this.config;
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
