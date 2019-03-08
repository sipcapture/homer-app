import angular from 'angular';
import component from './call-search.component';

export default angular.module('callSearch', [])
  .config(function($stateProvider, ROUTER, SEARCH, TIME) {
    'ngInject';

    $stateProvider.state(ROUTER.SEARCH.NAME, {
      url: ROUTER.SEARCH.PATH + '/:protoID/{limit:int}/{from:int}/{to:int}/{custom}/{timezone:json}/{search:json}/{transaction:json}',
      params: {
        protoID: SEARCH.PROTO.ID,
        to: TIME.TO,
        from: TIME.FROM,
        custom: TIME.LABEL,
        timezone: TIME.TIMEZONE,
        limit: SEARCH.LIMIT,
        search: SEARCH.QUERY.DEFAULT,
        transaction: SEARCH.TRANSACTION.DEFAULT,
      },
      component: 'callSearch',
    });
  })
  .component('callSearch', component);
