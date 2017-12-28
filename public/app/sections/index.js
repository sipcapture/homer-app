import angular from 'angular';
import FooterBar from './footer-bar';
import HeaderNavbar from './header-navbar';

export default angular.module('hepicApp.sections', [
  FooterBar.name,
  HeaderNavbar.name
]);
