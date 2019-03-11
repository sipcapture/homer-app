import angular from 'angular';
import widget from './widget/promchart-widget.component';
import settings from './settings/promchart-widget-settings.component';

export default angular.module('hepicApp.promchartWidget', [])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('visualize', 'promchart-widget', {
      title: 'Prometheus Chart',
      group: 'Charts',
      name: 'promchart',
      description: 'Display Prometheus Metrics 2.0',
      refresh: true,
      
      sizeX: 1,
      sizeY: 1,
      config: {
        title: 'HEPIC PROM Chart',
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
  .component('promchartWidgetSettings', settings)
  .component('promchartWidget', widget);
