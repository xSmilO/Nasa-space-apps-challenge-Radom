import { Camera, MathUtils, Mesh, MeshStandardMaterial, SphereGeometry, SRGBColorSpace, Texture, Vector3 } from "three";
import type { System } from "../core/system";
import type { OrbitControls } from "three/examples/jsm/Addons.js";

export class Earth extends Mesh {
  private customTexture: Texture;

  constructor(system: System) {
    super();

    this.geometry = new SphereGeometry(
      100.0,
      128,
      128
    );

    this.customTexture = system.getTextures().load("./../../assets/textures/earth.jpg");
    this.material = new MeshStandardMaterial({
      map: this.customTexture
    });
    
    this.customTexture.colorSpace = SRGBColorSpace;
  }

  public getGeolocalization(camera: Camera, controls: OrbitControls): {longitude: number, latitude: number} {
    const dir = new Vector3(); dir.subVectors(camera.position, controls.target).normalize();
    const lat = MathUtils.radToDeg(Math.asin(dir.y));
    const lon = MathUtils.radToDeg(Math.atan2(dir.x, dir.z));

    return {
      longitude: lon - 87.5,
      latitude: lat - 2.0
    };
  }
}