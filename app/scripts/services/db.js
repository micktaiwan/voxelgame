'use stcrict';

angular.module('gameApp.services.db', []).factory('Db', function($rootScope, $location, $timeout) {

    var CONFIG = {
        firebaseUrl: 'https://voxelgame.firebaseio.com'
    }
    var users_ref = new Firebase(CONFIG.firebaseUrl + '/users');
    var tchat_ref = new Firebase(CONFIG.firebaseUrl + '/tchat');
    var cubes_ref = new Firebase(CONFIG.firebaseUrl + '/cubes');
    var cubelist_ref = new Firebase(CONFIG.firebaseUrl + '/cubelist');
    var user = null;
    var gameStartTime = new Date().getTime();
    var lastPosUpdate = gameStartTime;
    var lastRotUpdate = gameStartTime;
    var updateDbInterval = 1 * 1000;
    var posUpdateTimeoutRef = rotUpdateTimeoutRef = null;
    $rootScope.users = [];

    var offsetRef = new Firebase(CONFIG.firebaseUrl + '/.info/serverTimeOffset');
    offsetRef.on("value", function(snap) {
      console.log(snap.val()/1000 + "s clock offset");
    });


    function doUpdatePos(pos) {
        lastPosUpdate = new Date().getTime();
        var node = users_ref.child(user.id);
        node.child('pos').update(pos);
        node.update({
            date: Firebase.ServerValue.TIMESTAMP
        });
    };

    function doUpdateRot(rot) {
        lastRotUpdate = new Date().getTime();
        var node = users_ref.child(user.id);
        node.child('rot').update(rot);
        node.update({
            date: Firebase.ServerValue.TIMESTAMP
        });
    };

    function connect() {
        if (!user) throw "connect called without any user"
        // since I can connect from multiple devices or browser tabs, we store each connection instance separately
        // any time that connectionsRef's value is null (i.e. has no children) I am offline
        var myConnectionsRef = new Firebase(CONFIG.firebaseUrl + '/users/' + user.id + '/connections');

        // stores the timestamp of my last disconnect (the last time I was seen online)
        var lastOnlineRef = new Firebase(CONFIG.firebaseUrl + '/users/' + user.id + '/date');

        var connectedRef = new Firebase(CONFIG.firebaseUrl + '/.info/connected');
        connectedRef.on('value', function(snap) {
            if (snap.val() === true) {
                // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
                lastOnlineRef.set(Firebase.ServerValue.TIMESTAMP);
                // add this device to my connections list
                // this value could contain info about the device or a timestamp too
                var con = myConnectionsRef.push(true);

                // when I disconnect, remove this device
                con.onDisconnect().remove();

                // when I disconnect, update the last time I was seen online
                lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
            }
        });
    };

    // get all users once

    function getUsers(callbackSuccess) {
        users_ref.once('value', function(snapshot) {
            if (snapshot.val() !== null) {
                safeApply($rootScope, function() {
                    callbackSuccess(snapshot.val());
                });
            }
        });
    };

    // listen to users changes

    function listenUsers(callbackSuccess) {
        users_ref.on('child_added', function(snapshot) {
            if (snapshot.val() !== null) {
                safeApply($rootScope, function() {
                    callbackSuccess(snapshot.val());
                });
            }
        });
    };

    function addInventory(obj) {
        if (!user) throw "no user!";
        var id = users_ref.child(user.id).child('inventory').push().name();
        var value = {
            id: id,
            type: obj.type,
            display: Objects[obj.type].display,
            path: Objects[obj.type].path,
            date: Firebase.ServerValue.TIMESTAMP
        };
        users_ref.child(user.id).child('inventory').child(id).update(value);
        if (obj.attrs) {
            users_ref.child(user.id).child('inventory').child(id).child('attrs').update(obj.attrs);
            value['attrs'] = obj.attrs;
        }
        return value;
    };

    // returns a well initialized object

    function newUser(id, name, email, pos, rot, inventory, robots) {
        if (!pos)
            pos = {
                x: 0,
                y: 50,
                z: 0
            };
        if (!rot)
            rot = {
                corps: 0,
                tete: 100
            };

        if (!inventory) {
            inventory = [];
            /* marche pas parce que le user n'existe pas quand on appelle newUser
            var obj = addInventory({
                type: CubeTypes.WoodBlock
            }); // attrs: {test: 'ok'}
            inventory = [obj];
            */
        } else {
            inventory = toArray(inventory);
        }
        if (!robots) robots = [];
        else {
            robots = toArray(robots);
            console.log('robots in DB for user ' + name + '!');
            console.log(robots);
        }

        return {
            id: id,
            name: name,
            email: email,
            pos: pos,
            rot: rot,
            inventory: inventory,
            robots: robots
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

        setUser: function(u) {
            user = u;
            connect();
        },

        addUser: function(name, email, callback) {
            var id = users_ref.push().name(); // generate a unique id based on timestamp
            var user = {
                id: id,
                name: name,
                email: email,
                date: Firebase.ServerValue.TIMESTAMP
            };
            users_ref.child(id).set(user);
            if (callback) callback(user);
        },

        // get elements and return a well initialized object
        newUser: newUser,

        // add firebase onvalue callback to a dbUser
        newPlayer: function(dbUser, callbackSuccess) {
            var player_ref = new Firebase(CONFIG.firebaseUrl + '/users/' + dbUser.id);
            player_ref.on('value', function(snapshot) {
                safeApply($rootScope, function() {
                    callbackSuccess(dbUser.id, snapshot.val());
                    return;
                });
            });

            return dbUser;
        },

        addMessage: function(name, text) {
            var id = tchat_ref.push().name();
            tchat_ref.child(id).set({
                id: id,
                name: name,
                text: text,
                date: Firebase.ServerValue.TIMESTAMP
            });
        },

        deleteMessage: function(id) {
            tchat_ref.child(id).remove();
        },

        onChatMsg: function(callbackSuccess) {
            tchat_ref.off('child_added'); // FIXME....ugly
            tchat_ref.limit(10).on('child_added', function(snapshot) {
                safeApply($rootScope, function() {
                    callbackSuccess(snapshot.val());
                });
            });
        },

        onCube: function(callbackSuccess) {
            cubelist_ref.on('child_added', function(snapshot) {
                cube_changed('added', snapshot, callbackSuccess)
            });
            cubelist_ref.on('child_changed', function(snapshot) {
                cube_changed('changed', snapshot, callbackSuccess)
            });
            cubelist_ref.on('child_removed', function(snapshot) {
                cube_changed('removed', snapshot, callbackSuccess)
            });
        },

        put: function(x, y, z, type, callbackSuccess) {
            if (!user) return;
            cubes_ref.child('pos').child(x).child(y).child(z).once('value', function(snapshot) {
                if (snapshot.val()) throw "There is a cube in Db here";
                var id = cubelist_ref.push().name();
                var date = new Date().getTime();
                cubes_ref.child('pos').child(x).child(y).child(z).update({
                    id: id,
                    type: type,
                    display: Objects[type].display, // FIXME: hack, should use a find function
                    path: Objects[type].path,
                    user: user.id,
                    date: date
                });
                var obj = {
                    id: id,
                    type: type,
                    display: Objects[type].display, // FIXME: hack, should use a find function
                    path: Objects[type].path,
                    user: user.id,
                    date: date,
                    x: x,
                    y: y,
                    z: z
                };
                cubelist_ref.child(id).update(obj);
                if (callbackSuccess) callbackSuccess(obj);
            });
        },

        // obj = {type: '', attrs :{}}
        addInventory: addInventory,

        removeInventory: function(id) {
            if (!user) return;
            users_ref.child(user.id).child('inventory').child(id).remove();
        },

        remove: function(id) {
            if (!user) return;
            cubelist_ref.child(id).once('value', function(snapshot) {
                var obj = snapshot.val();
                if (!obj) throw "no cube in Db here";
                cubes_ref.child('pos').child(obj.x).child(obj.y).child(obj.z).remove();
                cubelist_ref.child(id).remove();
            });
        },

        // Update current logged user position
        updatePos: function(pos) {
            if (!user) return;
            var time = new Date().getTime();
            if (lastPosUpdate > time - updateDbInterval) {
                $timeout.cancel(posUpdateTimeoutRef);
                posUpdateTimeoutRef = $timeout(function() { // in case user does not move any more we set a timer to update DB anyway
                    doUpdatePos(pos);
                }, updateDbInterval - (time - lastPosUpdate));
                return;
            }
            $timeout.cancel(posUpdateTimeoutRef);
            doUpdatePos(pos);
            lastPosUpdate = time;
        },
        // Update current logged user rotation
        updateRot: function(rot) {
            if (!user) return;
            var time = new Date().getTime();
            if (lastRotUpdate > time - updateDbInterval) {
                $timeout.cancel(rotUpdateTimeoutRef);
                rotUpdateTimeoutRef = $timeout(function() { // in case user does not move any more we set a timer to update DB anyway
                    doUpdateRot(rot);
                }, updateDbInterval - (time - lastRotUpdate));
                return;
            }
            $timeout.cancel(rotUpdateTimeoutRef);
            doUpdateRot(rot);
            lastRotUpdate = time;
        },
        // add a robot to the game belonging to the connected current user
        addRobot: function(obj) {
            if (!user) return;
            var id = users_ref.child(user.id).child('robots').push().name();
            var value = {
                id: id,
                type: obj.type,
                date: Firebase.ServerValue.TIMESTAMP
            };
            users_ref.child(user.id).child('robots').child(id).update(value);
            if (obj.attrs) {
                users_ref.child(user.id).child('robots').child(id).child('attrs').update(obj.attrs);
                value['attrs'] = obj.attrs;
            }
            return value;
        }

    };
});
