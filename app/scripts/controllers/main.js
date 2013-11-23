'use strict';

angular.module('gameApp')
  .controller('MainCtrl', function($scope, Db) {
    
    Db.init();

  })

  ;
