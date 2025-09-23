import { AmbientLight, DirectionalLight, Raycaster, Vector2 } from "three";
import { World } from "../core/world";
import { Engine } from "../core/engine";
import { Earth } from "./earth";
import * as leaflet from "leaflet";

const world: World = new World();
const engine: Engine = new Engine(world.getScene(), world.getCamera3D(), () => {
  const geolocalization = earth.getGeolocalization(world.getCamera3D(), engine.getControls());

  marker.setLatLng([geolocalization.latitude, geolocalization.longitude]).bindPopup(`Lat: ${geolocalization.latitude.toFixed(2)}, Lon: ${geolocalization.longitude.toFixed(2)}`);
  leafletMap.setZoom(engine.getControls().zoom0);
});

const earth: Earth = world.add3DElement(new Earth(engine)) as Earth;
const light: DirectionalLight = world.add3DElement(new DirectionalLight(
  0xffffff,
  2.0
)) as DirectionalLight;

const raycaster: Raycaster = new Raycaster();
const leafletMap: leaflet.Map = leaflet.map("radar").setView([0.0, 0.0], 2.0);
const marker: leaflet.Marker = leaflet.marker([0.0, 0.0]).addTo(leafletMap);

engine.getRenderer().setClearColor(0x0d0d0f);
world.getCamera3D().position.z = 200;

light.position.set(5, 3, 5);
world.add3DElement(new AmbientLight(0xffffff, 0.5));

leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(leafletMap);

window.addEventListener("mousemove", (event) => {
  const mousePos: Vector2 = new Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const isLMBDown: boolean = (event.buttons & 1) === 1;

  raycaster.setFromCamera(mousePos, world.getCamera3D());
  engine.getControls().enabled = (raycaster.intersectObject(earth).length > 0) || isLMBDown;
});