'use strict';

angular.module('gameApp')
  .controller('MainCtrl', function($scope, Db) {
    
    var users = [];
    Db.init();
    //Db.addUser('Mickael', 'email mick');

    $scope.todos = Db.getUsers(function(users) {
      $scope.users = []; // we reinitialize all users
      for(var i in users) {
        $scope.users.push(Db.newUser(i, users[i].name, users[i].email));
      };
      console.log($scope.users.length+' users')
    });
    $scope.addUser = function(name) { Db.addUser(name, 'no email'); };
  })

  .controller('SecondCtrl', function ($scope, $location) {
    $scope.todos = ['Second controller'];
    $scope.addTodo = function(newTodo) { 
    	if(newTodo=="magic") {
    		$location.path('/');
				return;
    		}
    	$scope.todos.push(newTodo);
    };
  })

  ;
