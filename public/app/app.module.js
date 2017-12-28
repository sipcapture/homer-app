// npm modules
import 'jquery';
import angular from 'angular';
import '@uirouter/angularjs';
import 'angular-ui-bootstrap';
import 'angular-aria';
import 'angular-animate';
import 'angular-gridster';
import 'angular-ui-grid';
import 'angular-cookies';
import 'angular-sanitize';
import 'ui-select';
import 'angular-dialog-service';
import 'angular-local-storage';
import 'angular-smart-table';
import 'angular-nvd3';
import 'ui-leaflet';
import 'angular-simple-logger';
import 'angular-ui-ace';
import 'angular-websocket';
import 'ng-fittext';
import 'angular-translate';
import 'angular-translate-loader-url';
import 'angular-visjs';
import 'angular-file-upload/angular-file-upload';
import 'wavesurfer.js';
import 'angular-sweetalert/SweetAlert';
import 'ngstorage';

// static libs
import '../lib/angular-third/wavesurfer-angular';
import '../lib/angular-third/inputDropdown';

// homer. To-do: refactor homer old code.
import './homer/homerModal';
import './homer/homerCflow';

import Constants from './constants';
import Sections from './sections';
import Login from './login';
import Dashboards from './dashboards';
import Widgets from './widgets';
import Search from './search';

// services
import Storage from './services/demo.storage.service';
import routeResolver from './services/routeResolver';
import dashboardResolver from './services/dashboardResolver';
//import sessionRecovererFactory from './services/sessionRecoverer';
import eventFactory from './services/eventbus';
//import authFactory from './services/authService';
import profileFactory from './services/user-profile.service';
import adminFactory from './services/adminService';
import searchFactory from './services/searchService';
import elasticFactory from './services/elasticService';
import storeFactory from './services/store.service';
import settingsFactory from './services/settingsService';
import messagesFactory from './services/messagesService';

// filters
import appMessageSearchFilter from './filters/hepicMessageSearch.js';
import appFilter from './filters/hepicObject2Array.js';
import appPropsFilter from './filters/hepicPropsFilter.js';
import appTSFilter from './filters/hepicUnixts.js';

// directives
import appDynamicCtrDirective from './directives/appDynamicCtrl.js';
import hepicafterRenderDirective from './directives/hepicAfterRender.js';
import hepicSwitchDirective from './directives/hepicBootstrapSwitch.js';
import hepicDraggableDirective from './directives/hepicDraggable.js';
import elementSize from './directives/hepicElementSize.js';
import hepicModalDirective from './directives/hepicModal.js';
import hepicPrismDirective from './directives/hepicNagPrism.js';
import hepicpwCheckDirective from './directives/hepicPwCheck.js';
import hepicResizeDirective from './directives/hepicResize.js';
import appWidgetTemplateDirective from './directives/staticInclude.js';
import fieldDisplay from './directives/field-display/field-display.directive';

