'use strict';

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}

angular.module('gameApp')
    .controller('MainCtrl', function($rootScope, $scope, $location, $timeout, Db, Session) {

        $rootScope.current_date = new Date().getTime();
        $rootScope.weekNumber   = new Date().getWeek();
        $scope.chat_messages = [];

        function initUser() {
            $rootScope.isSignedIn = Session.isSignedIn();
            var user = Session.getUser();
            if(user) $scope.name = user.name;
        }
        initUser();
        Session.onUsersLoad(initUser);

        function getChatMsgIndex(id) {
            console.log(id);
            var indexes = $.map($scope.chat_messages, function(chat, index) {
                if(chat.id == id) return index;
            });
            return indexes[0];
        };

        $scope.login = function() {
            Session.login($scope.name, $scope.pwd);
            $rootScope.isSignedIn = Session.isSignedIn();
        };

        $scope.signup = function() {
            Session.signup($scope, $scope.name, $scope.email, $scope.pwd);
            $rootScope.isSignedIn = Session.isSignedIn();
        };

        $scope.logout = function() {
            Session.logout();
            $rootScope.isSignedIn = false;
        };

        // Chat
        Db.getChatMsg(function(msg) {
            $scope.chat_messages.push(msg);
        });
        $scope.addMsg = function(name, msg) {
            Db.addMessage(name, msg);
            $scope.msg = '';
        }
        $scope.deleteMsg = function(id) {
            var i = getChatMsgIndex(id);
            $scope.chat_messages.splice(i, 1);
            Db.deleteMessage(id);
        }
    });

