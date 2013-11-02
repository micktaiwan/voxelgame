angular.module('hotreminderApp.services.notification', []).factory('Notification', function($rootScope){

  return {

      types : {
          WARNING : {
              title : 'Warning !',
              icon : 'http://cdn2.iconfinder.com/data/icons/lullacons/large-alert.png'
          }
      },

      enableNotifications : function(){
          if (webkitNotifications.checkPermission() != 0) {
              webkitNotifications.requestPermission();
          }
      },

      addNotifications : function(type, text){
          webkitNotifications.createNotification(
              type.icon,
              type.title,
              text
          ).show();
      }
  }

});
