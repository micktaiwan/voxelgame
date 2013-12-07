'use strict';

angular.module('gameApp')
        .controller('GameCtrl', function($scope, Db, Game) {

            //Db.init();
            //$scope.game = Game;

            // TODO: get current logged player from DB
            var p = Game.addPlayer("main", 0,0,0, 0);
            Game.init(p);
            Game.addPlayer("second", 0,0,0, 0);
            Game.animate();

            $('#instructions').click(function() {
                enablePointerLock();
            });
        });
