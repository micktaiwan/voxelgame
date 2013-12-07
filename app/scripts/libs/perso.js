function perso(name, x, y, z) {

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
    var positionNew = new THREE.Vector3(x, y, z);

    this.name = name;
    this.jumping = false;
    this.corps = new THREE.Object3D();
    this.corps.position.y = 30;

    var map = THREE.ImageUtils.loadTexture('images/ash_uvgrid01.jpg');
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 16;

    var material = new THREE.MeshLambertMaterial({ambient: 0xbbbbbb, map: map});
    var geometrytorse = new THREE.CubeGeometry(10, 10, 10);
//    var material = new THREE.MeshLambertMaterial({color: 0xffff00});
    this.torse = new THREE.Mesh(geometrytorse, material);
    this.corps.add(this.torse);

    var geometrytete = new THREE.CubeGeometry(3, 3, 3);
    this.tete = new THREE.Mesh(geometrytete, material);
    this.tete.position.y = 14;
    this.corps.add(this.tete);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
//    this.camera.position.y = this.tete.position.y;
    this.camera.position.x += Math.sin(this.corps.rotation.y) * distCamPlayer;
    this.camera.position.z += Math.cos(this.corps.rotation.y) * distCamPlayer;
    this.tete.add(this.camera);

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

    this.putCube = function() {
        geometry = new THREE.CubeGeometry(20, 20, 20);
        var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg')});
//        var cubeMaterial = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/boite.jpg'), wireframe: true});
        var mesh = new THREE.Mesh(geometry, cubeMaterial);
        mesh.position.x = Math.round((this.corps.position.x -Math.sin(this.corps.rotation.y)*20)/20)*20;
        mesh.position.z = Math.round((this.corps.position.z -Math.cos(this.corps.rotation.y)*20)/20)*20;
        mesh.position.y = Math.round(this.corps.position.y/20)*20;
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

    this.camdist = function(e) {

        distCamPlayer -= e.wheelDelta / 60;

        if(distCamPlayer < 0)
            distCamPlayer = 0;
        if(distCamPlayer > 50)
            distCamPlayer = 50;

        this.camera.position.x = this.tete.position.x + Math.sin(this.tete.rotation.y) * distCamPlayer;
        this.camera.position.z = this.tete.position.z + Math.cos(this.tete.rotation.y) * distCamPlayer;
        console.log(distCamPlayer);
    }
}

function anotherPerso(name, otherPos, otherRot) {

    this.name = name;
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

    this.move = function() {
        this.corps.position.copy(otherPos);
        this.corps.rotation.copy(otherRot);;
    };
}
