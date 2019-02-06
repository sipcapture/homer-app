import angular from 'angular';
import widget from './widget/prometheuschart-widget.component';
import settings from './settings/prometheuschart-widget-settings.component';

export default angular.module('hepicApp.prometheuschartWidget', [])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('visualize', 'prometheuschart-widget', {
      title: 'Prometheus Chart',
      group: 'Tools',
      name: 'prometheuschart',
      description: 'Display Prometheus Metrics',
      refresh: true,
      sizeX: 1,
      sizeY: 1,
      config: {
        title: 'HEPIC Chart',
        chart: {},
        dataquery: {},
        panel: {
          queries: [],
        },
      },
      edit: {},
      api: {},
    });
  }])
  .component('prometheuschartWidgetSettings', settings)
  .component('prometheuschartWidget', widget);
