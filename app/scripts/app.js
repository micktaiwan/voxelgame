'use strict';

angular.module('gameApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'gameApp.services.db'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
