import Environment from "./environment";

export class EventListeners {
    private environment: Environment;

    constructor(environment: Environment) {
        this.environment = environment;
        this.environment.setUpEventListeners();

        this.environment.controls.addEventListener("change", () => {
            // this.solarSystem.getDistancesToObjects();

        });

        this.environment.controls.addEventListener("start", () => {
            // this.solarSystem.hideSearchBar();
        });


        window.addEventListener("mousemove", (event) => {
            environment.updateControlsState(event);
        });

        window.addEventListener("wheel", () => {
            environment.currentZoomAnimation.kill();
            environment.updateControlsSpeed();
        });

        window.addEventListener("resize", () => {
            environment.updateDimensions();
        });
    }
}
