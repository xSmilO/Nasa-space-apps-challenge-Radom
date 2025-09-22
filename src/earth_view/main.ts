import { MeshBasicMaterial, MeshStandardMaterial, SphereGeometry } from "three";
import { World } from "../core/world";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Engine } from "../core/engine";

const world: World = new World(() => {});
const engine: Engine = new Engine();

world.addAmbientLight(0xffffff, 10.0);
world.add3DElement(new SphereGeometry(
  100.0,
  128,
  128
), new MeshBasicMaterial({
  map: engine.textures.load("./../../assets/textures/earth.jpg"),
}));

world.addControls(new OrbitControls(world.getCamera3D(), world.getRenderer().domElement));
world.getCamera3D().position.z = 200;
world.setBackgroundColor(0x0d0d0f);