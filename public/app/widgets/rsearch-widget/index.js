import angular from 'angular';
import widget from './widget/rsearch-widget.component';
import settings from './settings/rsearch-widget-settings.component';

export default angular.module('hepicApp.rsearchWidget', [])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('visualize', 'rsearch-widget', {
      title: 'Remote Search',
      group: 'Tools',
      name: 'rsearch',
      description: 'Display date and time',
      sizeX: 1,
      sizeY: 1,
      refresh: false,
      config: {
        title: 'Remote Search',
        timePattern: 'HH:mm:ss',
        datePattern: 'YYYY-MM-DD',
        location: {
          value: -60,
          offset: '+1',
          name: 'GMT+1 CET',
          desc: 'Central European Time',
        },
        showseconds: false,
      },
    });
  }])
  .component('rsearchWidgetSettings', settings)
  .component('rsearchWidget', widget);
