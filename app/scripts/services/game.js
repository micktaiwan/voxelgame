'use strict';

angular.module('gameApp.services.game', []).factory('Game', function($rootScope, $location, Db) {

    var rendererStats = new THREEx.RendererStats();
    rendererStats.domElement.style.position = 'absolute';
    rendererStats.domElement.style.left = '0px';
    rendererStats.domElement.style.bottom = '0px';
    document.body.appendChild(rendererStats.domElement);

    var WoodBlock = 1;

    var $game_div;
    var modeDebug = false;
    //var dim = [24, 20, 24]; // x=largeur, y = hauteur, z=profondeur
    var dimCadri = 20; // dimensions cadrillage;
    var scene, renderer;
    var geometry, material, mesh;
    var time = Date.now();
    var players = [];
    var player; // the one who actually play
    var distCamPlayer = 0;

    var dummy = [];

    var geometry = new THREE.CubeGeometry(dimCadri, dimCadri, dimCadri);
    var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});

    var velocity = new THREE.Vector3();
    var canMove = false;

    var light, light2;
    var objects = [];

    var PI = Math.PI;

    function copyVector(to, from) { // FIXME: pas sur que ça serve...
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
    }
    ;

    // Db.updateRot({ corps: player.corps.rotation.y, tete: player.tete.rotation.x });
    function copyRotation(to, from) {
        to.corps.rotation.y = from.corps;
        to.tete.rotation.x = from.tete;
    }
    ;

    function init(_player) {
        player = _player;
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x444444, 0, 600);
        light = new THREE.DirectionalLight(0x999988, 1.5);
        light.position.set(1, 1, 1);
        scene.add(light);
        light = new THREE.DirectionalLight(0xffff00, 1.5);
        light.position.set(-1, -1, -1);
        scene.add(light);
        light2 = new THREE.PointLight(0xffffff, 2, 50);
        light2.position.set(-1, 1, -1);
        scene.add(light2);
        scene.add(player.corps);

