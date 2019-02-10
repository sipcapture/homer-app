import angular from 'angular';
import widget from './widget/html-widget.component';
import settings from './settings/html-widget-settings.component';

export default angular.module('hepicApp.htmlWidget', [])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('visualize', 'html-widget', {
      title: 'HTML Widget',
      group: 'Tools',
      name: 'html',
      description: 'Display HTML inline',
      sizeX: 1,
      sizeY: 1,
      refresh: false,
      config: {
        title: 'HTML Widget',
	content: '<p>No Content</p>'
      },
    });
  }])
  .component('htmlWidgetSettings', settings)
  .component('htmlWidget', widget);
