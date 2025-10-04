import { Vector2 } from "three";
import SolarSystem from "../components/SolarSystem";
import Camera from "./Camera";
import Renderer from "./Renderer";
import { SETTINGS } from "../../core/Settings";

export class EventListeners {
    private renderer: Renderer;
    private camera: Camera;
    private solarSystem: SolarSystem;

    constructor(renderer: Renderer, camera: Camera, solarSystem: SolarSystem) {
        this.renderer = renderer;
        this.camera = camera;
        this.solarSystem = solarSystem;

        window.addEventListener("resize", () => this.onResize());

        window.addEventListener("mousedown", (e) => {
            const x =
                (e.clientX / this.renderer.getRendererDom().clientWidth) * 2 -
                1;
            const y = -(
                (e.clientY / this.renderer.getRendererDom().clientHeight) * 2 -
                1
            );
            this.solarSystem.shootRay(new Vector2(x, y));
        });

        this.camera.controls.addEventListener("change", () => {
            this.solarSystem.getDistancesToObjects();
        });

        this.camera.controls.addEventListener("start", () => {
            this.solarSystem.hideSearchBar();
        });

        window.addEventListener("keydown", (e) => {
            if (e.keyCode == 32) {
                this.camera.controls.autoRotate =
                    !this.camera.controls.autoRotate;
            }
        });

        document
            .querySelector<HTMLButtonElement>(".SolarDestiny .UI .BackToEarth")
            ?.addEventListener("click", () => {
                console.log("penis");
                SETTINGS.SOLAR_DESTINY_ACTIVE = false;

                document.querySelector(".Meteors")?.classList.add("active");
                document
                    .querySelector(".SolarDestiny")
                    ?.classList.remove("active");
            });
    }

    private onResize() {
        this.camera.onResize();
        this.renderer.onResize();
        this.solarSystem.resize();
    }
}