// controllers
import HepicController from './controllers/hepic.controller';
import LoginController from './controllers/loginController.js';
import customWidgetCtrl from './controllers/customWidgetController.js';
import dashframeController from './controllers/dashframeController.js';
import DatepickerController from './controllers/datepickerController.js';
import DrawCtrlController from './controllers/drawCtrlController.js';
//import EditDashboardController from './controllers/editDashboardController.js';
import HomeController from './controllers/homeController.js';
import MessageCtrlController from './controllers/messageCtrlController.js';
import MessengerController from './controllers/messengerController.js';
import NewDashboardController from './controllers/newDashboardController.js';
//import NewWidgetDashboardController from './controllers/newWidgetDashboardController.js';
import PanelController from './controllers/panel.controller.js';
import PlayStreamCtrlController from './controllers/playStreamCtrlController.js';
import SettingsNavController from './controllers/settingsNavController.js';
import TimeRangeDialogController from './controllers/timeRangeDialogController.js';
import WidgetSettingsCtrl from './controllers/widgetSettingsController.js';
import CallSearchController from './controllers/search/searchcallController.js';
import SearchProtoController from './controllers/search/searchprotoController.js';
import RegistrationSearchController from './controllers/search/searchregistrationController.js';
import SettingsAdminAccountsController from './controllers/settings/admin/accountsController.js';
import SettingsAdminAccountsEditController from './controllers/settings/admin/adminAccountsEditController.js';
import SettingsAdminAlarmProfileEditController from './controllers/settings/admin/adminAlarmProfileEditController.js';
import SettingsAdminAlarmRecordEditController from './controllers/settings/admin/adminAlarmRecordEditController.js';
import SettingsAdminAliasesEditController from './controllers/settings/admin/adminAliasesEditController.js';
import SettingsAdminCaptagentEditController from './controllers/settings/admin/adminCaptagentEditController.js';
import SettingsAdminGroupIPEditController from './controllers/settings/admin/adminGroupIPEditController.js';
import SettingsAdminInterceptionEditController from './controllers/settings/admin/adminInterceptionEditController.js';
import SettingsAdminAlarmProfileController from './controllers/settings/admin/alarmprofileController.js';
import SettingsAdminAlarmRecordController from './controllers/settings/admin/alarmrecordController.js';
import SettingsAdminAliasesController from './controllers/settings/admin/aliasesController.js';
import SettingsAdminCaptagentController from './controllers/settings/admin/captagentController.js';
import SettingsGlobalAdminController from './controllers/settings/admin/globalController.js';
import SettingsAdminGroupIPController from './controllers/settings/admin/groupipController.js';
import SettingsAdminInterceptionController from './controllers/settings/admin/interceptionController.js';
import SettingsAdminNCScriptController from './controllers/settings/admin/ncscriptController.js';
import SettingsAdminSystemController from './controllers/settings/admin/systemController.js';
import SettingsAdminTCScriptController from './controllers/settings/admin/tcscriptController.js';
import SettingsAboutController from './controllers/settings/profile/aboutController.js';
import SettingsDashboardController from './controllers/settings/profile/dashboardController.js';
import SettingsTestController from './controllers/settings/profile/testController.js';
import SettingsUserController from './controllers/settings/profile/userController.js';
import TransactionCallCtrlController from './controllers/transaction/transactionCallController.js';
import TransactionProtoCtrlController from './controllers/transaction/transactionProtoController.js';
import TransactionRegistrationCtrlController from './controllers/transaction/transactionRegistrationController.js';

