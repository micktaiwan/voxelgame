function perso(name) {

// info player
    var speed = 1;
    var distCamPlayer = 50;
    var distCollision = 8;

    var audio = document.createElement('audio');
    var source = document.createElement('source');
    source.src = 'sounds/ammo_bounce.wav';
    audio.appendChild(source);
    audio.play();

    var canJump = true;
    var saut = 0;
    var positionNew = new THREE.Vector3(0, 0, 0);

    this.name = name; // vivement le reseau :)
    this.jumping = false;
    this.corps = new THREE.Object3D();
    this.corps.position.y = 30;

    var geometrytorse = new THREE.CubeGeometry(10, 10, 10);
    var material = new THREE.MeshLambertMaterial({color: 0xffff00});
    this.torse = new THREE.Mesh(geometrytorse, material);
    this.corps.add(this.torse);

    var geometrytete = new THREE.CubeGeometry(3, 3, 3);
    this.tete = new THREE.Mesh(geometrytete, material);
    this.tete.position.y = 14;
    this.corps.add(this.tete);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.y = 14;
    this.camera.position.z = -2.5;
    this.corps.add(this.camera);

    this.move = function() {
        positionNew.copy(this.corps.position);

        canBouge = this.canMove();
        if(canBouge) {
            positionNew.x += canBouge[0];
            positionNew.z += canBouge[1];
            this.corps.position.copy(positionNew);
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
        for (i = 0; i < 3; i++) {
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
}