import {PerspectiveCamera, Scene } from "three";

export class World {
  public camera3D: PerspectiveCamera;
  public scene: Scene;

  constructor() {
    this.scene = new Scene();
    this.camera3D = new PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight
    );
  }
}