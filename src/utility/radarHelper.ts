import type { OrbitControls } from "three/examples/jsm/Addons.js";
import { easeInCirc, easeInQuad, easeOutCirc } from "./easings";

export class RadarHelper {
  private static zoomTreshold: number = 2;

  private constructor() {}

  public static resolveZoom(controls: OrbitControls): number {
    const distance: number = controls.getDistance();
    const inverted = 1200 - distance;
    const zoom = inverted / 120;
    const finalZoom = Math.abs(this.zoomTreshold - zoom);

    return parseInt(Math.max(finalZoom, 1).toFixed());
  }
}