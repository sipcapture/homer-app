import angular from 'angular';
import FooterBar from './footer-bar';
import HeaderNavbar from './header-navbar';
import MainContent from './main-content';

export default angular.module('hepicApp.sections', [
  FooterBar.name,
  HeaderNavbar.name,
  MainContent.name
]);
