import { Camera, Scene, SRGBColorSpace, TextureLoader, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class System {
  public renderer: WebGLRenderer;
  public textures: TextureLoader;
  public controls: OrbitControls;

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
}