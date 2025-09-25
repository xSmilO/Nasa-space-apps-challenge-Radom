import gsap from "gsap";
import {MathUtils, Mesh, MeshStandardMaterial, SphereGeometry, SRGBColorSpace, Texture, TextureLoader, Vector3 } from "three";
import type { OrbitControls } from "three/examples/jsm/Addons.js";

export class Earth extends Mesh {
  private static longitudalOffset: number = 90.015;
  private static latitudalOffset: number = -0.015

  public textureLoader: TextureLoader;
  public clouds: Mesh;

  constructor(textureLoader: TextureLoader) {
    super();

    this.textureLoader = textureLoader;
    this.clouds = new Mesh();

    this.initializeSphere(this, 100.0, "day.jpg");
    this.initializeSphere(this.clouds, 101.0, "clouds.jpg", true, 0.75, false);
  }

  private initializeTexture(fileName: string): Texture {
    const texture: Texture = this.textureLoader.load(`./../../assets/textures/earth/${fileName}`);
    texture.colorSpace = SRGBColorSpace;
    
    return texture;
  }

  private initializeSphere(which: Mesh, radius: number, texture: string, materialTransparency: boolean = false, materialOpacity: number = 1.0, materialDepthWrite: boolean = true) {
    which.geometry = new SphereGeometry(
      radius,
      128,
      128
    );

    which.material = new MeshStandardMaterial({
      map: this.initializeTexture(texture),
      transparent: materialTransparency,
      opacity: materialOpacity,
      depthWrite: materialDepthWrite
    });
  }

  public rotateFromGeolocation(controls: OrbitControls): void {
    navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
      const longitude: number = MathUtils.degToRad(position.coords.longitude + Earth.longitudalOffset);
      const latitude: number = MathUtils.degToRad(position.coords.latitude + Earth.latitudalOffset);
      const directionVector: Vector3 = new Vector3(
        Math.sin(longitude) * Math.cos(latitude),
        Math.sin(latitude),
        Math.cos(longitude) * Math.cos(latitude)
      );

      const cameraPosition = directionVector.multiplyScalar(controls.getDistance());

      gsap.to(controls.object.position, {
        x: cameraPosition.x,
        y: cameraPosition.y,
        z: cameraPosition.z,
        duration: 1,
        ease: "power1.inOut",
        onUpdate: () => {
          controls.object.lookAt(controls.target);
        }
      });
    });
  }

  public rotateFromDebug(controls: OrbitControls) {
    controls.object.position.set(54.916056693992815, 82.02188541720652, -18.227105447870695);
    controls.object.lookAt(controls.target);
  }

  public getGeolocation(controls: OrbitControls): {longitude: number, latitude: number} {
    const directionVector = this.getCrosshairDirectionVector(controls);
    const longitude_ = MathUtils.radToDeg(Math.asin(directionVector.y));
    const latitude_ = MathUtils.radToDeg(Math.atan2(directionVector.x, directionVector.z));

    return {
      longitude: latitude_ - Earth.longitudalOffset,
      latitude: longitude_ - Earth.latitudalOffset
    };
  }

  public getCrosshairDirectionVector(controls: OrbitControls): Vector3 {
    return new Vector3().subVectors(controls.object.position, controls.target).normalize();
  }
}