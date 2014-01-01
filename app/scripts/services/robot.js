'use strict';

angular.module('gameApp.services.robot', []).factory('Robot', function($rootScope, $location, Db, Game, Map) {

    function robot(dbRobot, player, callbacks) {
        // console.log(dbRobot);

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

        var memory = Map.newMap();
        var lastMemorySize = null;
        this.body = new THREE.Object3D();
        this.body.position.copy(dbRobot.pos);
        var initialPos = {
            x: Math.floor(this.body.position.x / Config.dimCadri),
            y: Math.floor(this.body.position.y / Config.dimCadri),
            z: Math.floor(this.body.position.z / Config.dimCadri)
        }

        var mapping = THREE.ImageUtils.loadTexture('images/ash_uvgrid01.jpg');
        mapping.wrapS = mapping.wrapT = THREE.RepeatWrapping;
        mapping.anisotropy = 16;

        var material = new THREE.MeshLambertMaterial({
            ambient: 0xffffff,
            map: mapping
        });
        var d = Config.dimCadri / 2;
        var geometrytorso = new THREE.CubeGeometry(d, d, d);
        this.torso = new THREE.Mesh(geometrytorso, material);
        this.torso.castShadow = true;
        this.torso.receiveShadow = true;

        this.body.add(this.torso);

        this.update = function() {
            //console.log("update");
            //this.moveTowardsPlayer();
            //randomizeMove(this.body, 0.2);
            this.explore();
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

        // get a real map case, not the memory

        this.getCurrentPosCubePos = function() {
            return {
                x: Math.floor(this.body.position.x / Config.dimCadri),
                y: Math.floor(this.body.position.y / Config.dimCadri),
                z: Math.floor(this.body.position.z / Config.dimCadri)
            };
        }

        this.getRealCubeByCurrentPos = function() {
            var c = this.getCurrentPosCubePos();
            return Map.getCubeByPos(c.x, c.y, c.z);
        };

        this.getNextUnchartedCube = function() {
            if (memory.size() == 0) {
                var c = this.getRealCubeByCurrentPos();
                if(!c) console.error('no cube on current pos');
                return c;
            };
            var c = Map.getCubeById(memory.last().id);
            var neighbors = c.getNeighbors();
            console.log(c.x, c.y, c.z);
            console.log(neighbors.length + ' neighbors');
            var next;
            while (next = neighbors.pop()) {
                if (!memory.getById(next.id)) return next;
            }
            return null; // TODO: construct a tree of choices, do a pathfinding to rewind back to a previous choice
        };

        var cubeToGo = null;

        this.explore = function() {
            // determine the case to go

            if (cubeToGo) {
                var currentPos = this.getCurrentPosCubePos();
                //console.log(currentPos);
                //console.log(cubeToGo);
                if (currentPos.x == cubeToGo.x && currentPos.y == cubeToGo.y && currentPos.z == cubeToGo.z) {
                    cubeToGo = null;
                    console.log('reached!');
                    return;
                }
                this.goTo({
                    x: cubeToGo.x * Config.dimCadri,
                    y: (cubeToGo.y + 1) * Config.dimCadri,
                    z: cubeToGo.z * Config.dimCadri
                }, 0);
                return;
            }

            cubeToGo = this.getNextUnchartedCube();
            if (!cubeToGo) {
                console.log('no cube to go');
                return;
            }
            if (!memory.getById(cubeToGo.id))
                memory.addCube(cubeToGo);
            else console.log('should not happen');

            console.log(cubeToGo.getNeighbors().length + ' new neighbors!');

            var size = memory.size();
            if (size != lastMemorySize) {
                lastMemorySize = size;
                console.log('memory size: ' + size);
            }
        };

    };

    return {
        newRobot: function(dbRobot, player, callbacks) {
            return new robot(dbRobot, player, callbacks);
        },
    };

});
