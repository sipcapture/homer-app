import angular from 'angular';
import JsonEditor from './json-editor';
import PwCheck from './pw-check';
import AutoFillSync from './auto-fill-sync';

export default angular.module('hepicApp.directives', [
  JsonEditor.name,
  PwCheck.name,
  AutoFillSync.name
]);
