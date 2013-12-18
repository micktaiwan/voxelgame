'use strict';

angular.module('gameApp.services.session', [])
    .factory('Session', function($rootScope, Db) {

        var user = null;
        var users = [];
        var onUserLoadCallback = null;

        Db.getUsers(function(u) {
            for (var i in u) {
                users.push(Db.newUser(i, u[i].name, u[i].email, u[i].pos, u[i].rot, u[i].inventory));
            }
            if (onUserLoadCallback) onUserLoadCallback();
            console.log('Session: ' + users.length + ' users')
        });

        function getUserByName(name) {
            var rv = null;
            users.some(function(s) {
                if (s.name == name) {
                    rv = s;
                    return;
                }
            });
            return rv;
        };

        return {
            onUsersLoad: function(callback) {
                onUserLoadCallback = callback;
                if (users.length > 0 && onUserLoadCallback) onUserLoadCallback();
            },

            getUser: function() {
                return user;
            },

            isSignedIn: function() {
                // FIXME: not good.... not the place to do Db.setUser
                if (user) {
                    Db.setUser(user);
                    return true;
                }
                user = getUserByName(readCookie('voxelgame_name'));
                if (user) Db.setUser(user);
                return user != null;
            },

            // TODO: make this disappear !!!
            changeLogin: function(name) {
                user = getUserByName(name);
            },

            login: function(login, pwd) {
                // TODO: pwd management
                user = getUserByName(login);
                if (user) {
                    writeCookie('voxelgame_name', user.name, 20);
                    Db.setUser(user);
                }
            },

            signup: function(scope, name, email, pwd) {
                //var encodedpassword = $window.btoa($scope.pwd);

                scope.error = "";

                if (users.length == 0) {
                    console.log('no users yet');
                    scope.error = "waiting for users to load, try again in 2 seconds";
                    return;
                }

                if (!name) {
                    console.log('name is empty');
                    scope.error = "name can not be empty";
                    return;
                }

                var exist = getUserByName(name); // check that login does not already exist

                if (exist) {
                    scope.error = 'User already exists';
                    return;
                }
                if (!exist) {
                    if (!email) email = '';
                    Db.addUser(name, email, function(newUser) {
                        users.push(newUser); // FIXME: do not use Db.newUser ??
                    });
                    //user = getUserByName(name); // check that login does not already exist
                    scope.pwd = 'enregistré!'
                    writeCookie('voxelgame_name', name, 20);
                    scope.error = '';
                } else {
                    scope.error = 'pseudo ' + name + ' is already taken';
                    scope.name = '';
                }
            },

            logout: function() {
                user = null;
                writeCookie('voxelgame_name', '', 20);
            }
        }
    });
