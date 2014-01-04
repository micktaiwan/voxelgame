'use strict';

angular.module('gameApp.services.robot', []).factory('Robot', function($rootScope, $location, Db, Game, Map) {

    function robot(dbRobot, player, callbacks) {
        // console.log(dbRobot);
        this.dbRobot = dbRobot;

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

        this.active = true;
        var memory = Map.newMap();
        var pathfinder = Map.newPF(); //var path = pf.find(memory, memory.first(), memory.last());
        var path = [];
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
            if (!this.active) return;
            //console.log("update");
            //this.moveTowardsPlayer();
            //randomizeMove(this.body, 0.2);
            this.explore();
        };

        var rspeed = 30;

        function respectMinDist(dist, minDist) {
            if (Math.abs(dist) < minDist) {
                if (dist < 0)
                    dist += rspeed;
                else
                    dist -= rspeed;
            }
            return dist;
        }

        this.goTo = function(pos, minDist) {
            var xdist = pos.x - this.body.position.x;
            var zdist = pos.z - this.body.position.z;
            xdist = respectMinDist(xdist, minDist);
            zdist = respectMinDist(zdist, minDist);
            var ydist = pos.y - this.body.position.y;
            if (ydist > 5) { // if climbing first move y
                this.body.position.y += (ydist) / (rspeed / Config.speedFactor);
                return;
            }
            if (xdist > 5 || zdist > 5) { // if descending first move x and y
                this.body.position.x += (xdist) / (rspeed / Config.speedFactor);
                this.body.position.z += (zdist) / (rspeed / Config.speedFactor);
                return;
            }
            // else
            this.body.position.y += (ydist) / (rspeed / Config.speedFactor);
            this.body.position.x += (xdist) / (rspeed / Config.speedFactor);
            this.body.position.z += (zdist) / (rspeed / Config.speedFactor);
        };

        this.moveTowardsPlayer = function() {
            this.goTo(player.corps.position, Config.dimCadri * 2);
        };

        this.distanceFromPlayer = function() {
            var r = this.body.position;
            var p = player.corps.position;
            var dist = Math.sqrt(Math.pow((r.x - p.x), 2) + Math.pow((r.y - p.y), 2) + Math.pow((r.z - p.z), 2));
            return Math.round(dist / Config.dimCadri);
        }

        this.printPos = function() {
            var pos = this.getCurrentPosCubePos();
            return '(' + pos.x + ',' + pos.y + ',' + pos.z + ')';
        }

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

        function getNext(neighbors) {
            var next;
            while (next = neighbors.pop()) {
                // not in memory and nothing on it (in real map)
                if (!memory.getById(next.id) && Map.getCubeById(next.id).neighbors[1][2][1] == null)
                    return next;
            }
            return null;
        }

        var rewind = 0;
        this.getNextUnchartedCube = function() {
            if (memory.size() == 0) {
                var c = this.getRealCubeByCurrentPos();
                if (!c) {
                    console.error('no cube on current pos');
                    c = Map.first();
                }
                return c;
            };
            // FIXME: no need to do that every time, we should already know where we are (but what do we do do if the cube disappeared?)
            var pos = this.getCurrentPosCubePos();
            var c = Map.getCubeById(memory.getByPos(pos.x, pos.y - 1, pos.z).id);

            var neighbors = c.getNeighborsOnlyAdjacents();
            var next = getNext(neighbors);
            if (next) return next;

            rewind = 1;
            while (rewind < memory.size() && !getNext(Map.getCubeById(memory.rewind(rewind).id).getNeighborsOnlyAdjacents()))
                rewind += 1;
            //console.log('Rewinded ' + rewind + ' cubes');
            if (rewind == memory.size()) {
                this.active = false;
                console.log('All neighbors in memory!');
            }
            // do pathfinding to it

            path = pathfinder.find(memory, c, memory.rewind(rewind));
            if (path.length == 0) {
                throw 'no path to cube ???';
            }
            //console.log('found a path to rewind ' + rewind + ' in ' + (path.length - 1) + ' cubes');
            return path[0];
        };

        var cubeToGo = null;

        // FIXME: does not know when the world has changed, memory is not updated
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

            if (path.length > 0) { // we are currently going to cube by pathfinding
                //console.log(path.length + ' cubes to go in path');
                cubeToGo = path[0];
                path.splice(0, 1);
            } else {
                cubeToGo = this.getNextUnchartedCube();
            }
            if (!cubeToGo) {
                console.log('no cube to go');
                return;
            }
            if (!memory.getById(cubeToGo.id)) {
                memory.addCube(cubeToGo);
                rewind = 0;
            } //else console.log('cube already in memory');

            //console.log(cubeToGo.getNeighbors().length + ' new neighbors for (' + cubeToGo.x + ',' + cubeToGo.y + ',' + cubeToGo.z + ')');

            var size = memory.size();
            if (size != lastMemorySize) {
                lastMemorySize = size;
                //console.log('memory size: ' + size);
            }
        };

    };

    return {
        newRobot: function(dbRobot, player, callbacks) {
            return new robot(dbRobot, player, callbacks);
        },
    };

});
