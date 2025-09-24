import { AmbientLight, BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";


export default class MeteorCreator {
    private _active: boolean;

    private scene!: Scene;
    private camera!: PerspectiveCamera;
    private canvas: HTMLDivElement | null;
    private renderer!: WebGLRenderer;
    private meteor: Mesh;
    private categories: NodeListOf<HTMLDivElement> | null;

    constructor() {
        this._active = false;
        this.fetchHTMLElements()

        if (!this.canvas) throw new Error("MeteorCreator: .meteor-creator .display doesn't not exist");

        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        this.canvas.appendChild(this.renderer.domElement);

        const geometry = new BoxGeometry(1, 1, 1);
        const light = new AmbientLight(0xffffff);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        this.meteor = new Mesh(geometry, material);

        this.scene.add(this.meteor);
        this.scene.add(light);

        this.camera.position.z = 2;
    }

    public render(): void {
        this.meteor.rotation.x += 0.002;
        this.meteor.rotation.y += 0.005;

        this.renderer.render(this.scene, this.camera);
    }

    public enable(): void {
        this._active = true;
    }

    public disable(): void {
        this._active = false;
    }

    get active(): boolean {
        return this._active;
    }

    fetchHTMLElements(): void {
        this.canvas = document.querySelector<HTMLDivElement>(".meteor-creator .display");

        // parameters categories
        this.categories = document.querySelectorAll(".meteor-creator .parameters .categories .category");
        const inputs = document.querySelectorAll(".meteor-creator .parameters .inputs .variant");

        console.log(inputs.item(0))

        if (this.categories) {
            this.categories.forEach(category => {
                category.addEventListener("click", () => {
                    this.categories!.forEach(elem => {
                        elem.classList.remove("active");
                    })
                    category.classList.add("active");

                    inputs.forEach(inputCategory => {
                        inputCategory.classList.remove("active");
                    })

                    switch (category.id) {
                        case "size-category":
                            inputs.item(0).classList.add("active");
                            break;
                        case "entry-category":
                            inputs.item(1).classList.add("active");
                            break;
                    }
                })
            });
        }

    }
}

