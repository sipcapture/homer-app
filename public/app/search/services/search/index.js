import angular from 'angular';
import Search from './search.service';

export default angular.module('hepicApp.login.search.service', []).factory(Search.name, Search);
