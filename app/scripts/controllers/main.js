'use strict';

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

angular.module('gameApp')
    .controller('MainCtrl', function($rootScope, $scope, $location, $timeout, Db, Session, Notification, Game) {

        $rootScope.current_date = new Date().getTime();
        $rootScope.weekNumber = new Date().getWeek();
        $scope.chat_messages = [];

        Notification.enable();
        console.log('main');
        Game.stop();

        function initUser() {
            $rootScope.isSignedIn = Session.isSignedIn();
            var user = Session.getUser();
            if (user) $scope.name = user.name;
        };

        initUser();
        Session.onUsersLoad(initUser);
        Db.onChatMsg(function(msg) {
            $scope.chat_messages.push(msg);
            Game.addMessage({
                text: msg.name + ": " + msg.text,
                delay: 10,
                type: 'chat'
            });
            if (msg.date > new Date().getTime() - 5 * 1000)
                Notification.add(Notification.types.CHAT, msg.name + ': ' + msg.text);
        });


        function getChatMsgIndex(id) {
            var indexes = $.map($scope.chat_messages, function(chat, index) {
                if (chat.id == id) return index;
            });
            return indexes[0];
        };

        $scope.login = function() {
            Session.login($scope.name, $scope.pwd);
            $rootScope.isSignedIn = Session.isSignedIn();
        };
        $scope.test = function() {
            console.log('ok');
        };

        $scope.signup = function() {
            Session.signup($scope, $scope.name, $scope.email, $scope.pwd);
            $rootScope.isSignedIn = Session.isSignedIn();
        };

        $rootScope.logout = function() {
            Session.logout();
            $rootScope.isSignedIn = false;
        };

        $scope.addMsg = function(name, msg) {
            if (!msg) return;
            Db.addMessage(name, msg);
            $scope.msg = '';
        }
        $scope.deleteMsg = function(id) {
            var i = getChatMsgIndex(id);
            Db.deleteMessage(id);
            $scope.chat_messages.splice(i, 1);
        }
    });
