import type { OrbitControls } from "three/examples/jsm/Addons.js";

function resolveGoodZoomValue(zoom: number): number {
  return parseInt(zoom.toFixed());
}

export function resolveRadarZoomLegacy(controls: OrbitControls): number {
  const minDistance: number = controls.minDistance;
  const maxDistance: number = controls.maxDistance;
  const distance: number = controls.getDistance();
  const maxZoom = 10
  const minZoom = 0;
  const anchorDistance = 200;
  const anchorZoom = 2;
  const distanceClamped = Math.max(minDistance, Math.min(maxDistance, distance));
  const range = maxDistance - minDistance;

  if(range <= 0) return resolveGoodZoomValue(anchorZoom);

  const delta = (distanceClamped - minDistance) / range;
  const anchorDelta = (anchorDistance - minDistance) / range;

  if(anchorDelta <= 0 || anchorZoom >= maxZoom) {
    const zoom = maxZoom * (1 - Math.pow(delta, 1.0));
    return resolveGoodZoomValue(Math.max(minZoom, Math.min(maxZoom, zoom)));
  }
  
  const exponent = Math.log(1 - anchorZoom / maxZoom) / Math.log(anchorDelta);
  const zoom = maxZoom * (1 - Math.pow(delta, exponent));

  return resolveGoodZoomValue(Math.max(minZoom, Math.min(maxZoom, zoom)));
}

export function resolveRadarZoom(controls: OrbitControls): number {
  const minDistance: number = controls.minDistance;
  const maxDistance: number = controls.maxDistance;
  const distance: number = controls.getDistance();
  const maxZoom: number = 10;
  const minZoom: number = 0;

  const anchors: [number, number][] = [
    [minDistance, maxZoom],
    [9, 8],
    [13, 2],
    [maxDistance, minZoom],
  ];

  const distanceClamped = Math.max(minDistance, Math.min(maxDistance, distance));

  for (let i = 0; i < anchors.length - 1; i++) {
    const [d1, z1]: [number, number] = anchors[i];
    const [d2, z2]: [number, number] = anchors[i + 1];
    if (distanceClamped >= d1 && distanceClamped <= d2) {
      const delta: number = (distanceClamped - d1) / (d2 - d1);
      const zoom: number = z1 + (z2 - z1) * delta;

      return resolveGoodZoomValue(Math.max(minZoom, Math.min(maxZoom, zoom)));
    }
  }

  return resolveGoodZoomValue(minZoom);
}