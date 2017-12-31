import app from './app.module';

app.config(function ($urlRouterProvider, ROUTER) {
  'ngInject';
  $urlRouterProvider.otherwise(ROUTER.HOME.PATH);
});

export default app;
