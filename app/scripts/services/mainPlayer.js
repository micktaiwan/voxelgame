'use strict';

angular.module('gameApp.services.mainplayer', []).factory('MainPlayer', function($rootScope, $location, Db, Session, Game) {

    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    };

    function player(_id, name, pos, playerUpdateCallback, toggleInventoryCallback) {

        if(!pos)
            pos = {x: 0, y: 0, z: 0};
        // info player
        var id = _id;
        var dbUser = null;
        Session.onUsersLoad(function() {
            dbUser = Session.getUser();
            //console.log(dbUser);
            //console.log("Inventory: "+dbUser.inventory);
            if(!dbUser.inventory) {
                var obj = Db.addInventory({type: CubeTypes.WoodBlock}); // attrs: {test: 'ok'}
                dbUser['inventory'] = [obj];
            }
            else {
                var array = $.map(dbUser.inventory, function(value, index) {
                    return [value];
                });
                dbUser.inventory = array;
            }
        });

        var dummy = Game.addGetPutDummy();
        var distCamPlayer = Config.distCamPlayer;
        var distCollision = 8;
        var _toggleInventoryCallback = toggleInventoryCallback;

        var audio = document.createElement('audio');
        var source = document.createElement('source');
        source.src = 'sounds/ammo_bounce.wav';
        audio.appendChild(source);
        audio.play();

        var canJump = true;
        var saut = 0;
        var positionNew = new THREE.Vector3(pos.x, pos.y, pos.z);

        this.name = name;
        this.jumping = false;
        this.corps = new THREE.Object3D();
        this.corps.position.copy(pos);

        var map = THREE.ImageUtils.loadTexture('images/ash_uvgrid01.jpg');
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;

        var material = new THREE.MeshLambertMaterial({ambient: 0xbbbbbb, map: map});
        var geometrytorse = new THREE.CubeGeometry(Config.dimCadri / 2, Config.dimCadri / 2, Config.dimCadri / 2);
        //    var material = new THREE.MeshLambertMaterial({color: 0xffff00});
        this.torse = new THREE.Mesh(geometrytorse, material);
        this.torse.castShadow = true;
        this.torse.receiveShadow = true;

        this.corps.add(this.torse);

        var geometrytete = new THREE.CubeGeometry(Config.dimCadri / 4, Config.dimCadri / 4, Config.dimCadri / 4);
        this.tete = new THREE.Mesh(geometrytete, material);
        this.tete.castShadow = true;
        this.tete.receiveShadow = true;
        this.tete.position.y = Config.dimCadri / 2;
        this.tete.position.z = -5;
        this.corps.add(this.tete);

        this.camera = new THREE.PerspectiveCamera(Config.viewwAngle, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.x += Math.sin(this.corps.rotation.y) * distCamPlayer;
        this.camera.position.z += Math.cos(this.corps.rotation.y) * distCamPlayer;
        this.tete.add(this.camera);

        this.updateCamera = function() {
            this.camera.position.x += (this.tete.position.x - this.camera.position.x) / 10;
            this.camera.position.y += (this.tete.position.y - this.camera.position.y - Config.dimCadri / 2) / 10;
        }

        this.move = function() {
            // if(! (this.moveForward || this.moveRight || this.moveLeft || this.moveBackward) ) return;
            // can't do that or getputdummy is not updated...
            var cm = this.canMove();
            if(cm && (cm.x != 0 || cm.z != 0)) {
                positionNew.copy(this.corps.position);
                positionNew.x += cm.x*Config.playerSpeed;
                positionNew.z += cm.z*Config.playerSpeed;
                this.corps.position.copy(positionNew);
                var pos = {x: positionNew.x, y: positionNew.y, z: positionNew.z};
                Db.updatePos(pos);
/*                safeApply($rootScope, function(){
                    playerUpdateCallback({pos: pos});
                });
*/            }
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

            if(this.moveForward) {
                deltaX[0] -= Math.sin(this.corps.rotation.y - pangle);
                deltaZ[0] -= Math.cos(this.corps.rotation.y - pangle);
                deltaX[1] -= Math.sin(this.corps.rotation.y);
                deltaZ[1] -= Math.cos(this.corps.rotation.y);
                deltaX[2] -= Math.sin(this.corps.rotation.y + pangle);
                deltaZ[2] -= Math.cos(this.corps.rotation.y + pangle);
            }
            if(this.moveBackward) {
                deltaX[0] += Math.sin(this.corps.rotation.y - pangle);
                deltaZ[0] += Math.cos(this.corps.rotation.y - pangle);
                deltaX[1] += Math.sin(this.corps.rotation.y);
                deltaZ[1] += Math.cos(this.corps.rotation.y);
                deltaX[2] += Math.sin(this.corps.rotation.y + pangle);
                deltaZ[2] += Math.cos(this.corps.rotation.y + pangle);
            }
            if(this.moveLeft) {
                deltaX[0] -= Math.sin(this.corps.rotation.y + Math.PI / 2 - pangle);
                deltaZ[0] -= Math.cos(this.corps.rotation.y + Math.PI / 2 - pangle);
                deltaX[1] -= Math.sin(this.corps.rotation.y + Math.PI / 2);
                deltaZ[1] -= Math.cos(this.corps.rotation.y + Math.PI / 2);
                deltaX[2] -= Math.sin(this.corps.rotation.y + Math.PI / 2 + pangle);
                deltaZ[2] -= Math.cos(this.corps.rotation.y + Math.PI / 2 + pangle);
            }
            if(this.moveRight) {
                deltaX[0] -= Math.sin(this.corps.rotation.y - Math.PI / 2 - pangle);
                deltaZ[0] -= Math.cos(this.corps.rotation.y - Math.PI / 2 - pangle);
                deltaX[1] -= Math.sin(this.corps.rotation.y - Math.PI / 2);
                deltaZ[1] -= Math.cos(this.corps.rotation.y - Math.PI / 2);
                deltaX[2] -= Math.sin(this.corps.rotation.y - Math.PI / 2 + pangle);
                deltaZ[2] -= Math.cos(this.corps.rotation.y - Math.PI / 2 + pangle);
            }

            var canBouge = {x: deltaX[1], z: deltaZ[1]};
            var objs = Game.getMeshObjects();
            //console.log(objs);
            //debugger;
            for (var i = 0; i < 3; i++) {
                var raycaster = new THREE.Raycaster(this.corps.position, new THREE.Vector3(deltaX[i] * distCollision, 0, deltaZ[i] * distCollision).normalize());
                var intersects = raycaster.intersectObjects(objs);

                if(intersects.length > 0 && intersects[0].distance < distCollision) {
                    audio.play();
                    canBouge = false;
                }
/*                if(Config.modeDebug) {
                    dummy[i].mesh.position.y = this.corps.position.y;
                    dummy[i].mesh.position.x = this.corps.position.x + deltaX[i] * distCollision;
                    dummy[i].mesh.position.z = this.corps.position.z + deltaZ[i] * distCollision;
                }
*/
            }
            var distPut = 25;

            // Grille
            dummy.mesh.position.y = Math.round((this.corps.position.y + Math.sin(this.tete.rotation.x) * distPut + Config.dimCadri / 2) / Config.dimCadri) * Config.dimCadri;
            dummy.mesh.position.x = Math.round((this.corps.position.x - Math.sin(this.corps.rotation.y) * distPut * Math.cos(this.tete.rotation.x)) / Config.dimCadri) * Config.dimCadri;
            dummy.mesh.position.z = Math.round((this.corps.position.z - Math.cos(this.corps.rotation.y) * distPut * Math.cos(this.tete.rotation.x)) / Config.dimCadri) * Config.dimCadri;
            return canBouge;
        };

        this.jump = function() {
            if(canJump && this.jumping == true) {
                canJump = false;
                saut = 4.3;
            }

            var canFall = true;
            var raycaster = new THREE.Raycaster(this.corps.position, new THREE.Vector3(0, -1, 0));
            var intersects = raycaster.intersectObjects(Game.getMeshObjects());
            if(intersects.length > 0 && intersects[0].distance < distCollision) {
                canFall = false;
            }

            if(saut < 0)
                this.jumping = false;

            if(canFall || this.jumping == true) {
                if(saut > -5)
                    saut -= 0.2;
                this.corps.position.y += saut;
            }
            else {
                if(saut < 0)
                    saut = 0;
                canJump = true;
                this.jumping = false;
            }
        };

        this.toggleInventory = function() {
            if(_toggleInventoryCallback) {
                safeApply($rootScope, function(){
                    _toggleInventoryCallback(dbUser.inventory);
                });
            }
        };

        this.getCube = function() {
            var key = this.canGet();
            if(key) {
                //debugger;
                var objs = Game.getObjects();
                //console.log(key);
                Db.remove(objs[key].obj.id);
                //Game.removeCubeFromSceneByKey(key);
                var obj = Db.addInventory({type: CubeTypes.WoodBlock}); // FIXME: type
                dbUser.inventory.push(obj);
                Game.addMessage(key + ' (' + obj.id + ')' + ' put in inventory');
            }
            else
                console.log('no cube here !');
        };

        this.canGet = function() {
            var objs = Game.getMeshObjects();
            var distGet = Config.dimCadri; // FIXME: à ameliorer
            var teteposabs = new THREE.Vector3(this.corps.position.x + this.tete.position.x, this.corps.position.y + this.tete.position.y, this.corps.position.z + this.tete.position.z)
            var vecteur = new THREE.Vector3(dummy.mesh.position.x - teteposabs.x, dummy.mesh.position.y - teteposabs.y, dummy.mesh.position.z - teteposabs.z).normalize();
            var raycaster = new THREE.Raycaster(teteposabs, vecteur);
            var intersects = raycaster.intersectObjects(objs);
            if(intersects.length > 0 && intersects[0].distance < distGet) {
                for (var key in objs) {
                    if(objs[key]['id'] == intersects[0].object.id) {
                        return key;
                    }
                }
            }
            return null;
        };

        this.putCube = function() {
            var key = this.canGet();
            if(key) {
                Game.addMessage('There is a cube there');
                return;
            }
            //dummy.mesh.visible = false;
            var obj = {x: dummy.mesh.position.x / Config.dimCadri, y: dummy.mesh.position.y / Config.dimCadri, z: dummy.mesh.position.z / Config.dimCadri};
            Db.put(obj.x, obj.y, obj.z, CubeTypes.WoodBlock);
        };

        this.setCamDist = function(distCamPlayer) {
            var limit = 5;
            var dist = distCamPlayer;
            if(dist < limit) dist = limit ;
            this.camera.position.x = this.tete.position.x + Math.sin(this.tete.rotation.y) * dist;
            this.camera.position.z = this.tete.position.z + Math.cos(this.tete.rotation.y) * dist;
            if(distCamPlayer < limit) {
                this.camera.fov = Config.viewAngle - distCamPlayer/1.5;
                this.camera.updateProjectionMatrix();
            } else if(this.camera.fov!= Config.viewAngle) {
                this.camera.fov = Config.viewAngle;
                this.camera.updateProjectionMatrix();
            }
        };

        this.camdist = function(delta) {
            distCamPlayer -= delta / 30;
            if(distCamPlayer < -60) distCamPlayer = -60;
            if(distCamPlayer > 300) distCamPlayer = 300;
            this.setCamDist(distCamPlayer);
        };

        this.setCamDist(Config.distCamPlayer);

    }
    return {

        newPlayer: function(id, name, pos, playerUpdateCallback, toggleInventoryCallback) {
            return new player(id, name, pos, playerUpdateCallback, toggleInventoryCallback);
        },

    };

});
