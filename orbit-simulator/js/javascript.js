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
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 1000;
  scene.add(camera);

  // Add OrbitControls so that we can pan around with the mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  /* Create celestial bodies
   * a and R (10^9 m), F and M (radians), r (relative)
   *                                     a         c           e       F    M          n      p   r      R
   */
  const Sun     = CelestialBody(         0, "yellow",          0,      0,   0,     "Sun",  null,  8,     0);
  const Mercury = CelestialBody( 57.909176,   "gray", 0.20563069,  1.598,   2, "Mercury",   Sun,  3, 55.78);
  const Venus   = CelestialBody( 108.20893, "yellow", 0.00677323,  5.139, 1.5,   "Venus",  null,  3, 107.9);
  const Earth   = CelestialBody(149.597887,   "blue", 0.01671022, 0.1185,   1,   "Earth",   Sun,  5, 147.1);
  const Mars    = CelestialBody(227.936637, "orange", 0.09341233, 0.8021, 0.5,    "Mars",   Sun,  5, 212.2);
  const Jupiter = CelestialBody(778.412027,  "brown",   0.048498,  3.091, 0.2, "Jupiter",   Sun, 20, 816.2);
  const Saturn  = CelestialBody(   1429.39, "yellow",    0.05555,  2.907,  .1,  "Saturn",   Sun, 20,  1503);
  const Uranus  = CelestialBody(   2875.04,   "cyan",   0.046381,  3.685,  .1,  "Uranus",   Sun, 20,  2983);
  const Neptune = CelestialBody(   4504.45,   "blue",   0.009456,  5.104,  .1, "Neptune",   Sun, 20,  4481);

  // Add them to the solarSystem
  solarSystem = SolarSystem([Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune]);
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
 * F   : initial true anomaly
 * M   : mean anomaly
 * name: name
 * p   : primary graviational influence aka parent
 * r   : physical radius
 * R   : initial radius from parent
 */
function CelestialBody(a, c, e, F, M, name, p, r, R) {
  const geometry = new THREE.SphereGeometry(r, 32, 32);
  const material = new THREE.MeshBasicMaterial({color: c});
  const body = new THREE.Mesh(geometry, material);

  // Scale a and R by 1/10
  body.a    = a / 10;
  body.e    = e;
  body.F    = F;
  body.M    = M;
  body.name = name;
  body.p    = p;
  body.R    = R / 10;

  scene.add(body);

  function getX() { return body.position.x; }
  function getY() { return body.position.y; }

  function updatePosition() {
    const ms = Date.now() - Date.UTC(2000, 0, 1, 12, 0, 0);
    const sec = ms / 1000;
    // Arbitrary speed constant
    const speed = 1;
    const currentM = body.M * sec * speed;

    const E = calcE(body.e, currentM);
    const F = calcF(body.e, E) + body.F;
    const R = calcR(body.a, body.e, E) + body.R;

    let x = R * Math.cos(F);
    let y = R * Math.sin(F);

    if (body.p) {
      x += body.p.getX();
      y += body.p.getY();
    }

    body.position.x = x;
    body.position.y = y;
  }


  return {
    getX: getX,
    getY: getY,
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
