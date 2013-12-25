'use strict';

angular.module('gameApp.services.robot', []).factory('Robot', function($rootScope, $location, Db, Game) {

    function robot(dbRobot, player, callbacks) {

        if (!dbRobot.pos) {
            dbRobot.pos = {
                x: player.pos.x,
                y: player.pos.y,
                z: player.pos.z
            }
        }

       if (!dbRobot.rot) {
            dbRobot.rot = {
                x: player.pos.x,
                y: player.pos.y,
                z: player.pos.z
            }
        }

        console.log(dbRobot);

        this.body = new THREE.Object3D();
        this.body.position.copy(dbRobot.pos);

        var map = THREE.ImageUtils.loadTexture('images/ash_uvgrid01.jpg');
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;

        var material = new THREE.MeshLambertMaterial({
            ambient: 0xffffff,
            map: map
        });
        var d = Config.dimCadri / 2;
        var geometrytorso = new THREE.CubeGeometry(d, d, d);
        this.torso = new THREE.Mesh(geometrytorso, material);
        this.torso.castShadow = true;
        this.torso.receiveShadow = true;

        this.body.add(this.torso);

    };

    return {
        newRobot: function(dbRobot, player, callbacks) {
            return new robot(dbRobot, player, callbacks);
        },
    };

});
