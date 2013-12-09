'use strict';

angular.module('gameApp.services.session', [])
.factory('Session', function ($rootScope, Db) {

	var user = null;
	var users = [];

    Db.getUsers(function(u) {
        for (var i in u) {
            users.push(Db.newUser(i, u[i].name, u[i].email, u[i].pos, u[i].rot));
        }
        console.log('Session: '+users.length+' users')
    });

    function getUserByName(name) {
      var rv = null;
      users.some(function(s) { if(s.name==name) { rv = s; return; } });
      return rv;
    };

	return {
		getUser : function () {
			return user;
		},

		isSignedIn : function() {
			return user!=null;
		},

		// TODO: make this disappear !!!
	    changeLogin : function(name) {
	        user = getUserByName(name);
	    },

	    login : function(login, pwd) {
	        user = getUserByName(login);
	        console.log(user);
	    },

	    signup : function(scope, name, login, pwd) {
	        //var encodedpassword = $window.btoa($scope.pwd);

	        scope.error = "";
	        if(!$rootScope.users) {
	            scope.error = "waiting for users to load";
	            return;
	        }

	        user = getUserByName(name); // check that login does not already exist

	        if(user) {
	            scope.error = 'User already exists';
	            return;
	        }
	        if(!user) {
	            if(!email) email = '';
	            Db.addUser(name, email);
	            scope.pwd = 'enregistré!'
	            //writeCookie('jetname', $scope.name, 20);
	            scope.error = '';
	            //jetname = $scope.name;
	        }
	        else {
	            scope.error = 'pseudo '+ name +' is already taken';
	            scope.name = '';
	        }
	    },

		logout : function() {
		    user = null;
		    //writeCookie('jetname', '', 20);
		}
	}
});
