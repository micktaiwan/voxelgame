'use strict';

angular.module('google', [])

    .factory('Google', function ($rootScope) {

        var initLoaded = false;
        var user;

        (function() {
            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/client:plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
        })();

        window.signinCallback = function(authResult) {
            if (authResult['access_token']) {
                document.getElementById('signinButton').setAttribute('style', 'display: none');
                initLoaded = true;
            } else if (authResult['error']) {
                console.log('There was an error: ' + authResult['error']);
            }
        };

        var isReady =  function(callbackSuccess){
            var interval = setInterval(function() {
                if (initLoaded) {
                    callbackSuccess();
                    clearInterval(interval);
                }
            }, 10);
        };

        return {

            isReady : function(callbackSuccess){
                isReady(callbackSuccess);
            },

            login: function(callbackSuccess, callbackError){

                isReady(function(){
                    gapi.client.load('plus','v1', function(){
                        var request = gapi.client.plus.people.get({
                            'userId': 'me'
                        });
                        request.execute(function(resp) {
                            user = resp;
                            callbackSuccess();
                        });
                    });
                });

            },

            getUser: function(){
                return user;
            }

        }

    });
