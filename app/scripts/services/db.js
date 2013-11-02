angular.module('gameApp.services.db', []).factory('Db', function($rootScope, $location) {

  var users;
  var user;
  var firstConnection = true;

  return {

    init : function() {
      users = new Firebase('https://voxelgame.firebaseio.com/users');
      console.log("db users ref: "+users);
    },

    setUser: function(u) {
      user = u;
      console.log('connection: '+u.displayName + ", " + u.id);
    },

    getUsers : function(callbackSuccess) {
      if (!users) {
        console.log('no users ref while getting values');
        //$location.path('/');
        return;
      }
      users.on('value', function(snapshot) {
        if(snapshot.val() !== null) {
          if(firstConnection){
            $rootScope.$apply(function(){
              callbackSuccess(snapshot.val());
            });
          } else {
            callbackSuccess(snapshot.val());
          }
        }
        else { console.log('no values in DB'); }
        firstConnection = false;
      });
    },

    getUser: function() {return user;},

    addUser : function(name, email) {
      users.push({name: name, email: email});
    },

    newUser : function (id, name, email) {
      return {
        id: id,
        name: name,
        email: email
      }
    },

  };

});
