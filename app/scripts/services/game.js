'use strict';

angular.module('gameApp.services.game', []).factory('Game', function($rootScope, $location, Db, Session) {

    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    };

    var initialized = false;
    var rendererIsStopped = true;
    var rendererStats = null;

    var $game_div;
    var scene, renderer;
    var geometry, material, mesh;
    //var time = Date.now();
    //var players = [];
    var player; // the one who actually play

    var dummy = [];

    var geometry        = new THREE.CubeGeometry(Config.dimCadri, Config.dimCadri, Config.dimCadri);
    var cubeMaterial    = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});

    var canMove = false;

    var light, light2;
    var objects = [];
    var addMessageCallback = null; // method to add ingame messages

    var textureFlare0 = THREE.ImageUtils.loadTexture( "images/lensflare0.png" );
    var textureFlare2 = THREE.ImageUtils.loadTexture( "images/lensflare2.png" );
    var textureFlare3 = THREE.ImageUtils.loadTexture( "images/lensflare3.png" );

    function copyVector(to, from) { // FIXME: pas sur que ça serve...
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
    }

    // { corps: player.corps.rotation.y, tete: player.tete.rotation.x }
    function copyRotation(to, from) {
        to.corps.rotation.y = from.corps;
        to.tete.rotation.x = from.tete;
    }


    function lensFlareUpdateCallback( object ) {

        var f, fl = object.lensFlares.length;
        var flare;
        var vecX = -object.positionScreen.x * 2;
        var vecY = -object.positionScreen.y * 2;

        for( f = 0; f < fl; f++ ) {
               flare = object.lensFlares[ f ];
               flare.x = object.positionScreen.x + vecX * flare.distance;
               flare.y = object.positionScreen.y + vecY * flare.distance;
               flare.rotation = 0;
        }

        object.lensFlares[ 2 ].y += 0.025;
        object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
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
    function addSun( h, s, l, x, y, z ) {

        var light = new THREE.DirectionalLight( 0xffffff, 1.5); //, 0, 45);
        //var light = new THREE.SpotLight( 0xffffff, 1.5, 0, 45);
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        light.castShadow = true;
        //light.shadowCameraVisible = true;
/*
        light.shadowCameraNear = 10;
        light.shadowCameraFar = 10000;
        light.shadowCameraFov = 30;
*/
        light.shadowDarkness = 0.8;
        scene.add(light);

        light = new THREE.PointLight( 0xffffff, 1, 0);
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );

        var flareColor = new THREE.Color( 0xffffff );
        flareColor.setHSL( h, s, l + 0.5 );

        var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

        lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

        lensFlare.customUpdateCallback = lensFlareUpdateCallback;
        lensFlare.position = light.position;

        scene.add(lensFlare);

    }

    function getMeshObjects() {
        return objects.map(function(o) { return o.mesh;});
    }

    function real_init() {
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x333333, 300, 1000);
        //objects.length = 0; // reset all objects
        light = new THREE.AmbientLight(0xffffff);
        light.color.setHSL( 0.1, 0.3, 0.2 );
        scene.add(light);
        addSun( 0.995, 0.5, 0.9, 0, 500, 300 );
