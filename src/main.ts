/**
 * zajebista lista todo
 *
 * ogarniecie zooma pierdolonego
 * zmniejszenie speeda obracania globusu
 * wystylowanie radaru bo wyglada tak gownianie ze to szok
 */

import { Environment } from "./core/environment";
import { EventListeners } from "./core/EventListeners";

const environment: Environment = new Environment();
new EventListeners(environment);

window.addEventListener("mousemove", (event) => {
    environment.updateControlsState(event);
});

window.addEventListener("wheel", () => {
    environment.updateRadar();
    environment.updateControlsSpeed();
});
