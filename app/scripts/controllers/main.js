'use strict';

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}

angular.module('gameApp')
    .controller('MainCtrl', function($rootScope, $scope, $location, Db, Session) {

        $scope.current_date = new Date().getTime();
        $scope.weekNumber   = new Date().getWeek();
        $scope.isSignedIn = false;


        $scope.login = function() {
            Session.login($scope.name, $scope.pwd);
            $scope.isSignedIn = Session.isSignedIn();
        };

        $scope.signup = function() {
            Session.signup($scope, $scope.name, $scope.email, $scope.pwd);
            $scope.isSignedIn = Session.isSignedIn();
        };

        $scope.logout = function() {
            Session.logout();
            $scope.isSignedIn = false;
        };

        // Chat
        Db.getTchat(function(name, text) {
            $('<div/>').text(text).prepend($('<em/>').text(name + ': ')).appendTo($('#messagesDiv'));
            $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
        });
        $scope.addMsg = function(name, msg) {
            Db.addMessage(name, msg);
            $scope.msg = '';
        }
    });

