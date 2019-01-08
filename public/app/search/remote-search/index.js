import angular from 'angular';
import component from './remote-search.component';

export default angular.module('remoteSearch', [])
  .config(function($stateProvider, $urlMatcherFactoryProvider, ROUTER, REMOTE, TIME) {
    'ngInject';
    
    $urlMatcherFactoryProvider.type('SlashFix', {
          raw: true,
    });                            

    $stateProvider.state(ROUTER.REMOTE.NAME, {
      url: ROUTER.REMOTE.PATH + '/:protoID/{limit:int}/{from:int}/{to:int}/{server}/{search:SlashFix}/{custom}/{timezone:json}',
      params: {
        protoID: REMOTE.PROTO.ID,
        to: TIME.TO,
        from: TIME.FROM,
        custom: TIME.LABEL,
        timezone: TIME.TIMEZONE,
        limit: REMOTE.LIMIT,
        search: REMOTE.QUERY.DEFAULT,
        server: REMOTE.SERVER.DEFAULT
      },
      component: 'remoteSearch',
    });
    
  })
  .component('remoteSearch', component);
