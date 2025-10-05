export class AIExpert {
    private htmlElement: HTMLDivElement;

    private latitude?: number;

    private longitude?: number;

    private craterRadiusMeters?: number;

    constructor() {
        this.htmlElement = document.getElementById(
            "aiExpert"
        ) as HTMLDivElement;
    }

    private removeChildren(): void {
        while (this.htmlElement.firstChild) {
            this.htmlElement.firstChild.remove();
        }
    }

    public reset(): void {
        this.htmlElement.classList.add("hidden");

        this.htmlElement.classList.remove("noFlex");

        this.removeChildren();

        this.htmlElement.appendChild(
            document.createTextNode("AI expert says that...")
        );
    }

    private addLabelContent(content: string, htmlElement: any): void {
        this.htmlElement.appendChild(
            Object.assign(htmlElement, {
                textContent: content,
            })
        );
    }

    private addLabelInternal(label: string, htmlElement: any): void {
        if (this.htmlElement.children.length > 0) {
            this.htmlElement.appendChild(document.createElement("br"));

            this.htmlElement.appendChild(document.createElement("br"));
        }

        this.htmlElement.appendChild(
            Object.assign(htmlElement, {
                textContent: label,
            })
        );
    }

    private addBigLabel(
        label: string,
        content: string,
        htmlElement: any = document.createTextNode("")
    ): void {
        this.addLabelInternal(label, document.createElement("h1"));

        this.addLabelContent(content, htmlElement);
    }

    private addLabel(
        label: string,
        content: string,
        htmlElement: any = document.createTextNode("")
    ): void {
        this.addLabelInternal(label, document.createElement("b"));

        this.addLabelContent(content, htmlElement);
    }

    public show(): void {
        this.removeChildren();

        this.htmlElement.classList.remove("hidden");

        this.htmlElement.classList.add("noFlex");

        this.addLabel(
            "AI expert says that: ",
            "thinking...",
            document.createElement("i")
        );

        fetch(
            `/server/askAI?latitude=${this.latitude}&longitude=${this.longitude}&craterRadiusMeters=${this.craterRadiusMeters}`
        ).then((response: Response) => {
            response.text().then((aiResponse: string) => {
                fetch(
                    `/server/aiQuickConclusion?wholeMessage=${aiResponse}`
                ).then((shortResponse: Response) => {
                    shortResponse.text().then((aiShortResponse: string) => {
                        this.removeChildren();

                        this.addBigLabel(
                            "AI expert's short conclusion: ",
                            aiShortResponse
                        );

                        this.addLabel("Further explenation: ", aiResponse);
                    });
                });
            });
        });
    }

    public setup(
        latitude: number,
        longitude: number,
        craterRadiusMeters: number
    ) {
        this.latitude = latitude;

        this.longitude = longitude;

        this.craterRadiusMeters = craterRadiusMeters;
    }
}
