import angular from 'angular';
import component from './clock-widget.component';

// to-do: refactor into two separate components: widget and settings modal

export default angular.module('hepicApp.clockWidget', [])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('visualize', 'clock-widget', {
      title: 'World Clock',
      group: 'Tools',
      name: 'clock',
      description: 'Display date and time',
      sizeX: 1,
      sizeY: 1,
      refresh: false,
      config: {
        title: 'World Clock',
        timePattern: 'HH:mm:ss',
        datePattern: 'YYYY-MM-DD',
        location: 'Europe/Amsterdam',
        showseconds: false
      }
    });
  }])
  .component('clockWidget', component);
