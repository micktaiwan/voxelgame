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

                var pos = {
                    x: Math.sin(this.follow.corps.rotation.y) * Math.cos(this.follow.tete.rotation.x),
                    y: Math.sin(this.follow.tete.rotation.x),
                    z: Math.cos(this.follow.corps.rotation.y) * Math.cos(this.follow.tete.rotation.x)
                }

                var look = {
                    x: this.follow.corps.position.x + this.follow.tete.position.x,
                    y: this.follow.corps.position.y + this.follow.tete.position.y + Config.dimCadri,
                    z: this.follow.corps.position.z + this.follow.tete.position.z
                }
                var lookVector = new THREE.Vector3(look.x, look.y, look.z);
                var dist = this.distCam;

                /*
                var posVector = new THREE.Vector3(
                    this.follow.corps.position.x + pos.x * dist,
                    this.follow.corps.position.y - pos.y * dist,
                    this.follow.corps.position.z + pos.z * dist); * /

                var dir = posVector - lookVector;

                var raycaster = new THREE.Raycaster(look, dir);
                //var intersects = raycaster.intersectObjects(Map.getMeshes());
                //console.log(intersects);

                var arrow = new THREE.ArrowHelper(lookVector, posVector, 50);
                arrow.position.set(posVector.x, posVector.y, posVector.z);
                Map.addToScene(arrow);
                */
                this.camera.position.x = this.follow.corps.position.x + this.follow.tete.position.x + pos.x * dist;
                this.camera.position.y = this.follow.corps.position.y + this.follow.tete.position.y - pos.y * dist + Config.dimCadri;
                this.camera.position.z = this.follow.corps.position.z + this.follow.tete.position.z + pos.z * dist;

                this.camera.lookAt(lookVector);

            } else if (follow) {
                this.camera.position.y = this.follow.position.y + 200;
                this.camera.position.x = this.follow.position.x - 200;
                this.camera.position.z = this.follow.position.z;
                this.camera.lookAt(new THREE.Vector3(this.follow.position.x, this.follow.position.y, this.follow.position.z));
            } else {
                console.error('camera has nothing to follow');
            }
        };

        this.setCamDist = function(distCamPlayer, mesh) {
            if (!mesh) mesh = this.follow.position ? this.follow : this.follow.corps;
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

        this.setCamDistFromDelta = function(delta) {
            this.distCam -= delta / 10;
            if (this.distCam < -60) this.distCam = -60;
            //if (distCamPlayer > 300) distCamPlayer = 300;
            this.setCamDist(this.distCam);
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
