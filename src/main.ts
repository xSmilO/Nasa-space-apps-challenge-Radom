import { Environment } from "./core/environment";
import gsap from "gsap";
import { Vector3 } from "three";
import type { OrbitControls } from "three/examples/jsm/Addons.js";

const environment: Environment = new Environment(() => {
  environment.earth.clouds.rotation.y += 0.0001;
});

window.addEventListener("mousemove", (event) => {
  environment.updateControlsState(event);
});

window.addEventListener("wheel", () => {
  environment.updateRadar();
  environment.updateControlsSpeed();
});

window.addEventListener("resize", () => {
  environment.updateDimensions();
});

document.getElementById("resetZoomButton")?.addEventListener("click", () => {
  const object: {distance: number} = {
    distance: environment.controls.getDistance()
  };

  function setCameraDistance(controls: OrbitControls, distance: number) {
    const direction = new Vector3().subVectors(controls.object.position, controls.target).normalize();
    controls.object.position.copy(controls.target.clone().add(direction.multiplyScalar(distance)));
  }

  gsap.to(object, {
    distance: 200,
    duration: 1,
    ease: "power1.inOut",
    onUpdate: () => {
      const direction = new Vector3().subVectors(environment.controls.object.position, environment.controls.target).normalize();
      environment.controls.object.position.copy(environment.controls.target.clone().add(direction.multiplyScalar(object.distance)));
    }
  })
});