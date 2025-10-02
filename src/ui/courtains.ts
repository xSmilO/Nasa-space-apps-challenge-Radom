export default class Courtains {
    private container: HTMLDivElement | null;
    constructor() {
        this.container = document.querySelector<HTMLDivElement>(".UI .courtains");
    }

    public open(): void {
        this.container?.classList.remove("close");
    }

    public close(): void {
        this.container?.classList.add("close");
    }
}
