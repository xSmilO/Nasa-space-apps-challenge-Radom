import Asteroid from "../components/Asteroid";
import Orbit from "../components/Orbit";
import type { AsteroidData } from "../utility/types";
import type Environment from "./environment";
import { SETTINGS } from "./Settings";

export default class Loader {

    public static async loadPHAData(): Promise<Map<string, AsteroidData>> {
        let data = await fetch("/assets/data/PHA.json");
        let json: AsteroidData[] = await data.json();
        let result = new Map<string, AsteroidData>();

        for (let ad of json) {
            if (!ad.diameter) continue;

            result.set(ad.full_name, ad);
        }
        return result;
    }

    public static async loadPHA(environment: Environment, phas: Map<string, AsteroidData>, currentDate: Date): Promise<Map<string, Asteroid>> {
        let result = new Map<string, Asteroid>();
        for (let [_, data] of phas) {
            let pha = new Asteroid(environment, data.full_name, data.diameter / 2, 0, data.rot_per / 3600, SETTINGS.ORBIT_COLOR);
            let longOfPeri = data.om + data.w;
            let eccentricity = data.e;

            if (typeof eccentricity == "string")
                eccentricity = parseFloat(eccentricity);
            const orbit = new Orbit(data.ma * (Math.PI / 180), data.a, eccentricity, longOfPeri, data.i, data.om, data.per_y, data.epoch, pha, SETTINGS.ORBIT_COLOR, null, 0);

            pha.setOrbit(orbit);
            result.set(pha.name, pha);
            pha.init(currentDate);
        }

        return result;
    }
}
