import { AmbientLight, DirectionalLight, Raycaster, Vector2 } from "three";
import { World } from "./core/world";
import { System } from "./core/system";
import { Earth } from "./element3D/earth";
import { Radar } from "./utility/radar";

const world: World = new World();
const system: System = new System(world.getScene(), world.getCamera3D());

const earth: Earth = world.addElement3D(new Earth(system)) as Earth;
const light: DirectionalLight = world.addElement3D(new DirectionalLight(
  0xffffff,
  2.0
)) as DirectionalLight;

const raycaster: Raycaster = new Raycaster();
const radar: Radar = new Radar(); radar.update(earth.getGeolocalization(world.getCamera3D(), system.getControls()), radar.resolveZoom(system.getControls()))

system.getRenderer().setClearColor(0x0d0d0f);
world.getCamera3D().position.z = 200;

light.position.set(5, 3, 5);
world.addElement3D(new AmbientLight(0xffffff, 0.5));

window.addEventListener("mousemove", (event) => {
  const mousePos: Vector2 = new Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const isLMBDown: boolean = (event.buttons & 1) === 1;

  raycaster.setFromCamera(mousePos, world.getCamera3D());
  system.getControls().enabled = (raycaster.intersectObject(earth).length > 0) || isLMBDown;

  if(isLMBDown) {
    const geolocalization = earth.getGeolocalization(world.getCamera3D(), system.getControls());
    const zoom: string = radar.resolveZoom(system.getControls());

    radar.update(geolocalization, zoom);
  }
});

window.addEventListener("wheel", () => {
  if(system.getControls().enabled) {
    const geolocalization = earth.getGeolocalization(world.getCamera3D(), system.getControls());
    const zoom: string = radar.resolveZoom(system.getControls());

    radar.update(geolocalization, zoom);
  }
})