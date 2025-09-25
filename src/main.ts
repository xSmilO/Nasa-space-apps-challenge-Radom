import {
    AmbientLight,
    DirectionalLight,
    Raycaster,
    Vector2,
    Vector3,
} from "three";
import { World } from "./core/world";
import { Engine } from "./core/engine";
import { Earth } from "./earth";
import * as THREE from "three";

const world: World = new World();
const engine: Engine = new Engine(world.getScene(), world.getCamera3D());

const earth: Earth = world.add3DElement(new Earth(engine)) as Earth;
const light: DirectionalLight = world.add3DElement(
    new DirectionalLight(0xffffff, 2.0)
) as DirectionalLight;

engine.getRenderer().setClearColor(0x0d0d0f);
world.getCamera3D().position.z = 200;

light.position.set(5, 3, 5);
world.add3DElement(new AmbientLight(0xffffff, 0.5));

const raycaster: Raycaster = new Raycaster();
let intersects;
let p: Vector3;

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

