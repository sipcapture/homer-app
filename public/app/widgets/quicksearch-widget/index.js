import angular from 'angular';
import component from './quicksearch-widget.component';

export default angular.module('hepicApp.quicksearchWidget', [])
  .config(['dashboardWidgetStateProvider', function(dashboardWidgetStateProvider) {
    dashboardWidgetStateProvider.set('visualize', 'quicksearch-widget', {
      title: 'Search',
      group: 'Search',
      name: 'quicksearch',
      description: 'Display Search Form component',
      refresh: false,
      sizeX: 1,
      sizeY: 1,
      config: {
        title: 'QuickSearch',
        searchbutton: true
      }
    });
  }])
  .component('quicksearchWidget', component);
