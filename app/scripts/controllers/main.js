'use strict';

angular.module('gameApp')
  .controller('MainCtrl', function($scope, Db, Game) {

    Db.init();
    $scope.game = Game;
    Game.init();
    Game.animate();

  })

  ;
