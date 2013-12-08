'use strict';

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}

angular.module('gameApp')
    .controller('MainCtrl', function($rootScope, $scope, $location, Db, Session) {

        $rootScope.users    = [];
        $scope.current_date = new Date().getTime();
        $scope.weekNumber   = new Date().getWeek();


        function getUserByName(name) {
          var rv = null;
          $rootScope.users.some(function(s) {
            if(s.name==name) {
              rv = s;
              return;
            }
          });
          return rv;
        }
        $scope.signup = function() {
            Session.signup($scope.name, $scope.email, $scope.pwd);
        };

        $scope.logout = function() {
            Session.logout();
        };

        //$scope.name = Session.getUser();

        $scope.isSignedIn = function() {
            Session.isSignedIn();
        }
        Db.init();
        Db.getUsers(function(users) {
            $rootScope.users = [];
            for (var i in users) {
                $rootScope.users.push(Db.newUser(i, users[i].name, users[i].email, users[i].pos, users[i].rot));
            }
            var user = getUserByName($scope.name);
            if(user) {
                if(!user.pos) user.pos = {x:0, y:0, z: 0};
                if(!user.rot) user.rot = {corps:0, tete:0};
                console.log(user);
                Session.setUser(user);
            }
            console.log($rootScope.users.length + ' users')
        });

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

