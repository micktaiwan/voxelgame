var CubeTypes = {
    WoodBlock: 1
}

var Config = {
    modeDebug: false,
    dimCadri: 20,
    distCamPlayer: 120,
    viewAngle: 45,
    playerSpeed: 1.3, // constant
    speedFactor: 1, // will be updated depending of the fps
    maxInventory: 20,
    randomCubeRotation: true,
    randomCubeRotationFactor: 0.1
}

function randomizeRot(mesh, factor) {
    mesh.rotation.x += (Math.random(1) - 0.5) * factor;
    mesh.rotation.y += (Math.random(1) - 0.5) * factor;
    mesh.rotation.z += (Math.random(1) - 0.5) * factor;
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
