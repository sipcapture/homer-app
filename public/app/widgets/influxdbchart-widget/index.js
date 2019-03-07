import angular from 'angular';
import widget from './widget/influxdbchart-widget.component';
import settings from './settings/influxdbchart-widget-settings.component';

export default angular.module('hepicApp.influxdbchartWidget', [])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('visualize', 'influxdbchart-widget', {
      title: 'InfluxDB Chart',
      group: 'Charts',
      name: 'influxdbchart',
      description: 'Display InfluxDB Metrics',
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
  .component('influxdbchartWidgetSettings', settings)
  .component('influxdbchartWidget', widget);
