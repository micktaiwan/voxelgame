var CubeTypes = {
    WoodBox: 0,
    WoodBlock: 1,
    Glass: 2,
    Metal: 3
};

var Objects = [{
    type: CubeTypes.WoodBox,
    display: 'Box',
    material: new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('images/boite.jpg')
    }),
    path: 'boite.jpg'
}, {
    type: CubeTypes.WoodBlock,
    display: 'Wood',
    material: new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('images/crate01.jpg')
    }),
    path: 'crate01.jpg'
}, {
    type: CubeTypes.Glass,
    display: 'Glass',
    material: new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('images/glass.png')
    }),
    transparent: true,
    opacity:1,
    path: 'glass.png'
}, {
    type: CubeTypes.Metal,
    display: 'Metal',
    material: new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('images/metal.jpg')
    }),
    path: 'metal.jpg'
}, ];

var Config = {
    // geek mode
    modeDebug: false,

    // World
    dimCadri: 20,
    randomCubeRotation: true, // if cubes are randomly rotated or not
    randomCubeRotationFactor: 0.1, // how much cubes are rotated

    // Camera
    distCamPlayer: 120,
    viewAngle: 45,

    // Player
    playerSpeed: 1.3, // constant
    speedFactor: 1, // will be updated depending of the fps
    maxInventory: 20,

    // Robots
    pov: 'robot' // camera start mode: 'player', 'robot'
};

function toArray(object) {
    return $.map(object, function(value, index) {
        return [value];
    });
}

function safeApply(scope, fn) {
    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}

function randomizeRot(mesh, factor) {
    mesh.rotation.x += (Math.random(1) - 0.5) * factor;
    mesh.rotation.y += (Math.random(1) - 0.5) * factor;
    mesh.rotation.z += (Math.random(1) - 0.5) * factor;
}

function randomizeMove(mesh, factor) {
    mesh.position.x += (Math.random(1) - 0.5) * factor;
    //mesh.position.y += (Math.random(1) - 0.5) * factor;
    mesh.position.z += (Math.random(1) - 0.5) * factor;
}


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

// cookies

function writeCookie(name, value, days) {
    var date, expires;
    if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var i, c, ca, nameEQ = name + "=";
    ca = document.cookie.split(';');
    for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return '';
}
