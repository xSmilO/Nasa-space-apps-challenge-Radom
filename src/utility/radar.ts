import type { OrbitControls } from "three/examples/jsm/Addons.js";
import { easeInCirc, easeInQuad, easeOutCirc } from "./easings";

export class Radar {
  private radarImage: HTMLImageElement;
  private zoomTreshold: number = 4;

  constructor() {
    this.radarImage = document.getElementById("radarImage") as HTMLImageElement;
  }

  public resolveZoom(controls: OrbitControls): string {
    const distance: number = controls.getDistance();
    const inverted = 1200 - distance;
    const zoom = inverted / 120;
    const finalZoom = Math.abs(this.zoomTreshold - zoom);

    return Math.max(finalZoom, 1).toFixed();
  }

  public update(geolocalization: {longitude: number, latitude: number}, zoom: string): void {
    this.radarImage.src = `/radar/generate?longitude=${geolocalization.longitude}&latitude=${geolocalization.latitude}&zoom=${4}`
  }
}