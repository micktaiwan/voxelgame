'use strict';

angular.module('gameApp.services.mainplayer', []).factory('MainPlayer', function($rootScope, $location, Db, Session, Game) {

    function player(_dbUser, callbacks) {
        // info player
        //console.log(_dbUser.pos);
        var dbUser = _dbUser;
        var id = dbUser.id;
        var positionNew = new THREE.Vector3(dbUser.pos.x, dbUser.pos.y, dbUser.pos.z);
        this.dummy = Game.addGetPutDummy();
        var distCamPlayer = Config.distCamPlayer;
        var distCollision = Config.dimCadri * 0.66;
        var _toggleInventoryCallback = callbacks.toggleInventoryCallback;

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

        var map = THREE.ImageUtils.loadTexture('images/ash_uvgrid01.jpg');
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;

        var material = new THREE.MeshLambertMaterial({
            ambient: 0xbbbbbb,
            map: map
        });
        var d = Config.dimCadri;
        var geometrytorse = new THREE.CubeGeometry(d, d, d);
        //    var material = new THREE.MeshLambertMaterial({color: 0xffff00});
        this.torse = new THREE.Mesh(geometrytorse, material);
        this.torse.castShadow = true;
        this.torse.receiveShadow = true;

        this.corps.add(this.torse);

        var geometrytete = new THREE.CubeGeometry(d / 2, d / 2, d / 2);
        this.tete = new THREE.Mesh(geometrytete, material);
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

        this.updateCamera = function() {
            this.camera.position.x += (this.tete.position.x - this.camera.position.x) / 10;
            this.camera.position.y += (this.tete.position.y - this.camera.position.y - Config.dimCadri / 2) / 10;
        };

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
            var distPut = 25;

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
                saut = 4.3;
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
            if (_toggleInventoryCallback) {
                safeApply($rootScope, function() {
                    _toggleInventoryCallback(dbUser.inventory);
                });
            }
        };

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
                //debugger;
                var objs = Game.getObjects();
                //console.log(key);
                Db.remove(objs[key].obj.id);
                //Game.removeCubeFromSceneByKey(key);
                var obj = Db.addInventory({
                    type: CubeTypes.WoodBlock
                }); // FIXME: type
                dbUser.inventory.push(obj);
                Game.addMessage({
                    text: 'ok, in inventory',
                    delay: 3,
                    type: 'info'
                });
            } else
                Game.addMessage({
                    text: 'No cube here !',
                    delay: 3,
                    type: 'error'
                });
        };

        this.canGet = function() {
            var objs = Game.getMeshObjects();
            var distGet = Config.dimCadri * 2; // FIXME: à améliorer
            var teteposabs = new THREE.Vector3(this.corps.position.x + this.tete.position.x, this.corps.position.y + this.tete.position.y, this.corps.position.z + this.tete.position.z)
            var vecteur = new THREE.Vector3(this.dummy.mesh.position.x - teteposabs.x, this.dummy.mesh.position.y - teteposabs.y, this.dummy.mesh.position.z - teteposabs.z).normalize();
            var raycaster = new THREE.Raycaster(teteposabs, vecteur);
            var intersects = raycaster.intersectObjects(objs);
            if (intersects.length > 0 && intersects[0].distance < distGet) {
                for (var key in objs) {
                    if (objs[key]['id'] == intersects[0].object.id) {
                        return key;
                    }
                }
            }
            return null;
        };

        this.putCube = function() {
            var cube = dbUser.inventory.pop();
            //console.log(cube);
            if (!cube) {
                Game.addMessage({
                    text: 'Nothing in inventory!',
                    delay: 3,
                    type: 'error'
                });
                return;
            }
            var key = this.canGet();
            if (key) {
                Game.addMessage({
                    text: 'There is a cube there',
                    delay: 3,
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
            Db.put(obj.x, obj.y, obj.z, cube.type);
            Db.removeInventory(cube.id);
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

    };

    return {
        newPlayer: function(_player, callbacks) {
            return new player(_player, callbacks);
        },
    };

});
