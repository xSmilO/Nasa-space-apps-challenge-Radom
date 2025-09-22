import { AmbientLight, BufferGeometry, Camera, Controls, Material, Mesh, PerspectiveCamera, Scene, WebGLRenderer, type ColorRepresentation } from "three";

export class World {
  private renderer: WebGLRenderer;
  private camera3D: PerspectiveCamera;
  private scene: Scene;
  private mainLoopFunction: (time: DOMHighResTimeStamp, frame: XRFrame) => void;
  private controls?: Controls<{}>;

  constructor(mainLoopFunction: (time: DOMHighResTimeStamp, frame: XRFrame) => void) {
    this.renderer = new WebGLRenderer();
    this.scene = new Scene();
    this.camera3D = new PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight
    );

    this.mainLoopFunction = mainLoopFunction;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop((time: DOMHighResTimeStamp, frame: XRFrame) => {
      this.renderer.render(this.scene, this.camera3D);
      mainLoopFunction(time, frame);
    });

    document.body.appendChild(this.renderer.domElement);
  }

  public getCamera3D(): Camera {
    return this.camera3D;
  }

  public getScene(): Scene {
    return this.scene;
  }

  public getControls(): Controls<{}> | undefined {
    return this.controls;
  }

  public getRenderer(): WebGLRenderer {
    return this.renderer;
  }

  public addControls(controls: Controls<{}>): Controls<{}> | undefined {
    this.controls = controls;
    this.controls.enabled = true;

    return controls;
  }

  public addAmbientLight(color: ColorRepresentation, intensity?: number): AmbientLight {
    const light: AmbientLight = new AmbientLight(color, intensity);
    
    light.position.z = -200.0;
    light.castShadow = true;

    this.scene.add(light);
    
    return light;
  }

  public add3DElement(geometry: BufferGeometry, material: Material): Mesh {
    const element: Mesh = new Mesh(geometry, material);
    this.scene.add(element);
    return element;
  }

  public setBackgroundColor(color: ColorRepresentation): void {
    this.renderer.setClearColor(color);
  }
}