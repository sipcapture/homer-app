import angular from 'angular';
import JsonEditor from './json-editor';
import PwCheck from './pw-check';

export default angular.module('hepicApp.directives', [
  JsonEditor.name,
  PwCheck.name,
]);
