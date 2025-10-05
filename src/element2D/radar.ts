import { GeoJSONSource, Map } from "maplibre-gl";
import Environment from "../core/environment";
import gsap from "gsap";
import * as turf from "@turf/turf";

export class Radar extends Map {
    public static readonly impactSpotMarkingSourceID =
        "fb98509c-425c-40a0-ae84-97e55fefe257";
    public static readonly impactSpotMarkingLayerID =
        "915fcb31-9dbd-4e01-bb9f-b8f030fff7ce";

    public static readonly dustRangeSourceID =
        "14de7595-92ec-4801-9974-77fb84973519";
    public static readonly dustRangeLayerID =
        "86442a7a-47c5-4342-9666-6f0d3072fb86";

    public static readonly fireballRangeSourceID =
        "6e31fc37-ceff-4c58-86d9-32dafb033110";
    public static readonly fireballRangeLayerID =
        "abd5317d-b682-44cd-bbd3-eef6f0dc4bc3";

    private htmlElement: HTMLDivElement;
    private environment: Environment;
    private isDraggable: boolean;

    constructor(environment: Environment) {
        super({
            container: "radarContainer",
            style: "https://nasa-space-apps-challenge-radom-bac.vercel.app/getStyle",
            center: [0.0, 0.0],
            zoom: 0,
            interactive: false,
        });

        this.htmlElement = document.getElementById("radar") as HTMLDivElement;
        this.environment = environment;
        this.isDraggable = false;
    }

    public fullscreen(): void {
        this.htmlElement.classList.remove("hidden");
        this.htmlElement.classList.add("fullscreen");

        this.setZoom(7);
        // this.dragPan.enable();
        // this.scrollZoom.enable();
        //
        // this.isDraggable = true;
    }

    public update(): void {
        if (this.isDraggable) return;

        const geolocalization: { longitude: number; latitude: number } =
            this.environment.earth.getGeolocation(this.environment.controls);
        const zoom: number = this.resolveRadarZoom();

        try {
            this.setCenter([
                geolocalization.longitude,
                geolocalization.latitude,
            ]);
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
        } catch (exception: any) {}
    }

    public removeImpactSpotMarking(layerID: string, sourceID: string): void {
        if (this.getSource(sourceID)) {
            this.removeLayer(layerID);
            this.removeSource(sourceID);
        }
    }

    public show(): void {
        this.htmlElement.classList.remove("hidden");
        this.htmlElement.classList.remove("fullscreen");
    }

    public hide(): void {
        this.htmlElement.classList.add("hidden");
    }

    public enableMeteorMode(): void {
        this.htmlElement.classList.add("meteorMode");
    }

    public disableMeteorMode(): void {
        this.htmlElement.classList.remove("meteorMode");
    }

    private drawImpactSpotMarking(
        center: { latitude: number; longitude: number },
        radius: number,
        color: string,
        opacity: number,
        layerID: string,
        sourceID: string
    ): void {
        const circle = turf.circle(
            turf.point([center.longitude, center.latitude]),
            radius,
            {
                units: "meters",
            }
        );

        if (this.getSource(sourceID)) {
            (this.getSource(sourceID) as GeoJSONSource).setData(circle);
            return;
        }

        this.addSource(sourceID, {
            type: "geojson",
            data: circle,
        });

        this.addLayer({
            id: layerID,
            type: "fill",
            source: sourceID,
            paint: {
                "fill-color": color,
                "fill-opacity": opacity,
            },
        });
    }

    public markSpot(
        layerID: string,
        sourceID: string,
        center: { latitude: number; longitude: number },
        radiusMeters: number,
        color: string = "#f00",
        opacity: number = 0.5,
        animate: boolean = true,
        animationDuration: number = 1.0
    ): void {
        if (animate) {
            const object: { radius: number } = { radius: 0 };

            gsap.to(object, {
                radius: radiusMeters,
                duration: animationDuration,
                ease: "power1.inOut",
                onUpdate: () => {
                    this.drawImpactSpotMarking(
                        center,
                        object.radius,
                        color,
                        opacity,
                        layerID,
                        sourceID
                    );
                },
            });

            return;
        }

        this.drawImpactSpotMarking(
            center,
            radiusMeters,
            color,
            opacity,
            layerID,
            sourceID
        );
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

        const distanceClamped = Math.max(
            minDistance,
            Math.min(maxDistance, distance)
        );

        for (let i = 0; i < anchors.length - 1; i++) {
            const [d1, z1]: [number, number] = anchors[i];
            const [d2, z2]: [number, number] = anchors[i + 1];
            if (distanceClamped >= d1 && distanceClamped <= d2) {
                const delta: number = (distanceClamped - d1) / (d2 - d1);
                const zoom: number = z1 + (z2 - z1) * delta;

                return this.resolveGoodZoomValue(
                    Math.max(minZoom, Math.min(maxZoom, zoom))
                );
            }
        }

        return this.resolveGoodZoomValue(minZoom);
    }
}
