import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshStandardMaterial({
    wireframe: true,
    color: 0x00ff00,
});
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true;

function animate() {
    renderer.render(scene, camera);
}

