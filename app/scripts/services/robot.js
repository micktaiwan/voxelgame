'use strict';

angular.module('gameApp.services.robot', []).factory('Robot', function($rootScope, $location, Db, Game) {

    function robot(dbRobot, player, callbacks) {

        if (!dbRobot.pos) {
            dbRobot.pos = {
                x: player.corps.position.x,
                y: player.corps.position.y,
                z: player.corps.position.z
            }
        }

        if (!dbRobot.rot) {
            dbRobot.rot = {
                body: player.corps.rotation.y
            }
        }

        // console.log(dbRobot);

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

        this.update = function() {
            //console.log("update");
            this.moveTowardsPlayer();
            //randomizeMove(this.body, 0.2);
        };

        this.goTo = function(pos, minDist) {
            var dist = pos.x - this.body.position.x;
            if (Math.abs(dist) < minDist) {
                if (dist < 0)
                    dist += 50;
                else
                    dist -= 50;
            }
            this.body.position.x += (dist) / 50;

            dist = pos.y - this.body.position.y;
            this.body.position.y += (dist) / 50;

            dist = pos.z - this.body.position.z;
            if (Math.abs(dist) < minDist) {
                if (dist < 0)
                    dist += 50;
                else
                    dist -= 50;
            }
            this.body.position.z += (dist) / 50;
        };

        this.moveTowardsPlayer = function() {
            this.goTo(player.corps.position, Config.dimCadri * 2);
        };

        this.explore = function() {
            // determine the case to go
            var c = map.getNextUnchartedCase();
            goTo(c.position, 0);
        };

    };

    return {
        newRobot: function(dbRobot, player, callbacks) {
            return new robot(dbRobot, player, callbacks);
        },
    };

});
