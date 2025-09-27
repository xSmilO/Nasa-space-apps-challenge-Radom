import {
    Color,
    Group,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    TextureLoader,
} from "three";
import Orbit from "./Orbit";

import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { UnixToJulianDate } from "../utility/dateConverter";
import { SETTINGS } from "../core/Settings";
import type { Environment } from "../core/environment";

export default class CelestialBody extends Mesh {
    public name: string;
    public radius: number;
    public trueAnomaly: number;
    public mesh: Mesh | Group | null = null;
    public group: Group;
    public meanMotion: number; // rad per day
    public meanAnomaly: number;
    public type: string;
    public hidden: boolean;
    protected textureUrl: string;
    protected orbit: Orbit | null = null;
    protected textureLoader: TextureLoader;
    protected label: CSS2DObject | null = null;
    protected icon: CSS2DObject | null = null;
    protected color: Color;
    protected htmlElements: HTMLDivElement[] = new Array<HTMLDivElement>(2);
    protected obliquity: number;
    protected sidRotPerSec: number;
    protected layer: number;
    protected environment: Environment;

    constructor(
        environment: Environment,
        name: string,
        radius: number,
        obliquity: number,
        sidRotPerSec: number,
        color: string,
        textureUrl: string,
        textureLoader: TextureLoader,
        layer: number
    ) {
        super();
        this.group = new Group();
        this.environment = environment;

        this.name = name;
        this.radius = radius;
        this.obliquity = obliquity;
        this.sidRotPerSec = sidRotPerSec;
        this.textureUrl = textureUrl;
        this.textureLoader = textureLoader;

        this.meanMotion = 0;
        this.meanAnomaly = 0;
        this.trueAnomaly = 0;

        this.color = new Color(color);
        this.type = "Planet";
        this.layer = layer;
        this.hidden = false;
    }

    public init(date: Date): void {
        const tex = this.textureLoader.load(this.textureUrl);
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ map: tex });
        this.mesh = new Mesh(geo, mat);
        this.mesh.layers.set(this.layer);
        this.mesh.name = this.name;
        this.mesh.rotation.z = -this.obliquity * 0.0174532925;

        this.group.add(this.mesh);
        this.createLabel();
        this.createIcon();
        if (this.orbit) this.mesh.position.copy(this.orbit.setFromDate(date));
    }

    public setOrbit(orbit: Orbit) {
        this.orbit = orbit;
        this.orbit.visualize();
        this.group.add(this.orbit.orbitLine);
    }

    public rotateObject(date: Date): void {
        let secondsElapsed = date.getTime() / 1000;

        if (this.mesh)
            this.mesh.rotation.y = this.sidRotPerSec * secondsElapsed;
    }

    public updatePosition(
        date: Date,
        deltaTime: number,
        daysPerSec: number
    ): void {
        this.rotateObject(date);
        if (this.orbit) {
            const currentDate = UnixToJulianDate(date);

            this.meanAnomaly =
                this.meanAnomaly + this.meanMotion * deltaTime * daysPerSec;
            this.meanAnomaly = this.meanAnomaly % (Math.PI * 2);
            this.orbit.setEpoch(currentDate);
            this.mesh!.position.copy(
                this.orbit.fromMeanAnomaly(this.meanAnomaly)
            );

            for (let [_, satellite] of this.satellites)
                satellite.updatePosition(date, deltaTime, daysPerSec);
        }
    }

    public setLivePosition(date: Date) {
        if (this.mesh && this.orbit) {
            this.orbit.setFromDate(date);

            for (let [_, satellite] of this.satellites)
                satellite.setLivePosition(date);
        }
    }

    public updateRender(distFromCam: number, isFocused: boolean): void {
        if (this.hidden) return;

        if (distFromCam < this.radius * 100) {
            this.hideAdditionalInfo();
        } else {
            this.showAdditionalInfo();

            if (isFocused) {
                for (let [_, satellite] of this.satellites) {
                    satellite.showAdditionalInfo();
                }
            } else {
                for (let [_, satellite] of this.satellites) {
                    satellite.hideAdditionalInfo();
                }
            }
        }
    }

    public addSatellite(satellite: Satellite): void {
        this.satellites.set(satellite.name, satellite);

        if (satellite.mesh) this.group.add(satellite.group);
    }

    public showSatellitesInfo(): void {
        for (let [_, satellite] of this.satellites)
            satellite.showAdditionalInfo();
    }

    public show(): void {
        this.hidden = false;

        if (this.mesh) this.mesh.visible = true;

        if (this.orbit) this.orbit.show();
    }

    public hide(): void {
        this.hidden = true;

        if (this.mesh) this.mesh.visible = false;

        if (this.orbit) this.orbit.hide();
    }

    public hideSatellites(): void {
        for (let [_, satellite] of this.satellites) {
            satellite.hide();
        }
    }

    public showSatellites(): void {
        for (let [_, satellite] of this.satellites) {
            satellite.show();
        }
    }

    public getOrbit(): Orbit {
        return this.orbit!;
    }

    protected hideAdditionalInfo(): void {
        if (this.orbit) this.orbit.hide();
        if (this.label) this.label.element.style.opacity = "0";
        if (this.icon) this.icon.element.style.opacity = "0";
    }

    protected showAdditionalInfo(): void {
        if (this.orbit) this.orbit.show();
        if (this.label) this.label.element.style.opacity = "0.5";
        if (this.icon) this.icon.element.style.opacity = "0.5";
    }

    protected createLabel(): void {
        this.htmlElements[0] = document.createElement("div");
        this.htmlElements[0].className = "planet-label";
        this.htmlElements[0].textContent = this.name;
        this.htmlElements[0].style.setProperty(
            "--color",
            `${this.color.getStyle()}`
        );

        this.label = new CSS2DObject(this.htmlElements[0]);
        this.label.position.set(0, 0, 0);
        // this.label.layers.set(SETTINGS.LABEL_LAYER);
        this.mesh!.add(this.label);
    }

    protected createIcon(): void {
        this.htmlElements[1] = document.createElement("div");
        this.htmlElements[1].className = "planet-icon";

        this.htmlElements[1].style.setProperty(
            "--color",
            `${this.color.getStyle()}`
        );

        this.icon = new CSS2DObject(this.htmlElements[1]);
        this.icon.position.set(0, 0, 0);
        this.mesh!.add(this.icon);

        this.htmlElements[1].addEventListener("mouseover", () => {
            this.orbit?.hovered();
            this.infoHover();
        });

        this.htmlElements[1].addEventListener("mouseleave", () => {
            this.orbit?.unhovered();
            this.infoUnhover();
        });

        this.htmlElements[1].addEventListener("pointerdown", () => {
            this.environment.moveToBody(this);
        });
    }

    protected infoHover(): void {
        this.htmlElements.map((elem) => {
            elem.classList.add("hovered");
        });
    }

    protected infoUnhover(): void {
        this.htmlElements.map((elem) => {
            elem.classList.remove("hovered");
        });
    }
}