// helper get et put cube
        dummy[10] = new dummyC();
        scene.add(dummy[10].mesh); // dummy libre
        dummy[11] = new dummyC();
        scene.add(dummy[11].mesh); // dummy sur grille

        // mode debug
        if(modeDebug)
            modeDebug();

        // floor
        /*        for (var iz = -dim[2] / 2; iz < dim[2] / 2; iz++) {
         for (var ix = -dim[0] / 2; ix < dim[0] / 2; ix++) {
         //new cubeC({x: ix * dimCadri, y: 0, z: iz * dimCadri});
         Db.put(ix * dimCadri, 0, iz * dimCadri, WoodBlock);
         }
         }
         */
        // plafond
        /*        for (var iz = -dim[2] * 2; iz < dim[2] * 2; iz++) {
         for (var ix = -dim[0] * 2; ix < dim[0] * 2; ix++) {
         if(ix < dim[0] && ix > -dim[0] && iz < dim[2] && iz > -dim[2]) {
         //console.log(ix + ' ' + iz);
         }
         else
         new cubeC({x: ix * dimCadri, y: dim[1] * dimCadri, z: iz * dimCadri});
         }
         }
         */
        // objects
        /*        for (var i = 0; i < 500; i++) {
         new cubeC({x: posRnd(dimCadri / 2), y: posRnd(), z: posRnd(dimCadri / 2)});
         }
         */
        //
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x447777);
        $game_div = $('#game');
        onWindowResize();

        //document.body.appendChild(renderer.domElement);
        $game_div.append(renderer.domElement);

        //
        window.addEventListener('resize', onWindowResize, false);

        control();
        Db.onCube(onCube);
    };


    function getCubeFromScene(obj) {
        for (var key in objects) {
            if(objects[key].position.x / dimCadri == obj.x && objects[key].position.y / dimCadri == obj.y && objects[key].position.z / dimCadri == obj.z) {
                return key;
            }
        }
        return null;
    }

    function addCubeToScene(obj) {
        if(getCubeFromScene(obj)) {
            //console.log('already there ('+obj.x+','+obj.y+','+obj.z+')');
            return;
        }
        var mesh = new THREE.Mesh(geometry, cubeMaterial);
        mesh.position.x = obj.x * dimCadri;
        mesh.position.y = obj.y * dimCadri;
        mesh.position.z = obj.z * dimCadri;
        scene.add(mesh);
        objects.push(mesh);
    };

    function removeCubeFromScene(obj) {
        var key = getCubeFromScene(obj);
        if(!key) return;
        scene.remove(objects[key]);
        objects.splice(key, 1);
    };

    // type: 'added', 'changed', 'removed'
    // obj: the cube (id, x, y, z, type, user_id)
    function onCube(type, obj) {
        console.log('cube '+type+' on ' + obj.x + ', ' + obj.y + ', ' + obj.z);
        if(type=="added") {
            addCubeToScene(obj);
        } else if(type=="removed") {
            removeCubeFromScene(obj);
        } else {
            console.log('unknown onCube type '+type);
        }
    };

    function onWindowResize() {
        player.camera.aspect = window.innerWidth / window.innerHeight;
        player.camera.updateProjectionMatrix();
        var width = window.innerWidth - $game_div[0].offsetLeft * 2;
        var height = window.innerHeight - $game_div[0].offsetTop * 2;
        renderer.setSize(width, height);
        $game_div[0].style.width = width;
        $game_div[0].style.height = height;
    }

    function control() {

        var onMouseMove = function(event) {
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            player.corps.rotation.y -= movementX * 0.002;
            player.tete.rotation.x -= movementY * 0.002;

            player.camera.position.x += movementX * 0.01;
            player.camera.position.y -= movementY * 0.01;

            if(player.tete.rotation.x < -PI / 2)
                player.tete.rotation.x = -PI / 2;
            if(player.tete.rotation.x > PI / 2)
                player.tete.rotation.x = PI / 2;

            Db.updateRot({corps: player.corps.rotation.y, tete: player.tete.rotation.x});
        };

        var onKeyDown = function(event) {
            switch (event.keyCode) {

                case 90: // z
                    player.moveForward = true;
                    break;
                case 81: // q
                    player.moveLeft = true;
                    break;
                case 83: // s
                    player.moveBackward = true;
                    break;
                case 68: // d
                    player.moveRight = true;
                    break;
                case 32: // space
                    player.jumping = true;
                    player.jump();
                    break;
                case 65: // a
                    player.getCube();
                    break;
                case 69: // e
                    player.putCube();
                    break;
            }
        };

        var onKeyUp = function(event) {
            switch (event.keyCode) {

                case 38: // up
                case 90: // z
                    player.moveForward = false;
                    break;
                case 37: // left
                case 81: // q
                    player.moveLeft = false;
                    break;
                case 40: // down
                case 83: // s
                    player.moveBackward = false;
                    break;
                case 39: // right
                case 68: // d
                    player.moveRight = false;
                    break;
            }

        };
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        document.addEventListener('mousewheel', function(e) {
            player.camdist(e.wheelDelta);
            return false;
        }, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
    }

    function animate() {
        requestAnimationFrame(animate);

        rendererStats.update(renderer);

        if(!player)
            return;

        player.updateCamera();

        if(isLocked) {
            player.move();
            player.jump();
            light2.position.set(player.corps.position.x, player.corps.position.y, player.corps.position.z);
        }

        renderer.render(scene, player.camera);
        if(player.corps.position.y < -150)
            end();
    }

    // Death
    function end() {
        player.corps.position.x = 0;
        player.corps.position.y = 30;
        player.corps.position.z = 0;
    }

    function posRnd(decalage) {
        decalage = typeof decalage !== 'undefined' ? decalage : 0;
        return Math.floor(Math.random() * dimCadri - decalage) * dimCadri;
    }

    function modeDebug() {
        dummy[0] = new dummyC();
        scene.add(dummy[0].mesh);
        dummy[1] = new dummyC();
        scene.add(dummy[1].mesh);
        dummy[2] = new dummyC();
        scene.add(dummy[2].mesh);
    }

    function perso(name, pos) {

        // info player
        var speed = 1;
        var distCollision = 8;

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
        var geometrytorse = new THREE.CubeGeometry(dimCadri / 2, dimCadri / 2, dimCadri / 2);
        //    var material = new THREE.MeshLambertMaterial({color: 0xffff00});
        this.torse = new THREE.Mesh(geometrytorse, material);
        this.corps.add(this.torse);

        var geometrytete = new THREE.CubeGeometry(dimCadri / 4, dimCadri / 4, dimCadri / 4);
        this.tete = new THREE.Mesh(geometrytete, material);
        this.tete.position.y = dimCadri / 2;
        this.tete.position.z = -5;
        this.corps.add(this.tete);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.x += Math.sin(this.corps.rotation.y) * distCamPlayer;
        this.camera.position.z += Math.cos(this.corps.rotation.y) * distCamPlayer;
        this.tete.add(this.camera);

        this.updateCamera = function() {
            this.camera.position.x += (this.tete.position.x - this.camera.position.x) / 10;
            this.camera.position.y += (this.tete.position.y - this.camera.position.y - dimCadri / 2) / 10;
        }

        this.move = function() {
            positionNew.copy(this.corps.position);

            var canBouge = this.canMove();
            if(canBouge) {
                positionNew.x += canBouge[0];
                positionNew.z += canBouge[1];
                this.corps.position.copy(positionNew);
                Db.updatePos({x: positionNew.x, y: positionNew.y, z: positionNew.z});
            }
        };

        this.canMove = function() {

            var deltaX = [];
            var deltaZ = [];
            var pangle = PI / 4;
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
                deltaX[0] -= Math.sin(this.corps.rotation.y + PI / 2 - pangle);
                deltaZ[0] -= Math.cos(this.corps.rotation.y + PI / 2 - pangle);
                deltaX[1] -= Math.sin(this.corps.rotation.y + PI / 2);
                deltaZ[1] -= Math.cos(this.corps.rotation.y + PI / 2);
                deltaX[2] -= Math.sin(this.corps.rotation.y + PI / 2 + pangle);
                deltaZ[2] -= Math.cos(this.corps.rotation.y + PI / 2 + pangle);
            }
            if(this.moveRight) {
                deltaX[0] -= Math.sin(this.corps.rotation.y - PI / 2 - pangle);
                deltaZ[0] -= Math.cos(this.corps.rotation.y - PI / 2 - pangle);
                deltaX[1] -= Math.sin(this.corps.rotation.y - PI / 2);
                deltaZ[1] -= Math.cos(this.corps.rotation.y - PI / 2);
                deltaX[2] -= Math.sin(this.corps.rotation.y - PI / 2 + pangle);
                deltaZ[2] -= Math.cos(this.corps.rotation.y - PI / 2 + pangle);
            }

            var canBouge = [deltaX[1], deltaZ[1]];
            for (var i = 0; i < 3; i++) {
                var raycaster = new THREE.Raycaster(this.corps.position, new THREE.Vector3(deltaX[i] * distCollision, 0, deltaZ[i] * distCollision).normalize());
                var intersects = raycaster.intersectObjects(objects);

                if(intersects.length > 0 && intersects[0].distance < distCollision) {
                    audio.play();
                    canBouge = false;
                }
                if(modeDebug) {
                    dummy[i].mesh.position.y = this.corps.position.y;
                    dummy[i].mesh.position.x = this.corps.position.x + deltaX[i] * distCollision;
                    dummy[i].mesh.position.z = this.corps.position.z + deltaZ[i] * distCollision;
                }
            }
            var distPut = 25;

            // Grille
            dummy[10].mesh.position.y = Math.round((this.corps.position.y + Math.sin(this.tete.rotation.x) * distPut + dimCadri / 2) / dimCadri) * dimCadri;
            dummy[10].mesh.position.x = Math.round((this.corps.position.x - Math.sin(this.corps.rotation.y) * distPut * Math.cos(this.tete.rotation.x)) / dimCadri) * dimCadri;
            dummy[10].mesh.position.z = Math.round((this.corps.position.z - Math.cos(this.corps.rotation.y) * distPut * Math.cos(this.tete.rotation.x)) / dimCadri) * dimCadri;
            return canBouge;
        }

        this.jump = function() {
            if(canJump && this.jumping == true) {
                canJump = false;
                saut = 4.3;
            }

            var canFall = true;
            var raycaster = new THREE.Raycaster(this.corps.position, new THREE.Vector3(0, -1, 0));
            var intersects = raycaster.intersectObjects(objects);
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
        }

        this.getCube = function() {
                var key = this.canGet();
                if(key) {
                    scene.remove(objects[key]);
                    Db.remove(objects[key].position.x / dimCadri, objects[key].position.y / dimCadri, objects[key].position.z / dimCadri);
                    objects.splice(key, 1);
                    console.log(key + ' dans l\'inventaire, enfin presque...');
                }
                else
                    console.log('aucun cube recupéré');
        },

        this.canGet = function() {
            var distGet = dimCadri; // FIXME: à ameliorer
            var teteposabs = new THREE.Vector3(this.corps.position.x + this.tete.position.x, this.corps.position.y + this.tete.position.y,this.corps.position.z + this.tete.position.z)
            var vecteur = new THREE.Vector3(dummy[10].mesh.position.x - teteposabs.x, dummy[10].mesh.position.y - teteposabs.y, dummy[10].mesh.position.z - teteposabs.z).normalize();
            var raycaster = new THREE.Raycaster(teteposabs, vecteur);
            var intersects = raycaster.intersectObjects(objects);
            if(intersects.length > 0 && intersects[0].distance < distGet) {
                for (var key in objects) {
                    if(objects[key]['id'] == intersects[0].object.id) {
                        return key;
                    }
                }
            }
            return null;
        }

        this.putCube = function() {
            dummy[10].mesh.visible = false;
            var obj = {x: dummy[10].mesh.position.x / dimCadri, y: dummy[10].mesh.position.y / dimCadri, z: dummy[10].mesh.position.z / dimCadri};
            addCubeToScene(obj);
            Db.put(obj.x, obj.y, obj.z, WoodBlock);
        }

// Je commente parce que je sais pas à quoi ça sert

/*        this.canPut = function() {
            var distPut = 12;

            var deltaX = -Math.sin(this.corps.rotation.y);
            var deltaZ = -Math.cos(this.corps.rotation.y);

            // Note: no need to do a Db.remove()
            if(intersects.length > 0 && intersects[0].distance < distPut) {
                scene.remove(intersects[0].object);
                for (var key in objects) {
                    if(objects[key]['id'] == intersects[0].object.id) {
                        objects.splice(key, 1);
                    }
                }
                return true;
            }
            return false;
        }
*/
        this.setCamDist = function(dist) {
            distCamPlayer = dist;
            this.camera.position.x = this.tete.position.x + Math.sin(this.tete.rotation.y) * distCamPlayer;
            this.camera.position.z = this.tete.position.z + Math.cos(this.tete.rotation.y) * distCamPlayer;
        }

        this.camdist = function(delta) {

            distCamPlayer -= delta / 30;

            if(distCamPlayer < 0)
                distCamPlayer = 0;
            if(distCamPlayer > 200)
                distCamPlayer = 200;

            this.setCamDist(distCamPlayer);

        }

        this.setCamDist(40);

    }

    function PNJ(id, name, pos, rot) {

        this.id = id;
        this.name = name;
        this.corps = new THREE.Object3D();
        copyVector(this.corps.position, pos);

        var geometrytorse = new THREE.CubeGeometry(dimCadri / 2, dimCadri / 2, dimCadri / 2);
        var material = new THREE.MeshLambertMaterial({color: 0xffff00});
        this.torse = new THREE.Mesh(geometrytorse, material);
        this.corps.add(this.torse);

        var geometrytete = new THREE.CubeGeometry(dimCadri / 4, dimCadri / 4, dimCadri / 4);
        this.tete = new THREE.Mesh(geometrytete, material);
        this.tete.position.y = dimCadri / 2;
        this.tete.position.z = dimCadri / 4;
        this.corps.add(this.tete);

        var geometryName = new THREE.TextGeometry(name, {
            font: 'optimer', // Must be lowercase!
            weight: 'normal',
            style: 'normal',
            size: 2,
            height: 0.5,
            bevelThickness: 0.1, bevelSize: 0.1, bevelEnabled: true
        });
        var textMaterial = new THREE.MeshPhongMaterial({color: 0xffaa00});
        this.name_label = new THREE.Mesh(geometryName, textMaterial);
        this.name_label.position.y = dimCadri * 0.1;
        this.name_label.position.z = dimCadri * 0.25;
        this.name_label.position.x = -5;
        this.corps.add(this.name_label);

        copyRotation(this, rot);

        scene.add(this.corps);
        objects.push(this.torse);

        this.move = function(pos, rot) {
            copyVector(this.corps.position, pos);
            copyRotation(this, rot);
        };

        return this;
    }
    function cubeC(Pos) {
        var mesh = new THREE.Mesh(geometry, cubeMaterial);
        mesh.position.copy(Pos);
        scene.add(mesh);
        objects.push(mesh);
    }

    function dummyC() {
        this.mesh = new THREE.BoxHelper();
        this.mesh.material.color.setRGB(0, 1, 0);
        this.mesh.scale.set(10, 10, 10);
        this.mesh.position.y = 20;
        this.mesh.position.x = 15;
        this.mesh.visible = false;
    }

    function onDocumentMouseDown(event)
    {
        switch (event.button) {
            case 0: // left
                player.getCube();
                break;
            case 1: // middle
                break;
            case 2: // right
                player.putCube();
                break;
        }
    }

    return {
        init: function(player) {
            init(player);
        },
        animate: function() {
            animate();
        },
        addMainPlayer: function(name, pos) {
            return new perso(name, pos);
        },
        addPNJ: function(id, name, pos, rot) {
            //console.log('adding PNJ '+id)
            return new PNJ(id, name, pos, rot);
        }

    };

});
