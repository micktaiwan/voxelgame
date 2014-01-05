'use strict';

angular.module('gameApp.services.camera', []).factory('Camera', function($rootScope, $location, Map) {

    var camera = new Camera();

    function Camera() {

        this.camera = new THREE.PerspectiveCamera(Config.viewwAngle, window.innerWidth / window.innerHeight, 1, 10000);
        /*        this.camera.position.x += Math.sin(this.corps.rotation.y) * distCamPlayer;
        this.camera.position.z += Math.cos(this.corps.rotation.y) * distCamPlayer;
*/
        /*
        this.camera.position.set( 60, 60, 60 );
        this.camera.lookAt(new THREE.Vector3(100,0,0));
*/
        this.follow = null;
        this.mode = 'pov';
        this.distCam = Config.distCamPlayer;

        this.update = function() {
            if (this.mode == 'pov') {
                //console.log('pov');
                this.camera.position.y = this.follow.corps.position.y + 200;
                this.camera.position.x = this.follow.corps.position.x - 200;
                this.camera.position.z = this.follow.corps.position.z;
                this.camera.lookAt(new THREE.Vector3(this.follow.corps.position.x, this.follow.corps.position.y, this.follow.corps.position.z));
            } else if (follow) {
                this.camera.position.y = this.follow.position.y + 200;
                this.camera.position.x = this.follow.position.x - 200;
                this.camera.position.z = this.follow.position.z;
                this.camera.lookAt(new THREE.Vector3(this.follow.position.x, this.follow.position.y, this.follow.position.z));
            }
            else {
            	console.error('camera has nothing to follow');
            }
        };

        this.setCamDist = function(distCamPlayer, mesh) {

            return; // en attendant

            var limit = 5;
            var dist = distCamPlayer;
            if (dist < limit) dist = limit;
            this.camera.position.x = mesh.position.x + Math.sin(mesh.rotation.y) * dist;
            this.camera.position.z = mesh.position.z + Math.cos(mesh.rotation.y) * dist;
            if (distCamPlayer < limit) {
                this.camera.fov = Config.viewAngle - distCamPlayer / 1.5;
                this.camera.updateProjectionMatrix();
            } else if (this.camera.fov != Config.viewAngle) {
                this.camera.fov = Config.viewAngle;
                this.camera.updateProjectionMatrix();
            }
        };

        this.camdist = function(delta) {
            distCam -= delta / 10;
            if (distCam < -60) distCam = -60;
            //if (distCamPlayer > 300) distCamPlayer = 300;
            this.setCamDist(distCam);
        };

    };

    return {
        getCamera: function() {
            return camera;
        },
        getTHREECamera: function() {
            return camera.camera;
        },
        follow: function(object) {
            camera.follow = object;
            camera.mode = 'follow';
        },
        followPlayer: function(player) {
            camera.follow = player;
            camera.mode = 'pov';
        },
    };

});
