import Environment from "./core/environment";
import { Clock, Vector3 } from "three";
import { EventListeners } from "./core/EventListeners";
import { SETTINGS } from "./core/Settings";
import gsap from "gsap";

const clock: Clock = new Clock();

clock.start();
const environment: Environment = new Environment(
    (timeStamp: DOMHighResTimeStamp) => {
        if (SETTINGS.SOLAR_DESTINY_ACTIVE) return;
        environment.earth.clouds.rotation.y =
            environment.currentDate.getTime() * 0.000001;

        environment.controls.update();
        environment.radar.update();
        environment.update(clock.getDelta());

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

new EventListeners(environment);

document.getElementById("resetZoomButton")?.addEventListener("click", () => {
    const object: { distance: number } = {
        distance: environment.controls.getDistance(),
    };

    environment.currentZoomAnimation.kill();

    environment.currentZoomAnimation = gsap.to(object, {
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
            environment.radar.update();
        },
        onComplete: () => {
            environment.updateControlsSpeed();
        },
    });
});
