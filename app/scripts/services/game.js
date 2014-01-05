'use strict';

angular.module('gameApp.services.game', []).factory('Game', function($rootScope, $location, Db, Session, Map, Camera) {

    var initialized = false;
    var rendererIsStopped = true;
    var rendererStats = null;
    var $game_div;
    var scene, renderer, projector;
    var geometry, material, mesh;
    //var time = Date.now();
    //var players = [];
    var player; // the one who actually play

    var dummy = [];

    // anim
    var morphs = [];
    var clock = new THREE.Clock();

    var geometry = new THREE.CubeGeometry(Config.dimCadri, Config.dimCadri, Config.dimCadri);
    var canMove = false;
    var light, light2;
    var objects = [];
    var addMessageCallback = null; // method to add ingame messages

    var textureFlare0 = THREE.ImageUtils.loadTexture("images/lensflare0.png");
    var textureFlare2 = THREE.ImageUtils.loadTexture("images/lensflare2.png");
    var textureFlare3 = THREE.ImageUtils.loadTexture("images/lensflare3.png");

    function lensFlareUpdateCallback(object) {

        var f, fl = object.lensFlares.length;
        var flare;
        var vecX = -object.positionScreen.x * 2;
        var vecY = -object.positionScreen.y * 2;
        for (f = 0; f < fl; f++) {
            flare = object.lensFlares[f];
            flare.x = object.positionScreen.x + vecX * flare.distance;
            flare.y = object.positionScreen.y + vecY * flare.distance;
            flare.rotation = 0;
        }

        object.lensFlares[2].y += 0.025;
        object.lensFlares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
    }

    // TODO: tilt shifting
    /*
     function initPostprocessing() {
     var renderPass = new THREE.RenderPass( scene, camera );
     
     var bokehPass = new THREE.BokehPass( scene, camera, {
     focus:                 1.0,
     aperture:        0.025,
     maxblur:        1.0,
     width: width,
     height: height
     } );
     
     bokehPass.renderToScreen = true;
     
     var composer = new THREE.EffectComposer( renderer );
     composer.addPass( renderPass );
     composer.addPass( bokehPass );
     }
     */

    function addSun(h, s, l, x, y, z) {

        var light = new THREE.DirectionalLight(0xffffff, 1); //, 0, 45);
        //var light = new THREE.SpotLight( 0xffffff, 1.5, 0);
        light.color.setHSL(h, s, l);
        light.position.set(x, y, z);
        light.castShadow = true;
        //light.shadowCameraVisible = true;
        /*
         light.shadowCameraNear = 10;
         light.shadowCameraFar = 10000;
         light.shadowCameraFov = 30;
         */
        light.shadowDarkness = 0.8;
        scene.add(light);
        light = new THREE.PointLight(0xffffff, 1, 0);
        light.color.setHSL(h, s, l);
        light.position.set(x, y, z);
        var flareColor = new THREE.Color(0xffffff);
        flareColor.setHSL(h, s, l + 0.5);
        var lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);
        lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
        lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
        lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
        lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
        lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
        lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
        lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);
        lensFlare.customUpdateCallback = lensFlareUpdateCallback;
        lensFlare.position = light.position;
        scene.add(lensFlare);
    }

    function getMeshObjects() {
        return objects.map(function(o) {
            return o.mesh;
        });
    }

    function real_init() {
        projector = new THREE.Projector();
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x333333, 300, 1000);
        //objects.length = 0; // reset all objects

        // LIGHTS
        light = new THREE.AmbientLight(0xffffff);
        light.color.setHSL(0.1, 0.3, 0.2);
        scene.add(light);
        addSun(0.995, 0.5, 0.9, 0, 500, 300);
        /*
         light2 = new THREE.PointLight(0xffffff, 2, 50);
         light2.position.set(-1, 1, -1);
         scene.add(light2);
         */

        // Axis
        var axis = new THREE.AxisHelper(20);
        axis.position.set(0, 25, 0);
        scene.add(axis);

        // model
        //scout
        var scale = 7;
	//var loader = new THREE.JSONLoader(), callback = function( geometry ) { createScene( geometry,  0, 0, 0, 7 ) };

