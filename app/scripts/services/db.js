'use stcrict';

angular.module('gameApp.services.db', []).factory('Db', function($rootScope, $location) {

    var CONFIG = {
        firebaseUrl: 'https://voxelgame.firebaseio.com'
    }
    var users_ref = new Firebase(CONFIG.firebaseUrl + '/users');
    var tchat_ref = new Firebase(CONFIG.firebaseUrl + '/tchat');
    var cubes_ref = new Firebase(CONFIG.firebaseUrl + '/cubes');
    var cubelist_ref = new Firebase(CONFIG.firebaseUrl + '/cubelist');
    var user = null;
    var lastPosUpdate = new Date().getTime();
    var lastRotUpdate = new Date().getTime();
    var minUpdateInterval = 1 * 1000;
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

    function newUser(id, name, email, pos, rot, inventory) {
        return {
            id: id,
            name: name,
            email: email,
            pos: pos,
            rot: rot,
            inventory: inventory
        }
    };


    function cube_changed(type, snapshot, callbackSuccess) {
        safeApply($rootScope, function() {
            callbackSuccess(type, snapshot.val());
        });
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

        addUser: function(name, email, callback) {
            var id = users_ref.push().name(); // generate a unique id based on timestamp
            var user = {id: id, name: name, email: email, date: new Date().getTime()};
            users_ref.child(id).set(user);
            if(callback) callback(user);
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
            var id = tchat_ref.push().name();
            tchat_ref.child(id).set({id: id, name: name, text: text, date: new Date().getTime()});
        },

        deleteMessage: function(id) {
            tchat_ref.child(id).remove();
        },

        onChatMsg: function(callbackSuccess) {
            tchat_ref.off('child_added'); // FIXME....ugly
            tchat_ref.limit(10).on('child_added', function(snapshot) {
                safeApply($rootScope, function(){
                    callbackSuccess(snapshot.val());
                });
            });
        },

        onCube: function(callbackSuccess) {
            cubelist_ref.on('child_added',   function(snapshot) { cube_changed('added', snapshot, callbackSuccess)});
            cubelist_ref.on('child_changed', function(snapshot) { cube_changed('changed', snapshot, callbackSuccess)});
            cubelist_ref.on('child_removed', function(snapshot) { cube_changed('removed', snapshot, callbackSuccess)});
        },

        put: function(x,y,z,type, callbackSuccess) {
            if(!user) return;
            cubes_ref.child('pos').child(x).child(y).child(z).once('value', function(snapshot) {
                if(snapshot.val()) throw "There is a cube in Db here";
                var id = cubelist_ref.push().name();
                var date = new Date().getTime();
                cubes_ref.child('pos').child(x).child(y).child(z).update({id: id, type: type, user: user.id, date: date});
                var obj = {id: id, type: type, user: user.id, date: date, x: x, y: y, z: z};
                cubelist_ref.child(id).update(obj);
                if(callbackSuccess) callbackSuccess(obj);
            });
        },

        addInventory: function(obj) {
            if(!user) return;
            var id = users_ref.child(user.id).child('inventory').push().name();
            var value = {id: id, type: obj.type, date: new Date().getTime()};
            users_ref.child(user.id).child('inventory').child(id).update(value);
            if(obj.attrs) {
                users_ref.child(user.id).child('inventory').child(id).child('attrs').update(obj.attrs);
                value['attrs'] = obj.attrs;
            }
            return value;
        },

        removeInventory: function(id) {
            if(!user) return;
            users_ref.child(user.id).child('inventory').child(id).remove();
        },

        remove: function(id) {
            if(!user) return;
            cubelist_ref.child(id).once('value', function(snapshot) {
                var obj = snapshot.val();
                if(!obj) throw "no cube in Db here";
                cubes_ref.child('pos').child(obj.x).child(obj.y).child(obj.z).remove();
                cubelist_ref.child(id).remove();
            });
        },

        // Update current logged user position
        updatePos: function(pos) {
            if(!user) return;
            var time = new Date().getTime();
            if(lastPosUpdate > time - minUpdateInterval) return;
            lastPosUpdate = time;
            var node = users_ref.child(user.id);
            node.child('pos').update(pos);
            node.update({date: time});
        },
        updateRot: function(rot) {
            if(!user) return;
            var time = new Date().getTime();
            if(lastRotUpdate > time - minUpdateInterval) return;
            lastRotUpdate = time;
            var node = users_ref.child(user.id);
            node.child('rot').update(rot);
            node.update({date: new Date().getTime()});
        },

    };
});
