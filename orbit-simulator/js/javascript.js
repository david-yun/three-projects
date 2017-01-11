// Global vars
let camera, controls, renderer, scene, solarSystem;

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
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1e10);
  camera.position.z = 1e3;
  scene.add(camera);

  // Add OrbitControls so that we can pan around with the mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  /* Create celestial bodies
   *                              a         c    e  i  F  M          n        p    r    R
   */
  const Sun     = CelestialBody(  0, "yellow",   0, 0, 0, 0,     "Sun",    null, 100,   0);
  const Planet1 = CelestialBody(100,    "red", 0.3, 0, 0, 3, "Planet1",     Sun,  10, 100);
  const Moon1   = CelestialBody( 10,  "white", 0.3, 0, 0, 6,   "Moon1", Planet1,   5,  10);
  const Planet2 = CelestialBody(200,   "blue", 0.4, 1, 0, 2, "Planet2",     Sun,  20, 200);
  const Moon2   = CelestialBody( 20,  "white", 0.4, 1, 0, 4,   "Moon2", Planet2,  10,  20);
  const Planet3 = CelestialBody(300, "orange", 0.5, 2, 0, 1, "Planet3",     Sun,  30, 300);
  const Moon3   = CelestialBody( 30,  "white", 0.5, 2, 0, 2,   "Moon3", Planet3,  15,  30);

  // Add them to the solarSystem
  solarSystem = SolarSystem([Sun, Planet1, Moon1, Planet2, Moon2, Planet3, Moon3]);
}

function animate() {
  requestAnimationFrame(animate);

  solarSystem.update();

  renderer.render(scene, camera);
  controls.update();
}

// SolarSystem class
function SolarSystem(bodies) {
  const bodies_ = bodies;

  function update() {
    bodies_.forEach((body) => {
      body.updatePosition();
    });
  }

  return {
    update: update
  };
};

/*
 * CelestialBody class
 * a   : semi-major axis
 * c   : color
 * e   : eccentricity
 * i   : inclination
 * F   : initial true anomaly
 * M   : mean anomaly
 * name: name
 * p   : primary graviational influence aka parent
 * r   : physical radius
 * R   : initial radius from parent
 */
function CelestialBody(a, c, e, i, F, M, name, p, r, R) {
  const geometry = new THREE.SphereGeometry(r, 32, 32);
  const material = new THREE.MeshBasicMaterial({color: c});
  const body = new THREE.Mesh(geometry, material);

  body.a    = a;
  body.e    = e;
  body.i    = i;
  body.F    = F;
  body.M    = M;
  body.name = name;
  body.p    = p;
  body.R    = R;

  scene.add(body);

  function getX() { return body.position.x; }
  function getY() { return body.position.y; }
  function getZ() { return body.position.z; }

  function updatePosition() {
    const ms = Date.now() - Date.UTC(2000, 0, 1, 12, 0, 0);
    const sec = ms / 1000;
    // Adjustable speed constant
    const speed = 1/2;
    const currentM = body.M * sec * speed;

    const E = calcE(body.e, currentM);
    const F = calcF(body.e, E) + body.F;
    const R = calcR(body.a, body.e, E) + body.R;

    let xy = R * Math.cos(F)
    let x  = xy * Math.cos(i);
    let y  = R * Math.sin(F);
    let z  = xy * Math.sin(i);

    if (body.p) {
      x += body.p.getX();
      y += body.p.getY();
      z += body.p.getZ();
    }

    body.position.x = x;
    body.position.y = y;
    body.position.z = z;
  }


  return {
    getX: getX,
    getY: getY,
    getZ: getZ,
    updatePosition: updatePosition
  };
};

// Calculate E using Newton's method
function calcE(e, M) {
  // Assume that E is close to M
  let E = M;
  let dE;

  do {
    dE = (E - e * Math.sin(E) - M)/(1 - e * Math.cos(E));
    E -= dE;
    // Accept the approximation of E if dE is less than 1e-5
  } while(Math.abs(dE) > 1e-5);

  return E;
}

function calcF(e, E) {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

function calcR(a, e, E) {
  return a * (1 - e * Math.cos(E));
}
