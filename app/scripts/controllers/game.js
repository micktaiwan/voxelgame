'use strict';

angular.module('gameApp')
    .controller('GameCtrl', function($scope, $timeout, $location, Db, Game) {

        var user = Db.getUser();
        if(!user) {
            $location.path("/");
            return;
        }

        var pnjs = [];

        function getPNJById(id) {
          var rv = null;
          pnjs.some(function(s) {
            if(s.id==id) { rv = s; return; }
          });
          return rv;
        }

        function updatePlayer(id, obj) {
            var p = getPNJById(id)
            if(p) p.move(obj.pos, obj.rot);
        };

        Db.getUsers(function(players) {
            var p = Game.addMainPlayer(user.name, user.pos);
            Game.init(p);
            $scope.players = []; // we reinitialize all users
            for (var i in players) {
                if(!players[i].pos) players[i].pos = {x:0, y:0, z: 0};
                if(!players[i].rot) players[i].rot = {corps:0, tete:0};
                var p = Db.newPlayer(i, players[i].name, players[i].pos, players[i].rot, updatePlayer);
                $scope.players.push(p);
                pnjs << Game.addPNJ(p.id, p.name, p.pos, p.rot);
            }
            console.log($scope.players.length + ' players');

            Game.animate();

            $('#instructions').click(function() {
                enablePointerLock();
            });
        });
    });
