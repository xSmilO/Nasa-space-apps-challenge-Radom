import type HitScene from "../components/HitScene";

export default class Info {
    private resetButton: HTMLButtonElement | null;
    private container: HTMLDivElement | null;
    private hitScene: HitScene;

    constructor(hitScene: HitScene) {
        this.hitScene = hitScene;

        this.container = document.querySelector<HTMLDivElement>(".info");
        this.resetButton = document.querySelector<HTMLButtonElement>(".info .reset");

        this.resetButton?.addEventListener("click", () => {
            this.hitScene.resetScene();
        })
    }

    public show(): void {
        this.container?.classList.add("show");
    }

    public hide(): void {
        this.container?.classList.remove("show");
    }
}
