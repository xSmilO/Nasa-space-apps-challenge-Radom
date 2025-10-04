export default class Courtains {
    private container: HTMLDivElement | null;
    private flashbang: HTMLDivElement | null;
    constructor() {
        this.container = document.querySelector<HTMLDivElement>(".UI .courtains");
        this.flashbang = document.querySelector<HTMLDivElement>(".flashbang");

        this.flashbangTransitions();
    }

    public flashbangTransitions(): void {
        if (!this.flashbang) return;

        this.flashbang.addEventListener("transitionend", (e: TransitionEvent) => {
            if (!e.target) return;
            const target: HTMLDivElement = e.target as HTMLDivElement;

            if (target.classList.contains("fadeOut")) {
                target.classList.remove("fadeOut");
                target.classList.remove("boom");
            }
        });
    }

    public open(): void {
        this.container?.classList.remove("close");
    }

    public close(): void {
        this.container?.classList.add("close");
    }

    public boom(): void {
        this.flashbang?.classList.add("boom");
    }

    public endBoom(): void {
        this.flashbang?.classList.remove("boom");
    }

    public boomFade(): void {
        this.flashbang?.classList.add("fadeOut");
    }
}
