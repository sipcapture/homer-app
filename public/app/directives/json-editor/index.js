import angular from 'angular';
import JsonEditor from './json-editor.directive';

export default angular.module('hepicApp.directives.json-editor', []).directive('jsonEditor', /* @ngInject */ () => new JsonEditor());
