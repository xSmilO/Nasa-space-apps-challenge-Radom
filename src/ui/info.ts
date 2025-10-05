import type HitScene from "../components/HitScene";

export default class Info {
    private resetButton: HTMLButtonElement | null;
    private container: HTMLDivElement | null;
    private hitScene: HitScene;

    public isWater: boolean;
    public population: Array<number>;
    //HTML ELEMENTS

    constructor(hitScene: HitScene) {
        this.hitScene = hitScene;
        this.isWater = false;
        this.population = [0, 0];

        this.container =
            document.querySelector<HTMLDivElement>(".infoContainer");
        this.resetButton = document.querySelector<HTMLButtonElement>(
            ".infoContainer .reset"
        );

        this.resetButton?.addEventListener("click", () => {
            this.hitScene.resetScene();
        });
    }

    public show(): void {
        this.setValues();
        this.container?.classList.add("show");
    }

    public hide(): void {
        this.container?.classList.remove("show");
    }

    public setValues(): void {
        console.log("Depth: " + this.hitScene.craterResult?.dtc_m);
        console.log(this.isWater);
    }
}
