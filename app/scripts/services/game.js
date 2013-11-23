angular.module('gameApp.services.game', []).factory('Game', function($rootScope, $location) {

  console.log("game init");
  // set the scene size
  var WIDTH   = 500,
      HEIGHT  = 200;

  // set some camera attributes
  var VIEW_ANGLE = 45,
      ASPECT     = WIDTH / HEIGHT,
      NEAR       = 0.1,
      FAR        = 10000;

  // create a WebGL renderer, camera
  // and a scene
  var renderer = new THREE.WebGLRenderer();
  var camera =
    new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR);

  var scene = new THREE.Scene();

  // add the camera to the scene
  scene.add(camera);

  // the camera starts at 0,0,0
  // so pull it back
  camera.position.z = 300;

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // create the sphere's material
  var sphereMaterial =
    new THREE.MeshLambertMaterial(
      {
        color: 0xFFAA44
      });

  // set up the sphere vars
  var radius    = 50,
      segments  = 16,
      rings     = 16;

  // create a new mesh with
  // sphere geometry - we will cover
  // the sphereMaterial next!
  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(
      radius,
      segments,
      rings),
    sphereMaterial);

  // add the sphere to the scene
  scene.add(sphere);

  // create a point light
  var pointLight = new THREE.PointLight(0xFFFFFF);

  // set its position
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;

  // add to the scene
  scene.add(pointLight);

  var x = 0;
  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    //camera.position.z = Math.cos(x*1.2)*100 + 300;
    camera.position.x = Math.cos(x)*100;
    x += 0.01;
    //console.log(camera.position.z);
  }

  return {

    init : function() {
      // attach the render-supplied DOM element
      var $container = $('#game');
      $container.append(renderer.domElement);
    },

    render : function() {
      render();
    },

    plus : function() {
      camera.position.z -= 50;
    },

    minus : function() {
      camera.position.z += 50;
    }

  };

});
