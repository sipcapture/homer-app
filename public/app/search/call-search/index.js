import angular from 'angular';
import component from './call-search.component';

export default angular.module('callSearch', [])
  .config(function($stateProvider, ROUTER, SEARCH) {
    'ngInject';

    $stateProvider.state(ROUTER.SEARCH.NAME, {
      url: ROUTER.SEARCH.PATH + '/:protoID/{limit:int}/{from:int}/{to:int}/{timezone:json}/{search:json}/{transaction:json}',
      params: {
        to: SEARCH.TO,
        from: SEARCH.FROM,
        timezone: SEARCH.TIMEZONE,
        limit: SEARCH.LIMIT,
        search: SEARCH.QUERY.DEFAULT,
        transaction: SEARCH.TRANSACTION.DEFAULT
      },
      component: 'callSearch',
    });
  })
  .component('callSearch', component);
