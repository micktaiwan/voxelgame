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
        var player = null;
        var already_initialized = Game.init(addMessage);
        if (!already_initialized) {
            player = MainPlayer.newPlayer(user, {
                playerUpdateCallback: updatePlayer,
                toggleInventoryCallback: toggleInventory,
                updateInventoryCallback: updateInventory,
                updateRobots: updateRobots,
            });
            Game.addMainPlayer(player);
            var u = $rootScope.users;
            var pnjs = [];
            for (var i in u) {
                if (u[i].id != user.id) {
                    // FIXME: il ne devrait pas y avoir deux méthodes, ne pour la Db et l'autre pour le game... non ????
                    var p = Db.newPlayer(u[i], updatePNJ); // p.connections is always false here
                    var gp = Game.addPNJ(p);
                    gp.updateOnlinePresence(false);
                    pnjs.push(gp);
                }
            }
            console.log(pnjs.length + ' pnjs');
        } else {
            console.log('Game was already initialized');
            player = Game.getMainPlayer();
            updateRobots(player.robots);
            updateInventory(player.dbUser.inventory);
        }

        $('#instructions').click(function() {
            enablePointerLock();
        });

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

        // to update robots positions, we fake a scope udpate
        // TODO: bwaaaaah, not pretty

        function dummyUpdate() {
            $scope.dummy = 1;
            $timeout(function() {
                dummyUpdate();
            }, 1 * 1000);

        }
        dummyUpdate();

        $scope.createRobot = function() {
            player.createRobot();
        }

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

        // TODO: update players robots

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
        }

        function updatePlayer(obj) {
            $scope.pos = obj.pos;
        }

        function toggleInventory() {
            $scope.showInventory = !$scope.showInventory;
            console.log('toggle ' + $scope.showInventory);
        }

        function updateInventory(inventory, selected) {
            console.log('update');
            $scope.inventory = inventory;
            $scope.selectedInventoryObject = selected;
        }

        function updateRobots(robots) {
            $scope.robots = robots;
        }

        $scope.selectInventory = function(obj) {
            if ($scope.selectedInventoryObject == obj.id) {
                $scope.selectedInventoryObject = null;
                player.setSelectedObject(null);
            } else {
                $scope.selectedInventoryObject = obj;
                player.setSelectedObject(obj);
            }
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
            //console.log(msg);
            $scope.msgs.push(msg);
            $scope.showConsole = true;
            if ($scope.msgs.length == 1)
                consummeMessage(msg.delay);
        }


    });