/*
        light2 = new THREE.PointLight(0xffffff, 2, 50);
        light2.position.set(-1, 1, -1);
        scene.add(light2);
*/
        if(Config.modeDebug)
            modeDebug();
        rendererStats = new THREEx.RendererStats();
        rendererStats.domElement.style.position = 'absolute';
        rendererStats.domElement.style.right     = '0px';
        rendererStats.domElement.style.top      = '50px';

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
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
        if(!initialized)
            real_init();
        $game_div = $('#game');
        onWindowResize();
        $game_div.append(rendererStats.domElement);
        $game_div.append(renderer.domElement);
        animate();
        return was_already_initialized;
   }

    function addMessage(msg) {
        if(!addMessageCallback) return;
        safeApply($rootScope, function() {
            addMessageCallback(msg);
        });
    }

    function getCubeFromScene(obj) {
        for (var key in objects) {
            if(objects[key].obj && objects[key].obj.id == obj.id) {
                return key;
            }
        }
        return null;
    }

    function addCubeToScene(obj) {
        if(getCubeFromScene(obj))
            throw ('There is a cube there. Check it before you call addCubeToScene.');
        var mesh = new THREE.Mesh(geometry, cubeMaterial);
        mesh.position.x = obj.x * Config.dimCadri;
        mesh.position.y = obj.y * Config.dimCadri;
        mesh.position.z = obj.z * Config.dimCadri;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        objects.push({obj: obj, mesh: mesh});
    }

    function removeCubeFromSceneByKey(key) {
        scene.remove(objects[key].mesh);
        objects.splice(key, 1);
    }

    function removeCubeFromScene(obj) {
        var key = getCubeFromScene(obj);
        if(key)   removeCubeFromSceneByKey(key);
        else {
            console.error("did not find cube");
            console.error(obj);
        }
    }

    // type: 'added', 'changed', 'removed'
    // obj: the cube (id, x, y, z, type, user_id)
    function onCube(type, obj) {
        if(obj.date > new Date().getTime() - 10*1000)
            console.log('cube ' + type + ' on ' + obj.x + ', ' + obj.y + ', ' + obj.z);
        if(type == "added") {
            addCubeToScene(obj);
        } else if(type == "removed") {
            removeCubeFromScene(obj);
        } else {
            console.error('unknown onCube type ' + type);
        }
    }

    function onWindowResize() {
        if(player) {
            player.camera.aspect = window.innerWidth / window.innerHeight;
            player.camera.updateProjectionMatrix();
        }
        var width  = window.innerWidth  - $game_div[0].offsetLeft * 2;
        var height = window.innerHeight - $game_div[0].offsetTop-5;
        $game_div[0].style.width  = width;
        $game_div[0].style.height = height;
        renderer.setSize(width, height);
    }

    function control() {

        function onMove(event) {
            if(isLocked) return;
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;// event.pageX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0; //event.pageY || 0;
            player.corps.rotation.y -= movementX * 0.002;
            player.tete.rotation.x  -= movementY * 0.002;

            // camera lag, not nicely done
            //player.camera.position.x += movementX * 0.01;
            //player.camera.position.y -= movementY * 0.01;

            if(player.tete.rotation.x < - Math.PI / 2)
                player.tete.rotation.x = - Math.PI / 2;
            if(player.tete.rotation.x > Math.PI / 2)
                player.tete.rotation.x = Math.PI / 2;

            Db.updateRot({corps: player.corps.rotation.y, tete: player.tete.rotation.x});
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
            if(isLocked) return;
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
            if(isLocked) return;
            player.camdist(e.wheelDelta);
            return false;
        }, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
    }

    var lastTimeMsec = new Date().getTime();
    var nowMsec, fps;
    var speedFactor = 1;
    function animate() {
        if(!rendererIsStopped) requestAnimationFrame(animate);
        nowMsec = new Date().getTime()
        fps   =  1000.0 / (nowMsec - lastTimeMsec)
        lastTimeMsec    = nowMsec
        speedFactor = (60 / fps);

//        if(fps < 40 || fps > 70)
//            console.log(speedFactor + ", " + fps);

        rendererStats.update(renderer);
        if(!player) return;
        //player.updateCamera();
        if(!isLocked) {
            player.move();
            player.jump();
            //light2.position.set(player.corps.position.x, player.corps.position.y, player.corps.position.z);
        }
        renderer.render(scene, player.camera);
        if(player.corps.position.y < -150)
            end();
    }

    // Death
    function end() {
        addMessage("You're dead...");
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

    function PNJ(id, name, pos, rot) {

        if(!pos)
            pos = {x: 0, y: Config.dimCadri, z: 0};
        if(!rot)
            rot = {corps: 0, tete: 0};
        this.id = id;
        this.name = name;
        this.corps = new THREE.Object3D();

        copyVector(this.corps.position, pos);
        var d = Config.dimCadri;
        var geometrytorse = new THREE.CubeGeometry(d, d, d);
        var material = new THREE.MeshLambertMaterial({color: 0xffff00});
        var torse = new THREE.Mesh(geometrytorse, material);
        this.corps.add(torse);
        torse.castShadow = true;
        torse.receiveShadow = true;

        var geometrytete = new THREE.CubeGeometry(d/2, d/2, d/2);
        this.tete = new THREE.Mesh(geometrytete, material);
        this.tete.castShadow = true;
        this.tete.receiveShadow = true;
        this.tete.position.y = d;
        this.tete.position.z = d / 4;
        this.corps.add(this.tete);

        var geometryName = new THREE.TextGeometry(name, {
            font: 'optimer', // Must be lowercase!
            weight: 'normal',
            style: 'normal',
            size: 4,
            height: 0.5,
            curveSegments: 2,
            bevelThickness: 0.1, bevelSize: 0.1, bevelEnabled: true
        });

        var textMaterial = new THREE.MeshPhongMaterial({color: 0xffaa00});
        this.name_label = new THREE.Mesh(geometryName, textMaterial);
        var box = new THREE.Box3();
        box.setFromObject(this.name_label);
        var centerOffset = (box.max.x - box.min.x) / 2;
        this.name_label.position.y = d * 0.25;
        this.name_label.position.z = d * 0.5;
        this.name_label.position.x = -centerOffset;
        this.corps.add(this.name_label);

        copyRotation(this, rot);

        scene.add(this.corps);
        objects.push({mesh: torse});

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
        objects.push({mesh: mesh});
    }

    function dummyC() {
        this.mesh = new THREE.BoxHelper();
        //this.mesh.material.color.setRGB(0, 1, 0);
        this.mesh.scale.set(Config.dimCadri/2, Config.dimCadri/2, Config.dimCadri/2);
        //this.mesh.position.y = 20;
        //this.mesh.position.x = 15;
        this.mesh.visible = false;
    }

    function onDocumentMouseDown(event) {
        if(isLocked) return;
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
        if(isLocked) return;
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
            if(!rendererIsStopped)
                console.log("Game rendering has been stopped but still receive DB updates");
            rendererIsStopped = true;
        },
        addMainPlayer: function(p) {
            player = p;
            scene.add(player.corps);
        },
        addPNJ: function(id, name, pos, rot) {
            //console.log('adding PNJ '+id)
            return new PNJ(id, name, pos, rot);
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
        speedFactor: function() {
            return speedFactor;
        },
    };

});
