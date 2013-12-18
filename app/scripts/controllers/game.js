'use strict';

angular.module('gameApp')
    .controller('GameCtrl', function($rootScope, $scope, $timeout, $location, Db, Game, Session, MainPlayer) {

        var user = Session.getUser();
        if (!user) {
            $location.path("/");
            return;
        }

        $scope.showInventory = false;
        $scope.showConsole = false;
        $scope.msgs = [];

        $timeout(function() {
            Game.addMessage({
                text: "Welcome !",
                type: 'system',
                delay: 4
            });
        }, 4 * 1000);

        $timeout(function() {
            Game.addMessage({
                text: "La position des autres joueurs n'est pas mise à jour en temps réel. C'est normal pour l'instant. Ce n'est pas du lag :)",
                type: 'system',
                delay: 7
            });
        }, 6 * 1000);
        function getPNJById(id) {
            var rv = null;
            pnjs.some(function(s) {
                if (s.id == id) {
                    rv = s;
                    return;
                }
            });
            return rv;
        }

        function updatePNJ(id, obj) {
            var p = getPNJById(id)
            if (!p) return;
            p.move(obj.pos, obj.rot);
            var isOnline = (obj.connections != null);
            if (p.onlinePresence != isOnline)
                Game.addMessage({
                    text: p.name + " is now " + (isOnline ? "online" : "offline"),
                    delay: 10,
                    type: (isOnline ? "info" : "error")
                });
            p.updateOnlinePresence(isOnline);

            //else console.log('player '+id+' not found')
            // when Db.newPlayer is called the callback is called but the pnj does not exists yet...
        };

        function updatePlayer(obj) {
            $scope.pos = obj.pos;
        };

        function toggleInventory(inventory) {
            if (inventory)
                $scope.inventory = inventory;
            $scope.showInventory = !$scope.showInventory;
        }

        $scope.selectInventory = function(obj) {
            if ($scope.selectedInventoryObject == obj.id)
                $scope.selectedInventoryObject = null;
            else
                $scope.selectedInventoryObject = obj.id;
            //$scope.showInventory = false;
        }

        function consummeMessage(delay) {
            delay = delay ? delay * 1000 : 4000;
            $timeout(function() {
                $scope.msgs.splice(0, 1);
                if ($scope.msgs.length == 0)
                    $scope.showConsole = false;
                else
                    consummeMessage($scope.msgs[0].delay);
            }, delay);
        }

        function addMessage(msg) {
            console.log(msg);
            $scope.msgs.push(msg);
            $scope.showConsole = true;
            if ($scope.msgs.length == 1)
                consummeMessage(msg.delay);
        }

        var already_initialized = Game.init(addMessage);
        if (!already_initialized) {
            Game.addMainPlayer(MainPlayer.newPlayer(user.id, user.name, user.pos, updatePlayer, toggleInventory));
            var u = $rootScope.users;
            var pnjs = [];
            for (var i in u) {
                if (u[i].id != user.id) {
                    // FIXME: il ne devrait pas y avoir deux méthodes, ne pour la Db et l'autre pour le game... non ????
                    var p = Db.newPlayer(u[i].id, u[i].name, u[i].pos, u[i].rot, updatePNJ);
                    var gp = Game.addPNJ(p);
                    gp.updateOnlinePresence(p.connections != null);
                    pnjs.push(gp);
                }
            }
            console.log(pnjs.length + ' pnjs');
        } else
            console.log('Game was already initialized');

        $('#instructions').click(function() {
            enablePointerLock();
        });

        /*        Db.getUsers(function(players) {
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
        });
*/

    });
