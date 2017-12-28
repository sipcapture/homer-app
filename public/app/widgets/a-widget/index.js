import angular from 'angular';
import component from './a-widget.component';

export default angular.module('hepicApp.aWidget', [])
  /* Uncomment all the following lines to make this widget available for dashboars. 
   * Make sure the widget is present in dashboard HTML template.
   * */
  //.config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
  //  DashboardWidgetStateProvider.set('visualize', 'a-widget', {
  //    title: 'A widget',
  //    group: 'tools',
  //    name: 'awidget',
  //    description: 'This is example of widget',
  //    sizeX: 1,
  //    sizeY: 1
  //  });
  //}])
  .component('aWidget', component);
