import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- CAMERA CONTROLS ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 20;
controls.maxDistance = 300;
camera.position.set(0, 40, 120);
controls.update();

// --- LIGHTING ---
const pointLight = new THREE.PointLight(0xffffff, 3, 500);
scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// --- PLANETARY DATA ---
// NOTE: Speed is now the initial value for the sliders
const planetsData = [
    { name: 'Mercury', radius: 0.8, distance: 12, color: 0x8c8c8c, speed: 0.70 },
    { name: 'Venus',   radius: 1.2, distance: 18, color: 0xa57c1b, speed: 0.45 },
    { name: 'Earth',   radius: 1.3, distance: 25, color: 0x0077be, speed: 0.40 },
    { name: 'Mars',    radius: 0.9, distance: 35, color: 0xc1440e, speed: 0.38 },
    { name: 'Jupiter', radius: 4.0, distance: 55, color: 0xd8ca9d, speed: 0.32 },
    { name: 'Saturn',  radius: 3.5, distance: 80, color: 0xe0c89f, speed: 0.31, hasRing: true },
    { name: 'Uranus',  radius: 2.5, distance: 105, color: 0x7fecfd, speed: 0.035 },
    { name: 'Neptune', radius: 2.4, distance: 130, color: 0x3d5ef9, speed: 0.032 },
];

// This array will hold the objects used in the animation loop
const planetObjects = [];

// --- CREATE 3D OBJECTS ---
const sunGeometry = new THREE.SphereGeometry(6, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

planetsData.forEach(planetData => {
    const planetGeometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({ color: planetData.color, roughness: 0.8 });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    
    const orbit = new THREE.Object3D();
    orbit.add(planetMesh);
    planetMesh.position.x = planetData.distance;

    scene.add(orbit);

    const orbitPathGeometry = new THREE.RingGeometry(planetData.distance - 0.05, planetData.distance + 0.05, 128);
    const orbitPathMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const orbitPath = new THREE.Mesh(orbitPathGeometry, orbitPathMaterial);
    orbitPath.rotation.x = Math.PI / 2;
    scene.add(orbitPath);

    if (planetData.hasRing) {
        const ringGeometry = new THREE.RingGeometry(planetData.radius + 1, planetData.radius + 3, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = Math.PI * 0.4;
        planetMesh.add(ringMesh);
    }

    // Store the planet's data for animation and control
    planetObjects.push({ 
        mesh: planetMesh, 
        orbit: orbit, 
        speed: planetData.speed // This speed will be updated by the slider
    });
});

// --- CONTROL PANEL LOGIC ---

// --- NEW: Get references to the panel and toggle button ---
const controlPanel = document.getElementById('control-panel');
const toggleBtn = document.getElementById('toggle-controls-btn');
const controlsContainer = document.getElementById('planet-controls-container');

// --- NEW: Add event listener for the toggle button ---
toggleBtn.addEventListener('click', () => {
    // Toggle the 'hidden' class on the panel
    controlPanel.classList.toggle('hidden');
    
    // Update the button text based on the panel's state
    const isHidden = controlPanel.classList.contains('hidden');
    toggleBtn.textContent = isHidden ? 'Show Controls' : 'Hide Controls';
});



planetObjects.forEach((planet, index) => {
    // Get the planet's name from the original data array
    const planetName = planetsData[index].name;

    // Create a container for the planet's controls
    const controlDiv = document.createElement('div');
    controlDiv.className = 'planet-control';

    // Create the label
    const label = document.createElement('label');
    label.textContent = planetName;

    // Create the slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = 0.5; // A reasonable max speed for visualization
    slider.step = 0.0001;
    slider.value = planet.speed; // Set initial value

    // Create a span to display the current speed value
    const valueSpan = document.createElement('span');
    valueSpan.textContent = planet.speed.toFixed(4);

    // Add event listener to the slider
    slider.addEventListener('input', (event) => {
        const newSpeed = parseFloat(event.target.value);
        // This is the key part: update the speed in the animation object
        planet.speed = newSpeed;
        // Update the displayed value
        valueSpan.textContent = newSpeed.toFixed(4);
    });
    
    // Append elements to the control container
    controlDiv.appendChild(label);
    controlDiv.appendChild(slider);
    controlDiv.appendChild(valueSpan);
    controlsContainer.appendChild(controlDiv);
});


// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Animate planets using the speed from the planetObjects array
    planetObjects.forEach(planet => {
        planet.orbit.rotation.y = elapsedTime * planet.speed;
        planet.mesh.rotation.y += 0.005; 
    });
    
    sun.rotation.y += 0.0005;

    controls.update();
    renderer.render(scene, camera);
}

// --- RESPONSIVE DESIGN ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation
animate();