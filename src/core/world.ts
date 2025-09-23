import { Camera, Mesh, Object3D, PerspectiveCamera, Scene } from "three";

export class World {
  private camera3D: PerspectiveCamera;
  private scene: Scene;

  constructor() {
    this.scene = new Scene();
    this.camera3D = new PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight
    );
  }

  public getCamera3D(): Camera {
    return this.camera3D;
  }

  public getScene(): Scene {
    return this.scene;
  }

  public add3DElement(element: Object3D): Object3D {
    this.scene.add(element);
    return element;
  }
}