// register modules
var app = angular.module('hepicApp', [
  'ui.router',
  'ui.bootstrap',
  'gridster',
  'wavesurfer.angular',
  'ui.grid',
  'ui.grid.resizeColumns',
  'ui.grid.autoResize',
  'ui.grid.pagination',
  'ui.grid.selection',
  'ui.grid.saveState',
  'ui.grid.cellNav',
  'ui.grid.moveColumns',
  'ui.grid.pinning',
  'ui.grid.grouping',
  'ui.grid.exporter',
  'oitozero.ngSweetAlert',
  'ngAnimate',
  'ngAria',
  'ngCookies',
  'ui.select',
  'inputDropdown',
  'ngSanitize',
  'ngStorage',
  'dialogs.main',
  'LocalStorageModule',
  'homer.modal',
  'homer.cflow',
  'smart-table',
  'nvd3',
  'nemLogging',
  'ui-leaflet',
  'ui.ace',
  'ngWebSocket',
  'ngFitText',
  'pascalprecht.translate',
  'ngVis',
  'angularFileUpload',
  'ds.clock',
  Constants.name,
  Sections.name,
  Login.name,
  Dashboards.name,
  Search.name,
  Widgets.name
])
  .factory('StorageService', () => new Storage())
  .controller('hepicController', HepicController)
  .controller('loginController', LoginController)
  .controller('CustomWidgetCtrl', customWidgetCtrl)
  .controller('datepickerController', DatepickerController)
  .controller('drawCtrl', DrawCtrlController)
  //.controller('editBoardDialogCtrl', EditDashboardController)
  .controller('dashframeController', dashframeController)
  .controller('HomeController', HomeController)
  .controller('messageCtrl', MessageCtrlController)
  .controller('messengerController', MessengerController)
  .controller('newDashboardCtrl', NewDashboardController)
  //.controller('newWidgetDialogCtrl', NewWidgetDashboardController)
  .controller('panelController', PanelController)
  .controller('playStreamCtrl', PlayStreamCtrlController)
  .controller('settingsNavController', SettingsNavController)
  .controller('timerangeDialogCtrl', TimeRangeDialogController)
  .controller('WidgetSettingsCtrl', WidgetSettingsCtrl)
  .controller('searchcallController', CallSearchController)
  .controller('searchprotoController', SearchProtoController)
  .controller('searchregistrationController', RegistrationSearchController)
  .controller('SettingsAdminaccountsController', SettingsAdminAccountsController)
  .controller('SettingsAdminAccountsEditController', SettingsAdminAccountsEditController)
  .controller('SettingsAdminAlarmProfileEditController', SettingsAdminAlarmProfileEditController)
  .controller('SettingsAdminAlarmRecordEditController', SettingsAdminAlarmRecordEditController)
  .controller('SettingsAdminAliasesEditController', SettingsAdminAliasesEditController)
  .controller('SettingsAdminCaptagentEditController', SettingsAdminCaptagentEditController)
  .controller('SettingsAdminGroupIPEditController', SettingsAdminGroupIPEditController)
  .controller('SettingsAdminInterceptionEditController', SettingsAdminInterceptionEditController)
  .controller('SettingsAdminalarmprofileController', SettingsAdminAlarmProfileController)
  .controller('SettingsAdminalarmrecordController', SettingsAdminAlarmRecordController)
  .controller('SettingsAdminaliasesController', SettingsAdminAliasesController)
  .controller('SettingsAdmincaptagentController', SettingsAdminCaptagentController)
  .controller('SettingsAdminglobalController', SettingsGlobalAdminController)
  .controller('SettingsAdmingroupipController', SettingsAdminGroupIPController)
  .controller('SettingsAdmininterceptionController', SettingsAdminInterceptionController)
  .controller('SettingsAdminncscriptController', SettingsAdminNCScriptController)
  .controller('SettingsAdminsystemController', SettingsAdminSystemController)
  .controller('SettingsAdmintcscriptController', SettingsAdminTCScriptController)
  .controller('SettingsProfileaboutController', SettingsAboutController)
  .controller('SettingsProfiledashboardController', SettingsDashboardController)
  .controller('SettingsProfiletestController', SettingsTestController)
  .controller('SettingsProfileuserController', SettingsUserController)
  .controller('transactionCallCtrl', TransactionCallCtrlController)
  .controller('transactionProtoCtrl', TransactionProtoCtrlController)
  .controller('transactionRegistrationCtrl', TransactionRegistrationCtrlController)
  .provider('routeResolver', routeResolver)
  .service('dashboardResolver', dashboardResolver)
  //.provider('dashboardResolver', dashboardResolver)
  //.factory('sessionRecoverer', sessionRecovererFactory)
  .factory('eventbus', eventFactory)
  //.factory('authService', authFactory)
  .factory('userProfile', profileFactory)
  .factory('adminService', adminFactory)
  .factory('searchService', searchFactory)
  .factory('elasticService', elasticFactory)
  .factory('storeService', storeFactory)
  .factory('settingsService', settingsFactory)
  .factory('messagesService', messagesFactory)
  .filter('messageSearch', appMessageSearchFilter)
  .filter('object2Array', appFilter)
  .filter('propsFilter', appPropsFilter)
  .filter('unixts', appTSFilter)
  .directive('fieldDisplay', fieldDisplay)
  .directive('dynamicCtrl', appDynamicCtrDirective)
  .directive('afterRender', hepicafterRenderDirective)
  .directive('bootstrapSwitch', hepicSwitchDirective)
  .directive('draggable', hepicDraggableDirective)
  .directive('elementSize', elementSize)
  .directive('modal', hepicModalDirective)
  .directive('nagPrism', hepicPrismDirective)
  .directive('pwCheck', hepicpwCheckDirective)
  .directive('resize', hepicResizeDirective)
  .directive('staticInclude', appWidgetTemplateDirective);

Date.prototype.stdTimezoneOffset = function() {
  var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function() {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

export default app;
