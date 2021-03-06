'use strict';

angular.module('gameApp.services.mainplayer', []).factory('MainPlayer', function($rootScope, $location, Db, Session, Game, Robot, Map) {

    function player(dbUser, callbacks) {
        // info player
        //console.log(_dbUser.pos);
        this.dbUser = dbUser;
        var selectedObject = null;
        sortInventory();
        selectNextInventoryObject(0);
        var id = dbUser.id;
        var positionNew = new THREE.Vector3(dbUser.pos.x, dbUser.pos.y, dbUser.pos.z);
        this.dummy = Game.addGetPutDummy();
        var distCamPlayer = Config.distCamPlayer;
        var distCollision = Config.dimCadri * 0.66;

        var audio = document.createElement('audio');
        var source = document.createElement('source');
        source.src = 'sounds/ammo_bounce.wav';
        audio.appendChild(source);
        audio.play();

        this.name = name;
        var canJump = true;
        var saut = 0;
        this.jumping = false;

        this.corps = new THREE.Object3D();
        this.corps.position.copy(dbUser.pos);

        var materials = [
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body1.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body2.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body3.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body4.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body5.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body6.jpg')
            })
        ];

        var d = Config.dimCadri;
        var geometrytorse = new THREE.CubeGeometry(d, d, d / 2);
        this.torse = new THREE.Mesh(geometrytorse, new THREE.MeshFaceMaterial(materials));
        this.torse.castShadow = true;
        this.torse.receiveShadow = true;

        this.corps.add(this.torse);

        var materials = [
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body1.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body2.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body3.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body4.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/head5.jpg')
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body6.jpg')
            })
        ];

        var geometrytete = new THREE.CubeGeometry(d / 2, d / 2, d / 2);
        this.tete = new THREE.Mesh(geometrytete, new THREE.MeshFaceMaterial(materials));
        this.tete.castShadow = true;
        this.tete.receiveShadow = true;
        this.tete.position.y = d;
        this.tete.position.z = -d / 4;
        this.corps.add(this.tete);

        this.camera = new THREE.PerspectiveCamera(Config.viewwAngle, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.x += Math.sin(this.corps.rotation.y) * distCamPlayer;
        this.camera.position.z += Math.cos(this.corps.rotation.y) * distCamPlayer;
        this.tete.add(this.camera);

        this.corps.rotation.y = dbUser.rot.corps;
        this.tete.rotation.x = dbUser.rot.tete;

        this.robots = [];
        for (var i = 0; i < dbUser.robots.length; i++) {
            this.robots.push(new Robot.newRobot(dbUser.robots[i], this, {}));
        };
        callbacks.updateRobots(this.robots);

        this.updateRobots = function() {
            this.robots.forEach(function(r) {
                r.update();
            });
        };

        this.updateCamera = function() {
            this.camera.position.x += (this.tete.position.x - this.camera.position.x) / 10;
            this.camera.position.y += (this.tete.position.y - this.camera.position.y - Config.dimCadri / 2) / 10;
        };

        this.rotate = function(corps, tete) {
            this.corps.rotation.y -= corps * 0.002;
            this.tete.rotation.x -= tete * 0.002;
            if (this.tete.rotation.x > Math.PI / 2) this.tete.rotation.x = Math.PI / 2;
            if (this.tete.rotation.x < -Math.PI / 2) this.tete.rotation.x = -Math.PI / 2;
        }

        this.move = function() {
            // if(! (this.moveForward || this.moveRight || this.moveLeft || this.moveBackward) ) return;
            // can't do that or getputdummy is not updated...
            var cm = this.canMove();
            if (cm && (cm.x != 0 || cm.z != 0)) {
                positionNew.copy(this.corps.position);
                positionNew.x += cm.x * Config.playerSpeed * Config.speedFactor;
                positionNew.z += cm.z * Config.playerSpeed * Config.speedFactor;
                this.corps.position.copy(positionNew);
                var pos = {
                    x: positionNew.x,
                    y: positionNew.y,
                    z: positionNew.z
                };
                /*
                var cube = Map.getCubeByPos(Math.round(pos.x / Config.dimCadri), Math.round(pos.y / Config.dimCadri) - 1, Math.round(pos.z / Config.dimCadri));
                if (cube) {
                    var neighbors = cube.getNeighbors();
                    console.log('ok ' + neighbors.length);
                    for (var i in neighbors) {
                        var rc = Game.getCubeFromSceneById(neighbors[i]);
                        if (rc) {
                            rc.mesh.rotation.y += 0.2;
                            //console.log(rc.mesh);
                        }
                    }
                }
*/
                Db.updatePos(pos);
                if (Config.randomCubeRotation && !this.jumping) {
                    var rot = {
                        rotation: {
                            x: 0,
                            y: 0,
                            z: 0
                        }
                    }
                    randomizeRot(rot, 0.02);
                    copyVector(this.torse.rotation, rot.rotation);
                }
                /*
                safeApply($rootScope, function(){
                    callbacks.playerUpdateCallback({pos: pos});
                });
                */
            }
        };

        this.canMove = function() {

            var deltaX = [];
            var deltaZ = [];
            var pangle = Math.PI / 4;
            deltaX[0] = 0;
            deltaZ[0] = 0;
            deltaX[1] = 0;
            deltaZ[1] = 0;
            deltaX[2] = 0;
            deltaZ[2] = 0;

            if (this.moveForward) {
                deltaX[0] -= Math.sin(this.corps.rotation.y - pangle);
                deltaZ[0] -= Math.cos(this.corps.rotation.y - pangle);
                deltaX[1] -= Math.sin(this.corps.rotation.y);
                deltaZ[1] -= Math.cos(this.corps.rotation.y);
                deltaX[2] -= Math.sin(this.corps.rotation.y + pangle);
                deltaZ[2] -= Math.cos(this.corps.rotation.y + pangle);
            }
            if (this.moveBackward) {
                deltaX[0] += Math.sin(this.corps.rotation.y - pangle);
                deltaZ[0] += Math.cos(this.corps.rotation.y - pangle);
                deltaX[1] += Math.sin(this.corps.rotation.y);
                deltaZ[1] += Math.cos(this.corps.rotation.y);
                deltaX[2] += Math.sin(this.corps.rotation.y + pangle);
                deltaZ[2] += Math.cos(this.corps.rotation.y + pangle);
            }
            if (this.moveLeft) {
                deltaX[0] -= Math.sin(this.corps.rotation.y + Math.PI / 2 - pangle);
                deltaZ[0] -= Math.cos(this.corps.rotation.y + Math.PI / 2 - pangle);
                deltaX[1] -= Math.sin(this.corps.rotation.y + Math.PI / 2);
                deltaZ[1] -= Math.cos(this.corps.rotation.y + Math.PI / 2);
                deltaX[2] -= Math.sin(this.corps.rotation.y + Math.PI / 2 + pangle);
                deltaZ[2] -= Math.cos(this.corps.rotation.y + Math.PI / 2 + pangle);
            }
            if (this.moveRight) {
                deltaX[0] -= Math.sin(this.corps.rotation.y - Math.PI / 2 - pangle);
                deltaZ[0] -= Math.cos(this.corps.rotation.y - Math.PI / 2 - pangle);
                deltaX[1] -= Math.sin(this.corps.rotation.y - Math.PI / 2);
                deltaZ[1] -= Math.cos(this.corps.rotation.y - Math.PI / 2);
                deltaX[2] -= Math.sin(this.corps.rotation.y - Math.PI / 2 + pangle);
                deltaZ[2] -= Math.cos(this.corps.rotation.y - Math.PI / 2 + pangle);
            }

            var canBouge = {
                x: deltaX[1],
                z: deltaZ[1]
            };
            var objs = Game.getMeshObjects();
            //console.log(objs);
            //debugger;
            for (var i = 0; i < 3; i++) {
                var raycaster = new THREE.Raycaster(this.corps.position, new THREE.Vector3(deltaX[i] * distCollision, 0, deltaZ[i] * distCollision).normalize());
                var intersects = raycaster.intersectObjects(objs);

                if (intersects.length > 0 && intersects[0].distance < distCollision) {
                    audio.play();
                    canBouge = false;
                }
                /*
                if(Config.modeDebug) {
                    dummy[i].mesh.position.y = this.corps.position.y;
                    dummy[i].mesh.position.x = this.corps.position.x + deltaX[i] * distCollision;
                    dummy[i].mesh.position.z = this.corps.position.z + deltaZ[i] * distCollision;
                }
                */
            }
            var distPut = Config.dimCadri + 5;

            // Grille
            this.dummy.mesh.position.y = Math.round((this.corps.position.y + Math.sin(this.tete.rotation.x) * distPut + Config.dimCadri / 2) / Config.dimCadri) * Config.dimCadri;
            this.dummy.mesh.position.x = Math.round((this.corps.position.x - Math.sin(this.corps.rotation.y) * distPut * Math.cos(this.tete.rotation.x)) / Config.dimCadri) * Config.dimCadri;
            this.dummy.mesh.position.z = Math.round((this.corps.position.z - Math.cos(this.corps.rotation.y) * distPut * Math.cos(this.tete.rotation.x)) / Config.dimCadri) * Config.dimCadri;
            return canBouge;
        };

        this.jump = function(isJumping) {
            if (isJumping) this.jumping = true;

            if (canJump && this.jumping == true) {
                canJump = false;
                saut = 6;
            }

            var canFall = true;
            var raycaster = new THREE.Raycaster(this.corps.position, new THREE.Vector3(0, -1, 0));
            var intersects = raycaster.intersectObjects(Game.getMeshObjects());
            if (intersects.length > 0 && intersects[0].distance < distCollision) { // FIXME: too simple. Does not take into account the object or player size
                canFall = false;
                //this.corps.position.y = intersects[0].object.position.y + Config.dimCadri; // FIXME: should be the player body size
                //console.log(intersects[0]);
                //debugger;
            }

            if (saut < 0)
                this.jumping = false;

            if (canFall || this.jumping == true) {
                if (saut > -5)
                    saut -= 0.2 * Config.speedFactor;
                this.corps.position.y += saut;
            } else {
                if (saut < 0)
                    saut = 0;
                canJump = true;
                this.jumping = false;
            }
        };

        this.toggleInventory = function() {
            if (callbacks.toggleInventoryCallback && callbacks.updateInventoryCallback) {
                safeApply($rootScope, function() {
                    callbacks.updateInventoryCallback(dbUser.inventory, selectedObject)
                    callbacks.toggleInventoryCallback();
                });
            }
        };

        function getInventoryObjectById(id) {
            var rv = null;
            dbUser.inventory.some(function(s) {
                if (s.id == id) {
                    rv = s;
                    return;
                }
            });
            return rv;
        }

        function getInventoryIndexById(id) {
            var objects = dbUser.inventory;
            for (var key in objects) {
                if (objects[key].id == id) {
                    return key;
                }
            }
            return null;
        }

        function sortInventory() {
            if (!dbUser.inventory) return;
            dbUser.inventory.sort(function(a, b) {
                return ((a.display < b.display) ? -1 : 1);
            });
        }

        this.getCube = function() {
            if (dbUser.inventory.length >= Config.maxInventory) {
                Game.addMessage({
                    text: 'Too many objects in inventory',
                    delay: 5,
                    type: 'error'
                });
                return;
            }
            var key = this.canGet();
            if (key) {
                var obj = Game.getObjects()[key].obj;
                Db.remove(obj.id); // will call onCube 'removed' and Game.removeCubeFromSceneByKey(key);
                var obj = Db.addInventory({
                    type: obj.type
                });
                dbUser.inventory.push(obj);
                sortInventory();
                selectedObject = obj;
                callbacks.updateInventoryCallback(dbUser.inventory, obj);
                Game.addMessage({
                    text: 'ok, in inventory',
                    delay: 3,
                    type: 'info'
                });
            } else {
                Game.addMessage({
                    text: 'No cube here !',
                    delay: 3,
                    type: 'error'
                });
            }
        };

        function getCubeByCoords(pos) {
            var objs = Game.getMeshObjects();
            for (var key in objs) {
                if (objs[key].position.x == pos.x && objs[key].position.y == pos.y && objs[key].position.z == pos.z) {
                    return key;
                }
            }
            return null;
        }

        this.canGet = function() {
            return getCubeByCoords(this.dummy.mesh.position);
        };

        function selectNextInventoryObject(index) {
            if (dbUser.inventory.length == 0) {
                selectedObject = null;
            } else {
                if (!index) index = 0;
                while (index >= dbUser.inventory.length) index--;
                selectedObject = dbUser.inventory[index];
                callbacks.updateInventoryCallback(dbUser.inventory, selectedObject);
            }
        }

        this.putCube = function() {
            //console.log(dbUser.inventory);
            var key = this.canGet();
            if (key) {
                Game.addMessage({
                    text: 'There is a cube there',
                    delay: 2,
                    type: 'error'
                });
                return;
            }

            if (!selectedObject) {
                Game.addMessage({
                    text: 'Nothing in hand!',
                    delay: 2,
                    type: 'error'
                });
                return;
            }
            //dummy.mesh.visible = false;
            var obj = {
                x: this.dummy.mesh.position.x / Config.dimCadri,
                y: this.dummy.mesh.position.y / Config.dimCadri,
                z: this.dummy.mesh.position.z / Config.dimCadri
            };
            //console.log(selectedObject);
            Db.put(obj.x, obj.y, obj.z, selectedObject.type);
            Db.removeInventory(selectedObject.id);
            var index = getInventoryIndexById(selectedObject.id);
            dbUser.inventory.splice(index, 1);
            callbacks.updateInventoryCallback(dbUser.inventory);
            selectNextInventoryObject(index);

            //console.log(dbUser.inventory.length);
        };

        this.setCamDist = function(distCamPlayer) {
            var limit = 5;
            var dist = distCamPlayer;
            if (dist < limit) dist = limit;
            this.camera.position.x = this.tete.position.x + Math.sin(this.tete.rotation.y) * dist;
            this.camera.position.z = this.tete.position.z + Math.cos(this.tete.rotation.y) * dist;
            if (distCamPlayer < limit) {
                this.camera.fov = Config.viewAngle - distCamPlayer / 1.5;
                this.camera.updateProjectionMatrix();
            } else if (this.camera.fov != Config.viewAngle) {
                this.camera.fov = Config.viewAngle;
                this.camera.updateProjectionMatrix();
            }
        };

        this.camdist = function(delta) {
            distCamPlayer -= delta / 10;
            if (distCamPlayer < -60) distCamPlayer = -60;
            //if (distCamPlayer > 300) distCamPlayer = 300;
            this.setCamDist(distCamPlayer);
        };

        this.setCamDist(Config.distCamPlayer);

        this.setSelectedObject = function(obj) {
            selectedObject = getInventoryObjectById(obj.id);
        };

        this.createRobot = function() {
            var dbRobot = Db.addRobot({
                type: 'holefiller'
            });
            var robot = new Robot.newRobot(dbRobot, this, {});
            this.robots.push(robot);
            Game.addRobot(robot);
        }

    };

    return {
        newPlayer: function(_player, callbacks) {
            player = new player(_player, callbacks);
            return player;
        },
    };

});
