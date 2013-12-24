'use strict';

angular.module('gameApp.services.robot', []).factory('Robot', function($rootScope, $location, Db, Session, Game) {

    function robot(_robot, callbacks) {


    };

    return {
        newRobot: function(_robot, callbacks) {
            return new robot(_robot, callbacks);
        },
    };

});
