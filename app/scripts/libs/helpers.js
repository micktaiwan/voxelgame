// Cube 20*20*20
// Plan 2000*2000
//

var $game_div;
var modeDebug = false;
var dim = [6, 20, 6]; // x=largeur, y = hauteur, z=profondeur
var scene, renderer;
var geometry, material, mesh;
var time = Date.now();
var player;
var distCamPlayer = 0;

var dummy = [];

var velocity = new THREE.Vector3();
var canMove = false;

var light, light2;
var objects = [];

var PI = Math.PI;

function init() {

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

// mode debug
    if(modeDebug) {
        dummy[0] = new dummyC();
        scene.add(dummy[0].mesh);
        dummy[1] = new dummyC();
        scene.add(dummy[1].mesh);
        dummy[2] = new dummyC();
        scene.add(dummy[2].mesh);
    }

    // player
    player = new perso('joueur');
    scene.add(player.corps);

    // floor

    geometry = new THREE.CubeGeometry(20, 20, 20);
    var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});
    for (var iz = -dim[2] / 2; iz < dim[2] / 2; iz++) {
        for (var ix = -dim[0] / 2; ix < dim[0] / 2; ix++) {
            var mesh = new THREE.Mesh(geometry, cubeMaterial);
            mesh.position.x = ix * 20;
            mesh.position.y = 0;
            mesh.position.z = iz * 20;
            scene.add(mesh);
            objects.push(mesh);
        }
    }

    // plafond

    geometry = new THREE.CubeGeometry(20, 20, 20);
    var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});
    for (var iz = -dim[2] * 4; iz < dim[2] * 4; iz++) {
        for (var ix = -dim[0] * 4; ix < dim[0] * 4; ix++) {
            if(ix > dim[0] * 2 || ix < -dim[0] * 2) {
                var mesh = new THREE.Mesh(geometry, cubeMaterial);
                mesh.position.x = ix * 20;
                mesh.position.y = 210;
                mesh.position.z = iz * 20;
                scene.add(mesh);
                objects.push(mesh);
            }
        }
    }

    // objects

    geometry = new THREE.CubeGeometry(20, 20, 20);
    var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});
    for (var i = 0; i < 500; i++) {
        var mesh = new THREE.Mesh(geometry, cubeMaterial);
        mesh.position.x = Math.floor(Math.random() * 20 - 10) * 20;
        mesh.position.y = Math.floor(Math.random() * 20) * 20;
        mesh.position.z = Math.floor(Math.random() * 20 - 10) * 20;
        scene.add(mesh);
        objects.push(mesh);
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
    };

    onKeyDown = function(event) {
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

    onKeyUp = function(event) {
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
        player.camdist(e);
        return false;
    }, false);
}

function animate() {
    requestAnimationFrame(animate);
    if(!player)
        return;

    if(isLocked) {
        player.camera.rotation.x = player.tete.rotation.x;
//        player.camera.position.y = player.tete.position.y - Math.sin(player.tete.rotation.x) * distCamPlayer;
        player.move();
        player.jump();
        light2.position.set(player.corps.position.x, player.corps.position.y + 20, player.corps.position.z);
    }

    renderer.render(scene, player.camera);
    if(player.corps.position.y > 250)
        end();
}

function cubeC() {

    var geometry = new THREE.CubeGeometry(10, 10, 10, 5, 5, 5);
    var material = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});
//    var material = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = 5;
    this.mesh.position.x = 15;
    this.get = function() {
        console.log('get');
    };
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

function end() {
    $('#instructions').html('Bravo!! -> F5 :)')
    $('#blocker').show();
}