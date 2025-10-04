import { Vector3 } from "three";
import Environment from "./environment";
import { SETTINGS } from "./Settings";

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

        document
            .getElementById("resetZoomButton")
            ?.addEventListener("click", () => {
                const object: { distance: number } = {
                    distance: this.environment.controls.getDistance(),
                };

                this.environment.currentZoomAnimation.kill();

                environment.currentZoomAnimation = gsap.to(object, {
                    distance: SETTINGS.CAMERA_START_DISTANCE,
                    duration: 1,
                    ease: "power1.inOut",
                    onUpdate: () => {
                        const direction = new Vector3()
                            .subVectors(
                                this.environment.controls.object.position,
                                this.environment.controls.target
                            )
                            .normalize();

                        this.environment.controls.object.position.copy(
                            this.environment.controls.target
                                .clone()
                                .add(direction.multiplyScalar(object.distance))
                        );
                        this.environment.radar.update();
                    },
                    onComplete: () => {
                        this.environment.updateControlsSpeed();
                    },
                });
            });

        document
            .querySelector<HTMLButtonElement>(
                ".Meteors .UI .MoveToSolarDestiny"
            )
            ?.addEventListener("click", () => {
                SETTINGS.SOLAR_DESTINY_ACTIVE = true;

                document.querySelector(".Meteors")?.classList.remove("active");
                document
                    .querySelector(".SolarDestiny")
                    ?.classList.add("active");
            });
    }
}
