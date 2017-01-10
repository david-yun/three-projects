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
  //                   a         c   e   F     M      p   r   R
  var Sun   = addBody( 5, "yellow",  0,  0, .005,  null, 10,  0);
  var Earth = addBody(10,   "blue", .1,  0,  .02,   Sun,  5, 20);
  var Moon  = addBody( 5,  "white", .1,  0,  .05, Earth,  2,  5);
  var Mars  = addBody(30, "orange", .3,  1,  .01,   Sun,  5, 30);
}

/*
Add a celestial body
a: semi-major axis
c: color
e: eccentricity
F: initial true anomaly
M: mean anomaly
p: primary graviational influence aka parent
r: physical radius
R: initial radius from parent
*/
function addBody(a, c, e, F, M, p, r, R) {
  var geometry = new THREE.SphereGeometry(r, 32, 32);
  var material = new THREE.MeshBasicMaterial({color: c});
  var body = new THREE.Mesh(geometry, material);

  body.a = a;
  body.e = e;
  body.F = F;
  body.M = M;
  body.p = p;
  body.R = R;

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
  // Arbitrary speed constant
  var speed = 100;
  var currentM = body.M * sec * speed;

  var E = calcE(body.e, currentM);
  var F = calcF(body.e, E) + body.F;
  var R = calcR(body.a, body.e, E) + body.R;

  var x = R * Math.cos(F);
  var y = R * Math.sin(F);

  if (body.p) {
    x += body.p.position.x;
    y += body.p.position.y;
  }

  body.position.x = x;
  body.position.y = y;
}

// Calculate E using Newton's method
function calcE(e, M) {
  // Assume that E is close to M
  var E = M;

  while(true) {
    var dE = (E - e * Math.sin(E) - M)/(1 - e * Math.cos(E));
    E -= dE;
    // Accept the approximation of E if dE is less than 1e-5
    if(Math.abs(dE) < 1e-5) break;
  }

  return E;
}

function calcF(e, E) {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

function calcR(a, e, E) {
  return a * (1 - e * Math.cos(E));
}
