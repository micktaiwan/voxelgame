// modified by dayd
// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var elem = document.body;
var isLocked = true;
var escDown = false;

elem.requestFullscreen =
        elem.requestFullscreen ||
        elem.mozRequestFullscreen ||
        elem.mozRequestFullScreen ||
        elem.webkitRequestFullscreen;

elem.requestPointerLock =
        elem.requestPointerLock ||
        elem.mozRequestPointerLock ||
        elem.webkitRequestPointerLock;

var enablePointerLock = function() {
    if(elem.webkitRequestPointerLock) {
        elem.requestPointerLock();
    } else {
        elem.requestFullscreen();
    }
    $('#blocker').hide();
};

var disablePointerLock = function() {
    $('#blocker').show();
};

var onFullscreenChange = function() {
    elem.requestPointerLock();
};

document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('mozfullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);

var onPointerLockChange = function() {
    isLocked = !isLocked;
};

document.addEventListener('pointerlockchange', onPointerLockChange);
document.addEventListener('mozpointerlockchange', onPointerLockChange);
document.addEventListener('webkitpointerlockchange', onPointerLockChange);

elem.addEventListener('keydown', function(e) {
    if(e.keyCode === 27) {
        escDown = true;
    }
});

elem.addEventListener('keyup', function(e) {
    if(e.keyCode === 27) {
        if(isLocked && escDown)
            enablePointerLock();
        else
            disablePointerLock();
        escDown = false;
    }
});
