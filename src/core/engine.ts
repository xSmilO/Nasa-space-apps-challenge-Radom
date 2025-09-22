import { TextureLoader } from "three";

export class Engine {
  public textures: TextureLoader;

  constructor() {
    this.textures = new TextureLoader();
  }
}