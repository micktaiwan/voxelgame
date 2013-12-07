'use strict';

angular.module('gameApp.services.game', []).factory('Game', function($rootScope, $location) {

    return {
        init: function(player) {
            init(player);
        },
        animate: function() {
            animate();
        },
        addPlayer: function(name, x, y, z, dir) {
            var p = new perso(name, x, y, z, dir);
            if(scene) scene.add(p.corps);
            players << p;
            return p;
        }
    };

});
