import { Environment } from "./core/environment";

const environment: Environment = new Environment();

window.addEventListener("mousemove", (event) => {
  environment.updateControlsState(event);
});

window.addEventListener("wheel", () => {
  environment.updateRadar();
  environment.updateControlsSpeed();
})