'use strict';

angular.module('gameApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'gameApp.services.db',
    'gameApp.services.session',
    'gameApp.services.game'
])
        .config(function($routeProvider) {
            $routeProvider
                    .when('/', {
                        templateUrl: 'views/main.html',
                        controller: 'MainCtrl'
                    })
                    .when('/game', {
                        templateUrl: 'views/game.html',
                        controller: 'GameCtrl'
                    })
                    .when('/users', {
                        templateUrl: 'views/users.html',
                        controller: 'UsersCtrl'
                    })
                    .when('/about', {
                        templateUrl: 'views/about.html'
                    })
                    .otherwise({
                        redirectTo: '/'
                    });
        });