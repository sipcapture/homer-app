import angular from 'angular';
import Directives from './directives';
import component from './widget/quicksearch-widget.component';
import settings from './settings/quicksearch-widget-settings.component';

// to-do: refactor into two separate components: widget and settings modal

export default angular.module('hepicApp.quicksearchWidget', [
  Directives.name,
])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('visualize', 'quicksearch-widget', {
      title: 'Search',
      group: 'Search',
      name: 'quicksearch',
      description: 'Display Search Form component',
      refresh: false,
      sizeX: 1,
      sizeY: 1,
      config: {
        title: 'QuickSearch',
        searchbutton: true,
      },
    });
  }])
  .component('quicksearchWidgetSettings', settings)
  .component('quicksearchWidget', component);
