import { Vector2 } from "three";
import { Environment } from "./environment";

export class EventListeners {
    private environment: Environment;

    constructor(environment: Environment) {
        this.environment = environment;
        this.environment.setUpEventListeners();

        window.addEventListener("resize", () => this.onResize());


        this.environment.controls.addEventListener("change", () => {
            // this.solarSystem.getDistancesToObjects();

        });

        this.environment.controls.addEventListener("start", () => {
            // this.solarSystem.hideSearchBar();
        });

    }

    private onResize() {
        this.environment.onResize();
    }
}
