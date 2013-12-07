'use strict';

angular.module('gameApp')
        .controller('MainCtrl', function($scope, Db, Game) {

            Db.init();
            Db.getUsers(function(users) {
                $scope.users = []; // we reinitialize all users
                for (var i in users) {
                    $scope.users.push(Db.newUser(i, users[i].name, users[i].email));
                }
                ;
                console.log($scope.users.length + ' users')
            });

            Db.getTchat(function(name, text) {
                $('<div/>').text(text).prepend($('<em/>').text(name + ': ')).appendTo($('#messagesDiv'));
                $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
            });

            $('#passwordLogIn').keypress(function(e) {
                if(e.keyCode == 13) {
                    var name = $('#nameLogIn').val();
                    var password = $('#passwordLogIn').val();
                    var encodedpassword = window.btoa(password);
                    var email = 'yo';
                    Db.addUser(name, 'no email');
                    $('#passwordLogIn').val('enregistré!');
                    $("#passwordLogIn").attr("disabled", "disabled");
                    $("#nameLogIn").attr("disabled", "disabled");
                    $('#messageInput').focus();

                    writeCookie('jetname', name, 20);
                }
            });

            var jetname = readCookie('jetname');
            if(jetname != '') {
                $('#signIn').hide();
                $("#nameInput").attr("disabled", "disabled");
            }
            $scope.name = jetname;

            //tchat 
            $('#messageInput').keypress(function(e) {
                if(e.keyCode == 13) {
                    var name = $('#nameInput').val();
                    var text = $('#messageInput').val();
                    Db.addMessage(name, text);
                    $('#messageInput').val('');
                }
            });

        })
