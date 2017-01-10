// Global vars
var camera, controls, renderer, scene;

// Array of all the celestial bodies
var bodies = [];

init();
animate();

function init() {
  // Create the scene
  scene = new THREE.Scene();

  // Create a renderer and add it to the DOM.
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create a camera, zoom it out from the model a bit, and add it to the scene.
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 100;
  scene.add(camera);

  // Add OrbitControls so that we can pan around with the mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Add the celestial bodies
  var Sun = addBody(30, 0xffff00, null, 10, 5);
  var Earth = addBody(30, 0xffff00, Sun, 5, 5);
  var Moon = addBody(10, 0xffff00, Earth, 2, 1);
}

/*
Add a celestial body
a: semi-major axis
c: color
p: primary graviational influence aka parent
r: radius
t: period of rotation
*/
function addBody(a, c, p, r, t) {
  var geometry = new THREE.SphereGeometry(r, 32, 32);
  var material = new THREE.MeshBasicMaterial({color: c});
  var body = new THREE.Mesh(geometry, material);

  body.a = a;
  body.p = p;
  body.t = t;

  scene.add(body);
  bodies.push(body);

  return body;
}

function animate() {
  requestAnimationFrame(animate);

  for (var i = 0; i < bodies.length; i++) {
    updatePosition(bodies[i]);
  }

  renderer.render(scene, camera);
  controls.update();
}

function updatePosition(body) {
  var ms = Date.now() - Date.UTC(2000, 0, 1, 12, 0, 0);
  var sec = ms / 1000;

  var x = body.a * Math.cos((2 * Math.PI * sec) / body.t);
  var y = body.a * Math.sin((2 * Math.PI * sec) / body.t);

  if (body.p) {
    x += body.p.position.x;
    y += body.p.position.y;
  }

  body.position.x = x;
  body.position.y = y;
}
