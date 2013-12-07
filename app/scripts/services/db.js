angular.module('gameApp.services.db', []).factory('Db', function($rootScope, $location) {

    var users;
    var user;
    var tchat;
    var CONFIG = {
        firebaseUrl: 'https://voxelgame.firebaseio.com'
    }

    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    };

    return {
        init: function() {
            users = new Firebase(CONFIG.firebaseUrl + '/users');
            tchat = new Firebase(CONFIG.firebaseUrl + '/tchat');
            console.log("db users ref: " + users);
        },
        setUser: function(u) {
            user = u;
            console.log('connection: ' + u.name + ", " + u.id);
        },
        getUsers: function(callbackSuccess) {
            if(!users) {
                console.log('no users ref while getting values');
                return;
            }
            users.once('value', function(snapshot) {
                if(snapshot.val() !== null) {
                    safeApply($rootScope, function(){
                        callbackSuccess(snapshot.val());
                    });
                }
                else {
                    console.log('no values in DB');
                }
            });
        },
        getUser: function() {
            return user;
        },
        addUser: function(name, email) {
            users.push({name: name, email: email});
        },
        newUser: function(id, name, email, pos, rot) {
            return {
                id: id,
                name: name,
                email: email,
                pos: pos,
                rot: rot
            }
        },
        newPlayer: function(id, name, pos, rot, callbackSuccess) {
            if(id!=user.id) {
                var player_ref = new Firebase(CONFIG.firebaseUrl + '/users/'+id);
                player_ref.on('value', function(snapshot) {
                    safeApply($rootScope, function(){
                      callbackSuccess(id, snapshot.val());
                      return;
                    });
                });
            }

            return {
                id: id,
                name: name,
                pos: pos,
                rot: rot
            }
        },

        addMessage: function(name, text) {
            tchat.push({name: name, text: text});
        },
        getTchat: function(callbackSuccess) {
            tchat.on('child_added', function(snapshot) {
                var message = snapshot.val();
                callbackSuccess(message.name, message.text);
            });
        },
        // Update current logged user position
        updatePos: function(pos) {
            if(!user) return;
            users.child(user.id).child('pos').update(pos);
        },
        updateRot: function(rot) {
            if(!user) return;
            users.child(user.id).child('rot').update(rot);
        },

    };
});
