import axios from "axios";
import type Info from "../ui/info";
import type { ApiIsWaterResult, ApiPoplationResult } from "./types";

export default class Api {
    private info: Info;

    constructor(info: Info) {
        this.info = info;
    }

    public async calculatePopulation(
        lan: number,
        long: number,
        craterRadius: number,
        fireballRadius: number
    ) {
        // https://lobster-app-bhpix.ondigitalocean.app/?lat=40.71383629321172&lng=-74.04596655907675&radii=4848
        const res = await axios.get<ApiPoplationResult>(
            `https://lobster-app-bhpix.ondigitalocean.app/?lat=${lan}&lng=${long}&radii=${craterRadius}&radii=${fireballRadius}`
        );

        this.info.population = res.data.populations;
    }

    public async isItWater(lan: number, long: number): Promise<void> {
        const res = await axios.get<ApiIsWaterResult>(
            `https://is-on-water.balbona.me/api/v1/get/${lan}/${long}`
        );

        this.info.isWater = res.data.isWater;
    }
}
