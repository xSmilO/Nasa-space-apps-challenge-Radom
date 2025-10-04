import axios from "axios";
import type Info from "../ui/info";
import { type ApiPoplationResult } from "./types";

export default class Api {
    private population: number;
    private info: Info;

    constructor(info: Info) {
        this.info = info;
    }

    public async calculatePopulation(lan: number, long: number, craterRadius: number): Promise<void> {
        // https://lobster-app-bhpix.ondigitalocean.app/?lat=40.71383629321172&lng=-74.04596655907675&radii=4848
        const res = await axios.get<ApiPoplationResult>(`https://lobster-app-bhpix.ondigitalocean.app/?lat=${lan}&lng=${long}&radii=${craterRadius}`)
        console.log(res.data.populations);
    }

}
