angular.module('gameApp.services.notification', []).factory('Notification', function($rootScope){

  return {

      types : {
          CHAT : {
              title : 'Chat',
              icon : 'http://cdn2.iconfinder.com/data/icons/lullacons/large-alert.png'
          }
      },

      enable : function(){
          if (webkitNotifications.checkPermission() != 0) {
              console.log('no notification permissions');
              webkitNotifications.requestPermission();
          }
      },

      add : function(type, text){
        try {
          webkitNotifications.createNotification(
              type.icon,
              type.title,
              text
          ).show();
        }
        catch(e) { console.log(e.message); }
      }
  }

});
