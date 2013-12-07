'use strict';

angular.module('gameApp')
        .controller('GameCtrl', function($scope, Db, Game) {

            //Db.init();
            //$scope.game = Game;

            // TODO: get current logged player from DB
            p = Game.addPlayer("joueur", 0,0,0, 0);
            Game.init(p);
            Game.animate();

            $('#instructions').click(function() {
                enablePointerLock();
            });
        });
