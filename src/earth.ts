import { Camera, MathUtils, Mesh, MeshStandardMaterial, SphereGeometry, SRGBColorSpace, Texture, Vector3 } from "three";
import type { Engine } from "./core/engine";
import type { OrbitControls } from "three/examples/jsm/Addons.js";

export class Earth extends Mesh {
  private customTexture: Texture;

  constructor(engine: Engine) {
    super();

    this.geometry = new SphereGeometry(
      100.0,
      128,
      128
    );

    this.customTexture = engine.getTextures().load("./../assets/textures/earth.jpg");
    this.material = new MeshStandardMaterial({
      map: this.customTexture
    });

    this.customTexture.colorSpace = SRGBColorSpace;

    this.rotation.order = "YXZ";
  }

  public setRotationFromGeolocalization(): void {
    navigator.geolocation.getCurrentPosition((geoPos) => {
      /* const latitude: number = geoPos.coords.latitude;
      const longitude: number = geoPos.coords.longitude;
      const phi: number = (90.0 - latitude) * (Math.PI / 180.0);
      const theta: number = (longitude + 180.0) * (Math.PI / 180.0);

      this.rotateY(-theta);
      this.rotateX(phi - Math.PI / 2.0); */

      const lat = geoPos.coords.latitude;
      const lon = geoPos.coords.longitude;

      // stopnie → radiany
      const latRad = lat * (Math.PI / 180);
      const lonRad = lon * (Math.PI / 180);

      // obrót wokół Y = długość geograficzna
      this.rotation.y = lonRad + Math.PI; // dodaj π, żeby "przesunąć" mapę

      // obrót wokół X = szerokość geograficzna
      this.rotation.x = -latRad;
    });
  }

  public getGeolocalization(camera: Camera, controls: OrbitControls): { longitude: number, latitude: number } {
    const dir = new Vector3(); dir.subVectors(camera.position, controls.target).normalize();
    const lat = MathUtils.radToDeg(Math.asin(dir.y));
    const lon = MathUtils.radToDeg(Math.atan2(dir.x, dir.z));

    console.log({ lat, lon });

    return {
      longitude: lon,
      latitude: lat
    };
  }
}
