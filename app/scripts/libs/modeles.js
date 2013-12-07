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