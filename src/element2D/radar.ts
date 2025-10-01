import { GeoJSONSource, Map } from "maplibre-gl";
import Environment from "../core/environment";
import gsap from "gsap";

export class Radar extends Map {
  private static readonly impactSpotMarkingSourceID = "fb98509c-425c-40a0-ae84-97e55fefe257";
  private static readonly impactSpotMarkingLayerID = "915fcb31-9dbd-4e01-bb9f-b8f030fff7ce";

  private htmlElement: HTMLDivElement;
  private environment: Environment;

  constructor(environment: Environment) {
    super({
      container: "radarContainer",
      style: "/server/getStyle",
      center: [0.0, 0.0],
      zoom: 0,
      interactive: false
    });

    this.htmlElement = document.getElementById("radar") as HTMLDivElement;
    this.environment = environment;
  }

  public update(): void {
    const geolocalization: { longitude: number, latitude: number } = this.environment.earth.getGeolocation(this.environment.controls);
    const zoom: number = this.resolveRadarZoom();

    try {
      this.setCenter([geolocalization.longitude, geolocalization.latitude]);
      this.setZoom(zoom);
      this.resize();

      if (zoom == 10) {
        this.htmlElement.classList.add("bigger");
        return;
      }

      if (zoom < 2) {
        this.htmlElement.classList.add("smaller");
        return;
      }

      this.htmlElement.classList.remove("bigger", "smaller");
    } catch (exception: any) { }
  }

  public removeImpactSpotMarking(): void {
    if (this.getSource(Radar.impactSpotMarkingSourceID)) {
      this.removeLayer(Radar.impactSpotMarkingLayerID);
      this.removeSource(Radar.impactSpotMarkingSourceID);
    }
  }

  public show(): void {
    this.htmlElement.classList.remove("hidden");
  }

  public hide(): void {
    this.htmlElement.classList.add("hidden");
  }

  private drawImpactSpotMarking(center: { latitude: number, longitude: number }, radius: number, color: string, opacity: number): void {
    const points: [number, number][] = [];
    const earthRadiusMeters: number = 6371000;
    const latitude = center.latitude * Math.PI / 180.0;
    const longitude: number = center.longitude * Math.PI / 180.0;
    const pointsCount: number = 64;

    for (let i: number = 0; i < pointsCount; i++) {
      const angle: number = (i / pointsCount) * 2 * Math.PI;
      const deltaX: number = radius * Math.cos(angle);
      const deltaY: number = radius * Math.sin(angle);
      const deltaLatitude: number = deltaY / earthRadiusMeters;
      const deltaLongitude: number = deltaX / (earthRadiusMeters * Math.cos(latitude));
      const pointLatitude = latitude + deltaLatitude;
      const pointLongitude = longitude + deltaLongitude;

      points.push([pointLongitude * 180.0 / Math.PI, pointLatitude * 180.0 / Math.PI]);
    }

    const circle: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [points]
      },
      properties: {}
    };

    if (this.getSource(Radar.impactSpotMarkingSourceID)) {
      (this.getSource(Radar.impactSpotMarkingSourceID) as GeoJSONSource).setData(circle);
      return;
    }

    this.addSource(Radar.impactSpotMarkingSourceID, {
      type: "geojson",
      data: circle
    });

    this.addLayer({
      id: Radar.impactSpotMarkingLayerID,
      type: "fill",
      source: Radar.impactSpotMarkingSourceID,
      paint: {
        "fill-color": color,
        "fill-opacity": opacity
      }
    });
  }

  public markImpactSpot(center: { latitude: number, longitude: number }, radiusMeters: number, animate: boolean = true, animationDuration: number = 1.0, color: string = "#f00", opacity: number = 0.5): void {
    if (animate) {
      const object: { radius: number } = { radius: 0, };

      gsap.to(object, {
        radius: radiusMeters,
        duration: animationDuration,
        ease: "power1.inOut",
        onUpdate: () => {
          this.drawImpactSpotMarking(center, object.radius, color, opacity);
        }
      });

      return;
    }

    this.drawImpactSpotMarking(center, radiusMeters, color, opacity);
  }

  private resolveGoodZoomValue(zoom: number): number {
    return parseInt(zoom.toFixed());
  }

  private resolveRadarZoom(): number {
    const minDistance: number = this.environment.controls.minDistance;
    const maxDistance: number = this.environment.controls.maxDistance;
    const distance: number = this.environment.controls.getDistance();
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

        return this.resolveGoodZoomValue(Math.max(minZoom, Math.min(maxZoom, zoom)));
      }
    }

    return this.resolveGoodZoomValue(minZoom);
  }
}
