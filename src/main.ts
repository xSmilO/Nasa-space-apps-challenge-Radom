import { Environment } from "./core/environment";

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