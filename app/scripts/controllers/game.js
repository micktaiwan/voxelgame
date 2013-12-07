'use strict';

angular.module('gameApp')
        .controller('GameCtrl', function($scope, $timeout, Db, Game) {

            //Db.init();
            //$scope.game = Game;

            // TODO: get current logged player from DB
            var p = Game.addMainPlayer("main", 0,0,0, 0);
            Game.init(p);
            var another = Game.addPNJ("second", 0,0,0, 0);
            Game.animate();

            function updatePlayers() {
            	another.move({ x: another.corps.position.x+1, y: another.corps.position.y, z:another.corps.position.z}, {x:0, y:0, z:0});
            };

			function updateLater() {
				$timeout(function() {
					updatePlayers();
					updateLater(); // schedule another update
					}, 1000);
			};
			updateLater();
            $('#instructions').click(function() {
                enablePointerLock();
            });
        });
