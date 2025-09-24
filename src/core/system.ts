import { Camera, Scene, SRGBColorSpace, TextureLoader, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class System {
  private renderer: WebGLRenderer;
  private textures: TextureLoader;
  private controls?: OrbitControls;

  constructor(scene: Scene, camera: Camera, animator?: (time: DOMHighResTimeStamp, frame: XRFrame) => void) {
    this.renderer = new WebGLRenderer();
    this.textures = new TextureLoader();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop((time: DOMHighResTimeStamp, frame: XRFrame) => {
      this.renderer.render(scene, camera);

      if(animator != undefined) {
        animator(time, frame);
      }
    });

    this.renderer.outputColorSpace = SRGBColorSpace;
    this.controls = new OrbitControls(camera, this.renderer.domElement);

    this.controls.enablePan = false;
    this.controls.maxDistance = 1200;
    this.controls.minDistance = 115;

    document.body.appendChild(this.renderer.domElement);
  }

  public getRenderer(): WebGLRenderer {
    return this.renderer;
  }

  public getTextures(): TextureLoader {
    return this.textures;
  }

  public getControls(): OrbitControls {
    return this.controls as OrbitControls;
  }
}