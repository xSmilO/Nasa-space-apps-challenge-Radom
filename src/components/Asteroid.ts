import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import {
    Box3,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    Color,
    Vector3,
    Group,
} from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import Environment from "../core/environment.ts";
import axios from "axios";
import type { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import Orbit from "./Orbit";
import { SETTINGS } from "../core/Settings";
import type { AsteroidType } from "../utility/types";
import { UnixToJulianDate } from "../utility/dateConverter.ts";

export default class Asteroid {
    public modelExist: boolean;
    public zoom: number = SETTINGS.ZOOM_TO_OBJECT;
    public type: AsteroidType;
    public name: string;
    public radius: number;
    public meanMotion: number;
    public meanAnomaly: number;
    public trueAnomaly: number;
    public mesh: Mesh | null = null;
    public group: Group;
    public distanceToEarth: number;

    private modelUrl: string;
    private modelLoaded: boolean;
    private orbit: Orbit | null = null;
    private label: CSS2DObject | null = null;
    private icon: CSS2DObject | null = null;
    private color: Color;
    private htmlElements: HTMLDivElement[] = new Array<HTMLDivElement>(2);
    private obliquity: number;
    private sidRotPerSec: number;
    private environment: Environment;

    constructor(
        environment: Environment,
        name: string,
        radius: number,
        obliquity: number,
        sidRotPerSec: number,
        color: string,
    ) {
        this.group = new Group();
        this.environment = environment;

        this.name = name;
        this.radius = radius;
        this.obliquity = obliquity;
        this.sidRotPerSec = sidRotPerSec;

        this.meanMotion = 0;
        this.meanAnomaly = 0;
        this.trueAnomaly = 0;

        this.color = new Color(color);

        this.modelExist = false;
        this.modelLoaded = false;
        this.modelUrl = "";
        this.type = "PHA";
        this.distanceToEarth = 0;
    }

    public async init(date: Date): Promise<void> {
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ color: 0xfafafa });
        this.mesh = new Mesh(geo, mat);
        this.mesh.name = this.name;
        this.mesh.rotation.z = -this.obliquity * 0.0174532925;

        if (this.orbit) {
            this.mesh.position.copy(this.orbit.setFromDate(date));

            this.group.add(this.orbit.orbitLine);
        }
        this.group.add(this.mesh);
        this.createLabel();
        this.createIcon();
    }

    public loadModel(): void {
        if (this.modelLoaded) return;

        if (!this.modelExist) {
            const name = this.name.split(" ").join("-");
            axios
                .get(`/model/asteroids/${name}`)
                .then((data) => {
                    this.modelExist = true;
                    this.getModelData(data);
                })
                .catch(() => {
                    this.modelExist = false;
                    this.setRandom3dModel();
                });
            return;
        }

        const loader = new OBJLoader();
        loader.load(`/model/${this.modelUrl}`, (obj) => {
            for (let children of obj.children) {
                if (children.type == "Mesh") {
                    this.mesh!.geometry.dispose();
                    //@ts-expect-error
                    this.mesh!.geometry = children.geometry;
                    this.modelLoaded = true;

                    const box = new Box3().setFromObject(this.mesh!);
                    const size = new Vector3();

                    box.getSize(size);
                    this.zoom = size.z;

                    // todo: moving to the body 
                    // this.system.moveToBody(this);
                }
            }
        });
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
            this.orbit.trace(this.environment.earthPos);
        }
    }

    // public updateRender(distFromCam: number): void {
    //     // if (this.hidden) return;
    //
    //     let zoom = Math.max(this.radius, this.zoom);
    //
    //     // if (distFromCam < zoom * 100) {
    //     //     this.hideAdditionalInfo();
    //     // } else {
    //     //     this.showAdditionalInfo();
    //     // }
    // }

    public setLivePosition(date: Date) {
        if (this.mesh && this.orbit) {
            this.orbit.setFromDate(date);
        }
    }

    public setOrbit(orbit: Orbit): void {
        // trace orbit
        this.orbit = orbit;
        this.orbit.setAsteroidMaterial();
        this.orbit.visualize();

        this.group.add(this.orbit!.orbitLine);
    }
    public calcDistanceToEarth(earthPos: Vector3): boolean {
        if (!this.mesh) return false;
        this.distanceToEarth = earthPos.distanceTo(this.mesh.position) / 149597870.7;
        this.distanceToEarth *= SETTINGS.DISTANCE_SCALE

        if (this.distanceToEarth < SETTINGS.PHA_THRESHOLD) {
            this.group.visible = true;
            this.orbit?.show();
            return true;
        }
        this.group.visible = false;
        this.orbit?.hide()

        return false;
    }

    public show(): void {
        // this.hidden = false;

        if (this.mesh) this.mesh.visible = true;

        if (this.orbit) this.orbit.show();
    }

    public hide(): void {
        // this.hidden = true;

        if (this.mesh) this.mesh.visible = false;

        if (this.orbit) this.orbit.hide();
    }

    protected createIcon(): void {
        this.htmlElements[1] = document.createElement("div");
        this.htmlElements[1].className = "asteroid-icon";

        const icon = document.createElement("img");
        icon.src = "/icons/asteroid-mine.svg";
        this.htmlElements[1].appendChild(icon);

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
    }

    private getModelData(data: AxiosResponse<any, any>): void {
        if (!this.modelExist) return;

        const $ = cheerio.load(data.data);
        const models = $("#ast-down .downloads-wrap ul li");

        const modelUrl: string | undefined = models
            .first()
            .children("a")
            .last()
            .attr()!["href"];

        this.modelUrl = modelUrl.split("/").slice(3).join("/");
        this.loadModel();
    }

    private setRandom3dModel(): void {
        this.modelExist = true;
        // 4 3 7 9
        const randomNumber = Math.floor(Math.random() * 3);

        this.modelUrl = `/assets/models/asteroid_model_${randomNumber}.obj`;

        const loader = new OBJLoader();
        loader.load(this.modelUrl, (obj) => {
            for (let children of obj.children) {
                if (children.type == "Mesh") {
                    this.mesh!.geometry.dispose();
                    //@ts-expect-error
                    this.mesh!.geometry = children.geometry;
                    this.modelLoaded = true;
                }
            }
        });
    }

    private createLabel(): void {
        this.htmlElements[0] = document.createElement("div");
        this.htmlElements[0].className = "planet-label";
        this.htmlElements[0].textContent = this.name;
        this.htmlElements[0].style.setProperty(
            "--color",
            `${this.color.getStyle()}`
        );

        this.label = new CSS2DObject(this.htmlElements[0]);
        this.label.position.set(0, 0, 0);
        this.label.layers.set(SETTINGS.LABEL_LAYER);
        this.mesh!.add(this.label);
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

    private infoHover(): void {
        this.htmlElements.map((elem) => {
            elem.classList.add("hovered");
        });
    }

    private infoUnhover(): void {
        this.htmlElements.map((elem) => {
            elem.classList.remove("hovered");
        });
    }

}
