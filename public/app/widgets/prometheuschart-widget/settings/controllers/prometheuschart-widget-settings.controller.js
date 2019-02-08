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
    this.metrics = [];
    this.stringSettings = {
      template: '{{option}}', smartButtonTextConverter(skip, option) {
        return option;
      },
      scrollableHeight: '300px',
      buttonDefaultText: 'Select Metrics',
      scrollable: true,
      enableSearch: true,
      showSelectAll: true,
      keyboardControls: true,
    };
  }

  $onInit() {
    this.widget = this.resolve.widget;
    this.getMetrics();
  }

  toggleSelection(metricName) {
    var idx = this.widget.config.selectedMetrics.indexOf(metricName);

    if (idx > -1) {
      this.widget.config.selectedMetrics.splice(idx, 1);
    } else {
      this.widget.config.selectedMetrics.push(metricName);
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
    this.modalInstance.close(this.widget);
  }
}
