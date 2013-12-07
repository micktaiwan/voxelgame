'use strict';

angular.module('gameApp.services.game', []).factory('Game', function($rootScope, $location) {

    return {
        init: function(player) {
            init(player);
        },
        animate: function() {
            animate();
        },
        addMainPlayer: function(name, x, y, z, dir) {
            var p = new perso(name, x, y, z, dir);
            if(scene)
                scene.add(p.corps);
            players << p;
            return p;
        },
        addPNJ: function(name, pos, rot) {
            var p = new PNJ(name, pos, rot);
            scene.add(p.corps);
            objects.push(p.torse);
            players << p;
            return p;
        }
    };

});
