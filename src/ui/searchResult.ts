import type { OrbitControls } from "three/examples/jsm/Addons.js";
import type { Earth } from "../element3D/earth";

export class SearchResult {
    public htmlElement: HTMLDivElement;

    constructor(
        earth: Earth,
        controls: OrbitControls,
        text: string,
        latitude: number,
        longitude: number
    ) {
        this.htmlElement = document.createElement("div");

        this.htmlElement.appendChild(new Text(text));

        this.htmlElement.classList.add("searchResult");

        this.htmlElement.addEventListener("click", () => {
            earth.rotateFromGeolocation(controls, latitude, longitude);
        });
    }
}
