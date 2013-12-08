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
            else console.log('player '+id+' not found')
        };

        Db.getUsers(function(players) {
            var p = Game.addMainPlayer(user.name, user.pos);
            Game.init(p);
            $scope.players = [];
            for (var i in players) {
                if(!players[i].pos) players[i].pos = {x:0, y:0, z: 0};
                if(!players[i].rot) players[i].rot = {corps:0, tete:0};
                //$scope.players.push(p);
                if(i != user.id) {
                    var p = Db.newPlayer(i, players[i].name, players[i].pos, players[i].rot, updatePlayer);
                    pnjs.push(Game.addPNJ(p.id, p.name, p.pos, p.rot));
                }
            }
            console.log(pnjs.length + ' pnjs');

            Game.animate();

            $('#instructions').click(function() {
                enablePointerLock();
            });
        });
    });
