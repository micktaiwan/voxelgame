angular.module('gameApp.services.game', []).factory('Game', function($rootScope, $location) {

    return {
        init: function() {
            init();
        },
        animate: function() {
            animate();
        },
    };

});
