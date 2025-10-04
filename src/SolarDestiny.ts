import { Clock } from "three";
import SolarSystem from "./SolarDestiny/components/SolarSystem";
import Camera from "./SolarDestiny/core/Camera";
import { EventListeners } from "./SolarDestiny/core/EventListeners";
import MainScene from "./SolarDestiny/core/MainScene";
import Renderer from "./SolarDestiny/core/Renderer";
import { SETTINGS } from "./core/Settings";

const mainScene = new MainScene();
const renderer = new Renderer();
const camera = new Camera(mainScene.getScene(), renderer);
const clock = new Clock();

const solarSystem = new SolarSystem(
    mainScene.getScene(),
    renderer.getRenderer(),
    camera
);

export default class SolarDestiny {
    public init() {
        new EventListeners(renderer, camera, solarSystem);

        mainScene.init();

        solarSystem.init().then(() => {
            mainScene.addGroup(solarSystem.group);

            clock.start();
            animation();
        });

        function animation() {
            if (SETTINGS.SOLAR_DESTINY_ACTIVE == false) return;

            solarSystem.update(clock.getDelta());

            renderer.render(mainScene.getScene(), camera.getCamera());

            solarSystem.renderSun();

            camera.update();
            requestAnimationFrame(animation);
        }
    }
}
