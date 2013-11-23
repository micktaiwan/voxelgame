'use strict';

angular.module('gameApp')
  .controller('UsersCtrl', function($scope, Db) {

    var users = [];
    Db.init();
    //Db.addUser('Mickael', 'email mick');

    Db.getUsers(function(users) {
      $scope.users = []; // we reinitialize all users
      for(var i in users) {
        $scope.users.push(Db.newUser(i, users[i].name, users[i].email));
      };
      console.log($scope.users.length+' users')
    });
    $scope.addUser = function(name) { Db.addUser(name, 'no email'); };
  })

  ;
