import angular from 'angular';
import Directives from './directives';
import component from './widget/protosearch-widget.component';
import settings from './settings/protosearch-widget-settings.component';

// to-do: refactor into two separate components: widget and settings modal

export default angular.module('hepicApp.protosearchWidget', [
  Directives.name,
])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('search', 'protosearch-widget', {
      title: 'Proto Search',
      group: 'Search',
      name: 'protosearch',
      description: 'Display Protocol Search Form',
      refresh: false,
      sizeX: 1,
      sizeY: 1,
      config: {
        title: 'ProtoSearch',
        searchbutton: true,
      },
    });
  }])
  .component('protosearchWidgetSettings', settings)
  .component('protosearchWidget', component);
