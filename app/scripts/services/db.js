angular.module('gameApp.services.db', []).factory('Db', function($rootScope, $location) {

    var CONFIG = {
        firebaseUrl: 'https://voxelgame.firebaseio.com'
    }
    var users_ref = new Firebase(CONFIG.firebaseUrl + '/users');
    var tchat_ref = new Firebase(CONFIG.firebaseUrl + '/tchat');
    var cubes_ref = new Firebase(CONFIG.firebaseUrl + '/cubes');
    var user = null;
    $rootScope.users = [];

    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    };

    // get all users once
    function getUsers (callbackSuccess) {
        users_ref.once('value', function(snapshot) {
            if(snapshot.val() !== null) {
                safeApply($rootScope, function(){
                    callbackSuccess(snapshot.val());
                });
            }
        });
    };

    // listen to users changes
    function listenUsers(callbackSuccess) {
        users_ref.on('child_added', function(snapshot) {
            if(snapshot.val() !== null) {
                safeApply($rootScope, function(){
                    callbackSuccess(snapshot.val());
                });
            }
        });
    };

    function newUser(id, name, email, pos, rot) {
        return {
            id: id,
            name: name,
            email: email,
            pos: pos,
            rot: rot
        }
    };

    listenUsers(function(user) {
        $rootScope.users.push(user);
    });


    return {
        getUsers: getUsers,

        getUser: function() {
            return user;
        },

        setUser : function(u) {
            user = u;
        },

        addUser: function(name, email) {
            var id = users_ref.push().name(); // generate a unique id based on timestamp
            users_ref.child(id).set({id: id, name: name, email: email});
        },

        newUser: newUser,

        newPlayer: function(id, name, pos, rot, callbackSuccess) {
            var player_ref = new Firebase(CONFIG.firebaseUrl + '/users/'+id);
            player_ref.on('value', function(snapshot) {
                safeApply($rootScope, function(){
                  callbackSuccess(id, snapshot.val());
                  return;
                });
            });

            return {
                id: id,
                name: name,
                pos: pos,
                rot: rot
            }
        },

        addMessage: function(name, text) {
            tchat_ref.push({name: name, text: text});
        },

        getTchat: function(callbackSuccess) {
            tchat_ref.on('child_added', function(snapshot) {
                var message = snapshot.val();
                callbackSuccess(message.name, message.text);
            });
        },

        put: function(x,y,z,type) {
            if(!user) return;
            cubes_ref.child(x).child(y).child(z).update({type: type, user: user.id, date: new Date().getTime()});
        },

        // Update current logged user position
        updatePos: function(pos) {
            if(!user) return;
            users_ref.child(user.id).child('pos').update(pos);
        },
        updateRot: function(rot) {
            if(!user) return;
            users_ref.child(user.id).child('rot').update(rot);
        },

    };
});