//        var loader = new THREE.SceneLoader(), callback = function( geometry ) { createScene( geometry,  0, 0, 0, 7 ) };
//        loader.load("obj/animated/scout.js", function(geometry) {
//            createScene(geometry, 400, 0, 275, scale)
//        });

// var loader = new THREE.SceneLoader();
//  loader.load('obj/animated/scout.js', function(res) {
//      scene.add(res.scene);
//      renderer.render(res.scene, camera);
//  });
  
        // nana
        var loader = new THREE.OBJMTLLoader();
        //        loader.load( 'obj/ModelFace2.obj', 'obj/ModelFace2.mtl', function ( object ) {
        loader.load('obj/female02.obj', 'obj/female02.mtl', function(object) {
            object.position.x = 40;
            object.position.y = 10;
            object.position.z = -200;
            object.scale.set(0.19, 0.19, 0.19);
            scene.add(object);
        });
        //

        loader = new THREE.JSONLoader();
        loader.load("obj/animated/flamingo.js", function(geometry) {

            morphColorsToFaceColors(geometry);
            geometry.computeMorphNormals();
            var material = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                morphTargets: true,
                morphNormals: true,
                vertexColors: THREE.FaceColors,
                shading: THREE.FlatShading
            });
            var meshAnim = new THREE.MorphAnimMesh(geometry, material);
            meshAnim.duration = 2000;
            meshAnim.scale.set(0.5, 0.5, 0.5);
            meshAnim.position.y = 50;
            meshAnim.position.z = -350;
            scene.add(meshAnim);
            morphs.push(meshAnim);
        });
        if (Config.modeDebug)
            modeDebug();
        rendererStats = new THREEx.RendererStats();
        rendererStats.domElement.style.position = 'absolute';
        rendererStats.domElement.style.right = '0px';
        rendererStats.domElement.style.top = '50px';
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setClearColor(0x333333);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
        window.addEventListener('resize', onWindowResize, false);
        control();
        Db.onCube(onCube);
        initialized = true;
    }

    function init(_addMessageCallback) {
        var was_already_initialized = initialized;
        addMessageCallback = _addMessageCallback;
        rendererIsStopped = false;
        if (!initialized)
            real_init();
        $game_div = $('#game');
        onWindowResize();
        $game_div.append(rendererStats.domElement);
        $game_div.append(renderer.domElement);
        animate();
        return was_already_initialized;
    }

    function ensureLoop(animation) {

        for (var i = 0; i < animation.hierarchy.length; i++) {

            var bone = animation.hierarchy[ i ];

            var first = bone.keys[ 0 ];
            var last = bone.keys[ bone.keys.length - 1 ];

            last.pos = first.pos;
            last.rot = first.rot;
            last.scl = first.scl;

        }

    }

    function createScene(geometry, x, y, z, s) {

        ensureLoop(geometry.animation);

        geometry.computeBoundingBox();
        var bb = geometry.boundingBox;

        THREE.AnimationHandler.add(geometry.animation);
        console.log(geometry);
        for (var i = 0; i < geometry.materials.length; i++) {

            var m = geometry.materials[ i ];
            m.skinning = true;
            m.ambient.copy(m.color);

            m.wrapAround = true;
            m.perPixel = true;

        }


        var mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial());
        mesh.position.set(x, y - bb.min.y * s, z);
        mesh.scale.set(s, s, s);
        scene.add(mesh);

        mesh.castShadow = true;
        mesh.receiveShadow = true;


        var animation = new THREE.Animation(mesh, geometry.animation.name);
        animation.JITCompile = false;
        animation.interpolationType = THREE.AnimationHandler.LINEAR;

        animation.play();

    }

    function addMessage(msg) {
        if (!addMessageCallback)
            return;
        safeApply($rootScope, function() {
            addMessageCallback(msg);
        });
    }

    function getCubeFromSceneById(obj) {
        for (var key in objects) {
            if (objects[key].obj && objects[key].obj.id == obj.id) {
                return key;
            }
        }
        return null;
    }

    function getCubeFromSceneByPos(obj) {
        for (var key in objects) {
            if (objects[key].obj && objects[key].obj.mesh && objects[key].obj.mesh.position.x == obj.position.x && objects[key].obj.mesh.position.y == obj.position.y && objects[key].obj.mesh.position.z == obj.position.z) {
                return key;
            }
        }
        return null;
    }

    function addCubeToScene(obj) {
        if (getCubeFromSceneByPos(obj))
            throw ('There is a cube there. Check it before you call addCubeToScene.');
        var mesh = new THREE.Mesh(geometry, Objects[obj.type].material);
        if (Objects[obj.type].opacity) {
            mesh.material.transparent = true;
            mesh.material.opacity = Objects[obj.type].opacity;
        }
        mesh.position.x = obj.x * Config.dimCadri;
        mesh.position.y = obj.y * Config.dimCadri;
        mesh.position.z = obj.z * Config.dimCadri;
        if (Config.randomCubeRotation)
            randomizeRot(mesh, Config.randomCubeRotationFactor);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        objects.push({
            obj: obj,
            mesh: mesh
        });
    }

    function removeCubeFromSceneByKey(key) {
        scene.remove(objects[key].mesh);
        objects.splice(key, 1);
    }

    function removeCubeFromScene(obj) {
        var key = getCubeFromSceneById(obj);
        if (key)
            removeCubeFromSceneByKey(key);
        else {
            console.error("did not find cube");
            console.error(obj);
        }
    }

    // type: 'added', 'changed', 'removed'
    // obj: the cube (id, x, y, z, type, user_id)

    function onCube(type, obj) {
        if (obj.date > new Date().getTime() - 10 * 1000)
            console.log('cube ' + type + ' on ' + obj.x + ', ' + obj.y + ', ' + obj.z);
        if (type == "added") {
            Map.addCube(obj);
            addCubeToScene(obj);
        } else if (type == "removed") {
            Map.removeCube(obj);
            removeCubeFromScene(obj);
        } else {
            console.error('unknown onCube type ' + type);
        }
    }

    function morphColorsToFaceColors(geometry) {

        if (geometry.morphColors && geometry.morphColors.length) {

            var colorMap = geometry.morphColors[0];
            for (var i = 0; i < colorMap.colors.length; i++) {

                geometry.faces[i].color = colorMap.colors[i];
                geometry.faces[i].color.offsetHSL(0, 0.3, 0);
            }

        }

    }

    function onWindowResize() {
        Camera.getTHREECamera().aspect = window.innerWidth / window.innerHeight;
        Camera.getTHREECamera().updateProjectionMatrix();
        var width = window.innerWidth - $game_div[0].offsetLeft * 2;
        var height = window.innerHeight - $game_div[0].offsetTop - 5;
        /*
        $game_div[0].style.width = width;
        $game_div[0].style.height = height;
        */
        renderer.setSize(width, height);
    }

    function control() {

        function onMove(event) {
            if (isLocked)
                return;
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0; // event.pageX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0; //event.pageY || 0;

            player.rotate(movementX, movementY);
            // camera lag, not nicely done
            //Camera.getTHREECamera().position.x += movementX * 0.01;
            //Camera.getTHREECamera().position.y -= movementY * 0.01;

            Db.updateRot({
                corps: player.corps.rotation.y,
                tete: player.tete.rotation.x
            });
        }

        var onMouseMove = function(event) {
            onmove(event);
        };
        // TODO
        /*
         add an ontouchmove handler that translates the event's screenX and screenY to pageX and pageY and then
         calls your existing onmousemove handler. That would be for handling events from iOS devices running mobile Safari.
         You'll probably have to add some additional translations to handle other devices/browsers as well.
         */
        var onTouch = function(event) {
            onmove(event);
        }

        var onKeyDown = function(event) {
            if (isLocked)
                return;
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
                    player.jump(true);
                    break;
                case 65: // a
                    player.getCube();
                    break;
                case 69: // e
                    player.putCube();
                    break;
                case 73: // i
                    player.toggleInventory();
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
        document.addEventListener('mousemove', onMove, false);
        //var is_touch_device = 'ontouchstart' in document.documentElement;
        //document.addEventListener('touch', onTouch, false);
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        document.addEventListener('mousewheel', function(e) {
            if (isLocked)
                return;
            player.camdist(e.wheelDelta);
            return false;
        }, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
    }

    var lastTimeMsec = new Date().getTime();
    var nowMsec, fps;

    function animate() {
        if (!rendererIsStopped)
            requestAnimationFrame(animate);
        nowMsec = new Date().getTime()
        fps = 1000.0 / (nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec
        Config.speedFactor = (60 / fps);
        //        if(fps < 40 || fps > 70)
        //            console.log(Config.speedFactor + ", " + fps);

        rendererStats.update(renderer);
        if (!player)
            return;
        player.updateRobots();
        Camera.getCamera().update();
        // anim
        var delta = clock.getDelta();
        var morph;
        for (var i = 0; i < morphs.length; i++) {
            morph = morphs[i];
            morph.updateAnimation(1000 * delta);
        }

        //player.updateCamera();
        if (!isLocked) {
            player.move();
            player.jump();
            //light2.position.set(player.corps.position.x, player.corps.position.y, player.corps.position.z);
        }
        renderer.render(scene, Camera.getTHREECamera());
        if (player.corps.position.y < -150)
            end();
    }

    // Death

    function end() {
        addMessage({
            text: "You're dead...",
            delay: 5,
            type: 'info'
        });
        player.corps.position.x = 0;
        player.corps.position.y = Config.dimCadri + 10;
        player.corps.position.z = 0;
    }

    function posRnd(decalage) {
        decalage = decalage || 0;
        return Math.floor(Math.random() * Config.dimCadri - decalage) * Config.dimCadri;
    }

    function modeDebug() {
        dummy[0] = new dummyC();
        scene.add(dummy[0].mesh);
        dummy[1] = new dummyC();
        scene.add(dummy[1].mesh);
        dummy[2] = new dummyC();
        scene.add(dummy[2].mesh);
    }

    function PNJ(p) {
        //console.log(p);

        if (!p.pos) {
            p.pos = {
                x: 0,
                y: Config.dimCadri,
                z: 0
            }
        }

        if (!p.rot) {
            p.rot = {
                corps: 0,
                tete: 0
            }
        }

        this.id = p.id;
        this.name = p.name;
        this.onlinePresence = false;
        this.corps = new THREE.Object3D();
        copyVector(this.corps.position, p.pos);
        var materials = [
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body1.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body2.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body3.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body4.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body5.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body6.jpg'),
                transparent: true
            })
        ];
        var d = Config.dimCadri;
        var geometrytorse = new THREE.CubeGeometry(d, d, d / 2);
        this.torse = new THREE.Mesh(geometrytorse, new THREE.MeshFaceMaterial(materials));
        this.corps.add(this.torse);
        this.torse.castShadow = true;
        this.torse.receiveShadow = true;
        materials = [
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body1.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body2.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/head3.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/body4.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/head5.jpg'),
                transparent: true
            }),
            new THREE.MeshLambertMaterial({
                ambient: 0xffffff,
                map: THREE.ImageUtils.loadTexture('images/head6.jpg'),
                transparent: true
            })
        ];
        var geometrytete = new THREE.CubeGeometry(d / 2, d / 2, d / 2);
        this.tete = new THREE.Mesh(geometrytete, new THREE.MeshFaceMaterial(materials));
        this.tete.castShadow = true;
        this.tete.receiveShadow = true;
        this.tete.position.y = d;
        this.tete.position.z = -d / 4;
        this.corps.add(this.tete);
        var geometryName = new THREE.TextGeometry(p.name, {
            font: 'optimer', // Must be lowercase!
            weight: 'normal',
            style: 'normal',
            size: 4,
            height: 0.5,
            curveSegments: 2,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelEnabled: true
        });
        var textMaterial = new THREE.MeshPhongMaterial({
            color: 0xffaa00,
            transparent: true
        });
        this.name_label = new THREE.Mesh(geometryName, textMaterial);
        var box = new THREE.Box3();
        box.setFromObject(this.name_label);
        this.name_label.position.y = d * 0.25;
        this.name_label.position.z = d * 0.25;
        this.name_label.position.x = -(box.max.x - box.min.x) / 2; // center offset
        this.corps.add(this.name_label);
        copyRotation(this, p.rot);
        scene.add(this.corps);
        objects.push({
            mesh: this.torse
        });
        this.updateOnlinePresence = function(isOnline) {
            this.onlinePresence = isOnline;
            if (isOnline) {
                for (var i = this.torse.material.materials.length - 1; i >= 0; i--) {
                    this.torse.material.materials[i].opacity = 1;
                }
                for (var i = this.tete.material.materials.length - 1; i >= 0; i--) {
                    this.tete.material.materials[i].opacity = 1;
                }
                this.tete.castShadow = true;
                this.tete.receiveShadow = true;
                this.torse.castShadow = true;
                this.torse.receiveShadow = true;
            } else {
                var opa = 0.4;
                for (var i = this.torse.material.materials.length - 1; i >= 0; i--) {
                    this.torse.material.materials[i].opacity = opa;
                }
                for (var i = this.tete.material.materials.length - 1; i >= 0; i--) {
                    this.tete.material.materials[i].opacity = opa;
                }
                this.name_label.material.opacity = 0.4;
                this.tete.castShadow = false;
                this.tete.receiveShadow = false;
                this.torse.castShadow = false;
                this.torse.receiveShadow = false;
            }
        };
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
        objects.push({
            mesh: mesh
        });
    }

    function dummyC() {
        this.mesh = new THREE.BoxHelper();
        //this.mesh.material.color.setRGB(0, 1, 0);
        this.mesh.scale.set(Config.dimCadri / 2, Config.dimCadri / 2, Config.dimCadri / 2);
        //this.mesh.position.y = 20;
        //this.mesh.position.x = 15;
        this.mesh.visible = false;
    }

    function onDocumentMouseDown(event) {
        if (isLocked) {
            // select pointed cubes
            //event.preventDefault();

            var x = event.pageX;
            var y = event.pageY;
            x -= renderer.domElement.offsetLeft;
            y -= renderer.domElement.offsetTop;

            var vector = new THREE.Vector3((x / renderer.domElement.width) * 2 - 1, -(y / renderer.domElement.height) * 2 + 1, 0.5);
            projector.unprojectVector(vector, Camera.getTHREECamera());
            var raycaster = new THREE.Raycaster(Camera.getTHREECamera().position, vector.sub(Camera.getTHREECamera().position).normalize());
            var intersects = raycaster.intersectObjects(getMeshObjects());

            if (intersects.length > 0) {
                console.log(intersects.length + ' objects');
                var pos = intersects[0].object.position;
                console.log(pos);
                var obj = Map.getCubeByPos(pos.x/Config.dimCadri, pos.y/Config.dimCadri, pos.z/Config.dimCadri);
                console.log(obj);
            }
            return;
        }

        switch (event.button) {
            case 0: // left
                player.dummy.mesh.material.color.setRGB(1, 0, 0); // get
                break;
            case 1: // middle
                break;
            case 2: // right
                player.dummy.mesh.material.color.setRGB(0, 1, 0); // put
                break;
        }
        player.dummy.mesh.visible = true;
    }

    function onDocumentMouseUp(event) {
        if (isLocked)
            return;
        player.dummy.mesh.visible = false;
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
        init: function(addMessageCallback) {
            return init(addMessageCallback);
        },
        stop: function() {
            if (!rendererIsStopped)
                console.log("Game rendering has been stopped but still receive DB updates");
            rendererIsStopped = true;
        },
        addMainPlayer: function(p) {
            player = p;
            scene.add(player.corps);
            player.robots.forEach(function(r) {
                scene.add(r.body);
            });
        },
        getMainPlayer: function() {
            return player;
        },
        addRobot: function(r) {
            scene.add(r.body);
        },
        addPNJ: function(p) {
            //console.log('adding PNJ '+p.id)
            return new PNJ(p);
        },
        getObjects: function() {
            return objects;
        },
        getMeshObjects: function() {
            return getMeshObjects();
        },
        addCubeToScene: function(obj) {
            addCubeToScene(obj);
        },
        removeCubeFromScene: function(cube) {
            removeCubeFromScene(cube);
        },
        removeCubeFromSceneByKey: function(key) {
            removeCubeFromSceneByKey(key);
        },
        addGetPutDummy: function() {
            // helper get and put cube
            var dummy = new dummyC();
            scene.add(dummy.mesh);
            return dummy;
        },
        addMessage: function(msg) {
            addMessage(msg);
        },
        getCubeFromSceneById: function(obj) {
            var index = getCubeFromSceneById(obj);
            if (index)
                return objects[index];
            else
                return null;
        },
    }

});
