'use strict';

angular.module('gameApp.services.game', []).factory('Game', function($rootScope, $location, Db) {

    // Cube 20*20*20
    // Plan 2000*2000
    var $game_div;
    var modeDebug = false;
    var dim = [6, 20, 6]; // x=largeur, y = hauteur, z=profondeur
    var dimCadri = 20; // dimensions cadrillage;
    var scene, renderer;
    var geometry, material, mesh;
    var time = Date.now();
    var players = [];
    var player; // the one who actually play
    var distCamPlayer = 0;

    var dummy = [];

    var velocity = new THREE.Vector3();
    var canMove = false;

    var light, light2;
    var objects = [];

    var PI = Math.PI;

    function copyVector(to, from) { // FIXME: pas sur que ça serve...
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
    };

    // Db.updateRot({ corps: player.corps.rotation.y, tete: player.tete.rotation.x });
    function copyRotation(to, from) {
        to.corps.rotation.y = from.corps;
        to.tete.rotation.x = from.tete;
    };

    function init(_player) {
        player = _player;
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x004444, 0, 200);
        light = new THREE.DirectionalLight(0x004444, 1.5);
        light.position.set(1, 1, 1);
        scene.add(light);
        light = new THREE.DirectionalLight(0xffff00, 1.5);
        light.position.set(-1, -1, -1);
        scene.add(light);
        light2 = new THREE.PointLight(0xffffff, 2, 50);
        light2.position.set(-1, 1, -1);
        scene.add(light2);
        scene.add(player.corps);

    // mode debug
        if(modeDebug)
            modeDebug();

        // floor
        for (var iz = -dim[2] / 2; iz < dim[2] / 2; iz++) {
            for (var ix = -dim[0] / 2; ix < dim[0] / 2; ix++) {
                new cubeC({x: ix * dimCadri, y: 0, z: iz * dimCadri});
            }
        }

        // plafond
        for (var iz = -dim[2] * 4; iz < dim[2] * 4; iz++) {
            for (var ix = -dim[0] * 4; ix < dim[0] * 4; ix++) {
                if(ix > dim[0] * 2 || ix < -dim[0] * 2) {
                    new cubeC({x: ix * dimCadri, y: -dimCadri, z: iz * dimCadri});
                }
            }
        }

        // objects
        for (var i = 0; i < 500; i++) {
            new cubeC({x: posRnd(dimCadri / 2), y: posRnd(), z: posRnd(dimCadri / 2)});
        }

        //
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x004444);
        $game_div = $('#game');
        onWindowResize()

        //document.body.appendChild(renderer.domElement);
        $game_div.append(renderer.domElement);

        //
        window.addEventListener('resize', onWindowResize, false);

        control();
    }

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
            Db.updateRot({ corps: player.corps.rotation.y, tete: player.tete.rotation.x });
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
                case 69: // e
                    player.getCube();
                    break;
                case 82: // r
                    player.putCube();
                    break;
            }
        };

        var onKeyUp = function(event) {
            switch (event.keyCode) {

                case 38: // up
                case 87: // w
                case 90: // z
                    player.moveForward = false;
                    break;
                case 37: // left
                case 65: // a
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
    }

    function animate() {
        requestAnimationFrame(animate);
        if(!player)
            return;

        if(isLocked) {
            player.move();
            player.jump();
            light2.position.set(player.corps.position.x, player.corps.position.y + dimCadri, player.corps.position.z);
        }

        renderer.render(scene, player.camera);
        if(player.corps.position.y > 250)
            end();
    }

    function end() {
        $('#instructions').html('Bravo!! -> F5 :)')
        $('#blocker').show();
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
        this.corps.position.y = dimCadri;

        var map = THREE.ImageUtils.loadTexture('images/ash_uvgrid01.jpg');
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;

        var material = new THREE.MeshLambertMaterial({ambient: 0xbbbbbb, map: map});
        var geometrytorse = new THREE.CubeGeometry(dimCadri/2, dimCadri/2, dimCadri/2);
    //    var material = new THREE.MeshLambertMaterial({color: 0xffff00});
        this.torse = new THREE.Mesh(geometrytorse, material);
        this.corps.add(this.torse);

        var geometrytete = new THREE.CubeGeometry(dimCadri/4, dimCadri/4, dimCadri/4);
        this.tete = new THREE.Mesh(geometrytete, material);
        this.tete.position.y = dimCadri/2;
        this.corps.add(this.tete);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    //    this.camera.position.y = this.tete.position.y;
        this.camera.position.x += Math.sin(this.corps.rotation.y) * distCamPlayer;
        this.camera.position.z += Math.cos(this.corps.rotation.y) * distCamPlayer;
        this.tete.add(this.camera);

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
            return canBouge;
        }

        this.jump = function() {
            if(canJump && this.jumping == true) {
                canJump = false;
                saut = 4;
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
            canGet = this.canGet();
            if(canGet) {
                console.log('ok dans l\'inventaire, enfin presque...');
            }
        }

        this.canGet = function() {
            var distGet = 12;

            deltaX = -Math.sin(this.corps.rotation.y);
            deltaZ = -Math.cos(this.corps.rotation.y);

            var raycaster = new THREE.Raycaster(this.corps.position, new THREE.Vector3(deltaX * distGet, 0, deltaZ * distGet).normalize());
            var intersects = raycaster.intersectObjects(objects);

            if(intersects.length > 0 && intersects[0].distance < distGet) {
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

        this.putCube = function() {
            geometry = new THREE.CubeGeometry(dimCadri, dimCadri, dimCadri);
            var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});
    //        var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg'), wireframe: true});
            var mesh = new THREE.Mesh(geometry, cubeMaterial);
            mesh.position.x = Math.round((this.corps.position.x -Math.sin(this.corps.rotation.y)*dimCadri)/dimCadri)*dimCadri;
            mesh.position.z = Math.round((this.corps.position.z -Math.cos(this.corps.rotation.y)*dimCadri)/dimCadri)*dimCadri;
            mesh.position.y = Math.round(this.corps.position.y/dimCadri)*dimCadri;
            scene.add(mesh);
            objects.push(mesh);
            return;
            canPut = this.canPut();
            if(canPut) {
                console.log('ok posé...');
            }
        }

        this.canPut = function() {
            var distPut = 12;

            deltaX = -Math.sin(this.corps.rotation.y);
            deltaZ = -Math.cos(this.corps.rotation.y);

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

        this.setCamDist = function(dist) {
            distCamPlayer = dist;
            this.camera.position.x = this.tete.position.x + Math.sin(this.tete.rotation.y) * distCamPlayer;
            this.camera.position.z = this.tete.position.z + Math.cos(this.tete.rotation.y) * distCamPlayer;
        }

        this.camdist = function(delta) {

            distCamPlayer -= delta / 60;

            if(distCamPlayer < 0)
                distCamPlayer = 0;
            if(distCamPlayer > 100)
                distCamPlayer = 100;

            this.setCamDist(distCamPlayer);

        }

        this.setCamDist(20);

    }

    function PNJ(id, name, pos, rot) {

        this.id     = id;
        this.name   = name;
        this.corps  = new THREE.Object3D();
        copyVector(this.corps.position, pos);

        var geometrytorse = new THREE.CubeGeometry(dimCadri/2, dimCadri/2, dimCadri/2);
        var material = new THREE.MeshLambertMaterial({color: 0xffff00});
        this.torse = new THREE.Mesh(geometrytorse, material);
        this.corps.add(this.torse);

        var geometrytete = new THREE.CubeGeometry(dimCadri/4, dimCadri/4, dimCadri/4);
        this.tete = new THREE.Mesh(geometrytete, material);
        this.tete.position.y = dimCadri/2;
        this.corps.add(this.tete);
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
        var geometry = new THREE.CubeGeometry(dimCadri, dimCadri, dimCadri);
        var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});
        var mesh = new THREE.Mesh(geometry, cubeMaterial);
        mesh.position.copy(Pos);
        scene.add(mesh);
        objects.push(mesh);
    }

    function dummyC() {

        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 20;
        this.mesh.position.x = 15;
        this.get = function() {
            console.log('get');
        };
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
