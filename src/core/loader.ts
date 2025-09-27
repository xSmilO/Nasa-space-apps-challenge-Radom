import type { AsteroidData } from "../utility/types";

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

    public static async loadPHA(): Promise<Map<string, PHA>> {

    }
}
