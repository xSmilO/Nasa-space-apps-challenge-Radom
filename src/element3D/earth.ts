import { Camera, MathUtils, Mesh, MeshStandardMaterial, SphereGeometry, SRGBColorSpace, Texture, TextureLoader, Vector3 } from "three";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import { SETTINGS } from "../core/Settings";

const SIDE_ROT_PER_SEC = 0.00007292115;

export class Earth extends Mesh {
  public radius: number;
  private customTexture: Texture;

  constructor(textureLoader: TextureLoader) {
    super();
    this.radius = 6371 / SETTINGS.SIZE_SCALE;
    this.geometry = new SphereGeometry(
      this.radius, 200, 200
    );

    this.customTexture = textureLoader.load("./../../assets/textures/earth.jpg");
    this.material = new MeshStandardMaterial({
      map: this.customTexture
    });

    this.customTexture.colorSpace = SRGBColorSpace;
  }

  public update(date: Date) {
    this.rotateObject(date);
  }

  public rotateObject(date: Date): void {
    let secondsElapsed = date.getTime() / 1000;

    this.rotation.y = SIDE_ROT_PER_SEC * secondsElapsed;
  }

  public getGeolocalization(camera: Camera, controls: OrbitControls): { longitude: number, latitude: number } {
    const dir = new Vector3(); dir.subVectors(camera.position, controls.target).normalize();
    const lat = MathUtils.radToDeg(Math.asin(dir.y));
    const lon = MathUtils.radToDeg(Math.atan2(dir.x, dir.z));

    return {
      longitude: lon - 90.75,
      latitude: lat
    };
  }
}
