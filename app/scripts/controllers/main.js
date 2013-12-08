'use strict';

angular.module('gameApp')
    .controller('MainCtrl', function($scope, Db, Game) {

        $scope.changeLogin = function() {
            var user = getUserByName($scope.name);
            if(user) {
                Db.setUser(user);
            }
            else console.log('ooops this user does not exists');
        }

        function getUserByName(name) {
          var rv = null;
          $scope.users.some(function(s) {
            if(s.name==name) {
              rv = s;
              return;
            }
          });
          return rv;
        }

        $scope.signup = function(name, pwd) {
            //var encodedpassword = $window.btoa($scope.pwd);
            // check that login does not already exist
            var user = getUserByName($scope.name);
            if(!user) {
                Db.addUser($scope.name, $scope.email);
                $scope.pwd = 'enregistré!'
                //$("#passwordLogIn").attr("disabled", "disabled");
                //$("#nameLogIn").attr("disabled", "disabled");
                $('#msg').focus();
                writeCookie('jetname', $scope.name, 20);
                $scope.error = '';
            }
            else {
                $scope.error = 'pseudo '+$scope.name+' is already taken';
                $scope.name = '';
            }
        };

        var jetname = readCookie('jetname');
        $scope.name = jetname;
        $scope.isSignedIn = function() {
            return $scope.name != '';
        }
        Db.init();
        Db.getUsers(function(users) {
            $scope.users = [];
            for (var i in users) {
                $scope.users.push(Db.newUser(i, users[i].name, users[i].email, users[i].pos, users[i].rot));
            }
            var user = getUserByName($scope.name);
            if(!user.pos) user.pos = {x:0, y:0, z: 0};
            if(!user.rot) user.rot = {corps:0, tete:0};
            console.log(user);
            Db.setUser(user);
            console.log($scope.users.length + ' users')
        });

        Db.getTchat(function(name, text) {
            $('<div/>').text(text).prepend($('<em/>').text(name + ': ')).appendTo($('#messagesDiv'));
            $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
        });
        //tchat
        $scope.addMsg = function(name, msg) {
            Db.addMessage(name, msg);
            $scope.msg = '';
        }
    });

