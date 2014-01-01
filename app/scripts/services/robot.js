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

        var active = true;
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
            if (!active) return;
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
            this.body.position.x += (dist) / (30 / Config.speedFactor);

            dist = pos.y - this.body.position.y;
            var s;
            if (dist > 0) s = 10;
            else s = 30;
            this.body.position.y += (dist) / (s / Config.speedFactor);

            dist = pos.z - this.body.position.z;
            if (Math.abs(dist) < minDist) {
                if (dist < 0)
                    dist += 50;
                else
                    dist -= 50;
            }
            this.body.position.z += (dist) / (30 / Config.speedFactor);
        };

        this.moveTowardsPlayer = function() {
            this.goTo(player.corps.position, Config.dimCadri * 2);
        };

        // get a real map case, not the memory

        this.getCurrentPosCubePos = function() {
            return {
                x: Math.round(this.body.position.x / Config.dimCadri),
                y: Math.round(this.body.position.y / Config.dimCadri),
                z: Math.round(this.body.position.z / Config.dimCadri)
            };
        }

        this.getRealCubeByCurrentPos = function() {
            var c = this.getCurrentPosCubePos();
            return Map.getCubeByPos(c.x, c.y - 1, c.z);
        };

        var counter = 0;
        var rewind = 0;
        this.getNextUnchartedCube = function() {
            if (memory.size() == 0) {
                var c = this.getRealCubeByCurrentPos();
                if (!c)
                    console.error('no cube on current pos');
                return c;
            };
            var pos = this.getCurrentPosCubePos();

            // TODO: too simple
            var c = Map.getCubeById(memory.getByPos(pos.x, pos.y - 1, pos.z).id);

            var neighbors = c.getNeighborsWithoutCorners();
            var next;
            while (next = neighbors.pop()) {
                // not in memory and nothing on it
                // TODO: too simple
                if (!memory.getById(next.id) && next.neighbors[1][2][1] == null)
                    return next;
            }
            /*
            counter += 1;
            if (counter > 2)
                active = false;
            */
            rewind += 1;
            console.log('Rewind: ' + rewind);
            if (rewind == memory.size()) {
                active = false;
                console.log('All neighbors in memory!');
            }
            return memory.rewind(rewind);
            //return null; // TODO: construct a tree of choices, do a pathfinding to rewind back to a previous choice
        };

        var cubeToGo = null;

        this.explore = function() {
            // determine the case to go

            if (cubeToGo) {
                var currentPos = this.getCurrentPosCubePos();
                //console.log(currentPos);
                //console.log(cubeToGo);
                if (currentPos.x == cubeToGo.x && currentPos.y - 1 == cubeToGo.y && currentPos.z == cubeToGo.z) {
                    cubeToGo = null;
                    //console.log('reached!');
                    return;
                }

                //console.log('going to', cubeToGo.x, cubeToGo.y, cubeToGo.z, 'from', currentPos.x, currentPos.y, currentPos.z);

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
            if (!memory.getById(cubeToGo.id)) {
                memory.addCube(cubeToGo);
                rewind = 0;
            }
            else console.log('cube already in memory');

            //console.log(cubeToGo.getNeighbors().length + ' new neighbors for (' + cubeToGo.x + ',' + cubeToGo.y + ',' + cubeToGo.z + ')');

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
