import Environment from "./core/environment";
import gsap from "gsap";
import { Vector3 } from "three";
import { EventListeners } from "./core/EventListeners";
import { SETTINGS } from "./core/Settings";

const environment: Environment = new Environment(
    (timeStamp: DOMHighResTimeStamp) => {
        environment.earth.clouds.rotation.y = environment.currentDate.getTime() * 0.000001;

        environment.controls.update();
        environment.updateRadar();

        if (
            environment.earth.shaders[
            environment.earth.getCloudsMaterial().uuid
            ]
        ) {
            environment.earth.shaders[
                environment.earth.getCloudsMaterial().uuid
            ].uniforms.time.value = timeStamp;
        }
    }
);
environment.init();

let currentZoomAnimation: gsap.core.Tween = gsap.to({}, {});

new EventListeners(environment);
window.addEventListener("mousemove", (event) => {
    environment.updateControlsState(event);
});

window.addEventListener("wheel", () => {
    currentZoomAnimation.kill();
    environment.updateControlsSpeed();
});

window.addEventListener("resize", () => {
    environment.updateDimensions();
});

document.getElementById("resetZoomButton")?.addEventListener("click", () => {
    const object: { distance: number } = {
        distance: environment.controls.getDistance(),
    };

    currentZoomAnimation.kill();

    currentZoomAnimation = gsap.to(object, {
        distance: SETTINGS.CAMERA_START_DISTANCE,
        duration: 1,
        ease: "power1.inOut",
        onUpdate: () => {
            const direction = new Vector3()
                .subVectors(
                    environment.controls.object.position,
                    environment.controls.target
                )
                .normalize();

            environment.controls.object.position.copy(
                environment.controls.target
                    .clone()
                    .add(direction.multiplyScalar(object.distance))
            );
            environment.updateRadar();
        },
        onComplete: () => {
            environment.updateControlsSpeed();
        },
    });
});
