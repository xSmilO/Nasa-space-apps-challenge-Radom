import gsap from "gsap";
import {Camera, MathUtils, Mesh, MeshStandardMaterial, SphereGeometry, SRGBColorSpace, Texture, TextureLoader, Vector3, type WebGLProgramParametersWithUniforms } from "three";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import { EarthTextureBlendingShader } from "../shader/earthTextureBlending";
import { EarthTextureBlendingLegacyShader } from "../shader/earthTextureBlendingLegacy";

export class Earth extends Mesh {
  private static longitudalOffset: number = 90.015;
  private static latitudalOffset: number = -0.01;

  public textureLoader: TextureLoader;
  public clouds: Mesh;

  constructor(textureLoader: TextureLoader) {
    super();

    this.textureLoader = textureLoader;
    this.clouds = new Mesh();

    this.geometry = this.makeSphere(100.0);
    this.material = new MeshStandardMaterial({
      map: this.initializeTexture("day.jpg"),
      transparent: false,
      opacity: 1.0,
      depthWrite: true
    });
    
    this.clouds.geometry = this.makeSphere(101.0);
    this.clouds.material = new MeshStandardMaterial({
      map: this.initializeTexture("clouds.jpg"),
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
  }

  private initializeTexture(fileName: string, useSRGB: boolean = true): Texture {
    const texture: Texture = this.textureLoader.load(`./../../assets/textures/earth/${fileName}`);
    
    if(useSRGB) {
      texture.colorSpace = SRGBColorSpace;
    }
    
    return texture;
  }

  private makeSphere(radius: number): SphereGeometry {
    return new SphereGeometry(
      radius,
      128,
      128
    );
  }

  public enableNightTimeTexture(lightDirection: Vector3, camera: Camera): void {
    const material: MeshStandardMaterial = ((this.material) as MeshStandardMaterial);
    material.map = this.initializeTexture("day.jpg", false);

    material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
      const lightDirectionViewSpace: Vector3 = new Vector3();

      lightDirectionViewSpace.copy(lightDirection);
      lightDirectionViewSpace.transformDirection(camera.matrixWorldInverse);

      shader.uniforms.dayTexture = {value: material.map}
      shader.uniforms.nightTexture = {value: this.initializeTexture("night.jpg")}
      shader.uniforms.customLightDirection = {value: lightDirectionViewSpace}

      shader.vertexShader = EarthTextureBlendingLegacyShader.vertex;
      shader.fragmentShader = EarthTextureBlendingLegacyShader.fragment;
    };
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