angular.module('gameApp.services.notification', []).factory('Notification', function($rootScope) {

    return {

        types: {
            CHAT: {
                title: 'Jethro koull',
                icon: 'http://www.cusi.fr/site/tchat-enfant/im/msn.jpg'
            }
        },

        enable: function() {
            if (typeof webkitNotifications !== 'undefined' && webkitNotifications.checkPermission() != 0) {
                console.log('no notification permissions');
                webkitNotifications.requestPermission();
            }
        },

        add: function(type, text) {
            if (typeof webkitNotifications === 'undefined') return;
            try {
                webkitNotifications.createNotification(
                    type.icon,
                    type.title,
                    text
                ).show();
            } catch (e) {
                console.log(e.message);
            }
        }
    }

});
