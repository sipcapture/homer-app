import '../style/prometheuschart-widget.settings.css';

export default class prometheuschartWidgetSettings {
  constructor($scope, $http, UserProfile, HEPICSOURCES, CONFIGURATION, EventBus, EVENTS, log) {
    'ngInject';
    this.$scope = $scope;
    this.$http = $http;
    this.UserProfile = UserProfile;
    this.CONFIGURATION = CONFIGURATION;
    this.EventBus = EventBus;
    this.EVENTS = EVENTS;
    this.log = log;
    this.log.initLocation('prometheuschartWidgetSettings');
    this.config = {
      selectedMetrics: [],
      maxChartLength: 10,
    };
    this.metrics = [];
  }

  $onInit() {
    this.config = this.resolve.config;
    this.getMetrics();
  }

  toggleSelection(metricName) {
    var idx = this.config.selectedMetrics.indexOf(metricName);

    if (idx > -1) {
      this.config.selectedMetrics.splice(idx, 1);
    } else {
      this.config.selectedMetrics.push(metricName);
    }
  };

  getMetrics() {
    const urlMetrics = this.CONFIGURATION.APIURL + 'prometheus/label';

    this.$http.get(urlMetrics).then((resp) => {
      if (resp && resp.status && resp.status === 200) {
        this.metrics = resp.data;
        // this.log.debug('popuplate metric database', this.metricdatabases);
      } else {
        this.log.error('Prometheus Chart Settings', 'fail to get data');
      }
    }).catch((err) => {
      this.log.error('Prometheus Chart Settings', err);
    });
  }

  dismiss() { // cancel setting update
    this.modalInstance.dismiss();
  }

  submit() { // submit settings update
    this.modalInstance.close(this.config);
  }
}
