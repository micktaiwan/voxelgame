'use strict';

angular.module('gameApp')
    .controller('GameCtrl', function($scope, $timeout, $location, Db, Game) {

        var user = Db.getUser();
        if(!user) {
            $location.path("/");
            return;
        }

        function updatePlayer(id, obj) {
            another.move(obj.pos, obj.rot);
        };

        Db.getUsers(function(players) {
            $scope.players = []; // we reinitialize all users
            for (var i in players) {
                if(!players[i].pos) players[i].pos = {x:0, y:0, z: 0};
                if(!players[i].rot) players[i].rot = {corps:0, tete:0};
                $scope.players.push(Db.newPlayer(i, players[i].name, players[i].pos, players[i].rot, updatePlayer));
            }
            console.log($scope.players.length + ' players');
        });

        var p = Game.addMainPlayer("main", user.pos);
        Game.init(p);
        var another = Game.addPNJ("second", { x: -100, y: 20, z:0}, { x: 0, y: 0, z:0});
        Game.animate();

        $('#instructions').click(function() {
            enablePointerLock();
        });
    });
