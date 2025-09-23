import { AmbientLight, DirectionalLight, Raycaster, Vector2, Vector3 } from "three";
import { World } from "./core/world";
import { Engine } from "./core/engine";
import { Earth } from "./earth";
import * as THREE from 'three';


const world: World = new World();
const engine: Engine = new Engine(world.getScene(), world.getCamera3D())

const earth: Earth = world.add3DElement(new Earth(engine)) as Earth;
const light: DirectionalLight = world.add3DElement(new DirectionalLight(
  0xffffff,
  2.0
)) as DirectionalLight;

engine.getRenderer().setClearColor(0x0d0d0f);
world.getCamera3D().position.z = 200;

light.position.set(5, 3, 5);
world.add3DElement(new AmbientLight(0xffffff, 0.5));

const raycaster: Raycaster = new Raycaster();
let intersects;
let p: Vector3;

const hitMarker = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({ color: 0x0000ff }));

world.add3DElement(hitMarker);

window.addEventListener("mousemove", (e: MouseEvent) => {
  // const mousePos: Vector2 = new Vector2(
  //   (e.clientX / window.innerWidth) * 2 - 1,
  //   (e.clientY / window.innerHeight) * 2 - 1
  // )
  console.log("kurwa!!!")

  const isLMBDown: boolean = (e.buttons & 1) === 1;

  if (!isLMBDown) return;

  raycaster.setFromCamera(new Vector2(0, 0), world.getCamera3D());
  intersects = raycaster.intersectObject(earth, false);

  if (intersects.length > 0) {
    p = intersects[0].point;

    toLatLon(p, 100);
  }
})

function toLatLon(point: Vector3, radius: number) {
  const nx = point.x / radius;
  const ny = point.y / radius;
  const nz = point.z / radius;

  const theta = Math.acos(ny);
  const phi = Math.atan2(nx, nz);

  const lat = 90 - THREE.MathUtils.radToDeg(theta);
  const lon = THREE.MathUtils.radToDeg(phi);

  let tempLat = 90 - (57.2957795 * (Math.acos(-point.y / radius)));
  let tempLon: number = 0;
  if (Math.abs(tempLat) < 80.01) {
    if (point.y >= 0) {
      tempLat = -tempLat
    }
    if (point.y < 0) {
      tempLat = Number(-(tempLat))
    }
    if (point.z >= 0) {
      tempLon = 0 + (57.2957795 * Math.atan(point.x / point.z));
    }
    if (point.z < 0) {
      tempLon = (180 + (57.2957795 * Math.atan(point.x / point.z)));
      if (tempLon <= 180) {
      } else {
        tempLon = -90 - (270 - tempLon);
      }
    }
  }

  hitMarker.position.copy(point)

  console.log(`My ${lat}/${lon} His: ${tempLat}/${tempLon}`)
}
