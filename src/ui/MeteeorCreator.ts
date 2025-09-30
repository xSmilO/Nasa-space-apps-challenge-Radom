import { AmbientLight, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, SphereGeometry, WebGLRenderer } from "three";
import { OBJLoader } from "three/examples/jsm/Addons.js";
import type { UI } from "../core/UI";


export default class MeteorCreator {
    private _active: boolean;

    private scene!: Scene;
    private camera!: PerspectiveCamera;
    private canvas: HTMLDivElement | null;
    private container: HTMLDivElement | null;
    private renderer!: WebGLRenderer;
    private meteor: Mesh | null = null;

    // parameters
    private diameterInput: HTMLInputElement | null;
    private densityInput: HTMLInputElement | null;
    private angleInput: HTMLInputElement | null;
    private velocityInput: HTMLInputElement | null;
    private angleLabel: HTMLLabelElement | null;
    private velocityLabel: HTMLLabelElement | null;
    private closeBtn: HTMLDivElement | null;
    private hitBtn: HTMLDivElement | null;
    private meteorCreatorBtn: HTMLButtonElement | null;
    private _diameter: number;
    private _density: number;
    private _angle: number;
    private _velocity: number;

    private modelUrl: string;
    private ui: UI;

    constructor(ui: UI) {
        this.ui = ui;
        this.diameterInput = null;
        this.densityInput = null;
        this.angleInput = null;
        this.velocityInput = null;
        this.angleLabel = null;
        this.velocityLabel = null;
        this.closeBtn = null;
        this.hitBtn = null;
        this.meteorCreatorBtn = null;
        this._diameter = 0;
        this._angle = 0;
        this._density = 0;
        this._velocity = 0;
        this.modelUrl = "";

        this._active = false;
        this.container = document.querySelector<HTMLDivElement>(".meteorCreator");
        this.canvas = document.querySelector<HTMLDivElement>(".meteorCreator .displayContainer .display");

        if (!this.canvas) throw new Error("MeteorCreator: .meteorCreator .display doesn't not exist");

        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

        this.canvas.appendChild(this.renderer.domElement);


        this.camera.position.z = 2;
        this.fetchHTMLElements();
        this.init();
    }

    public init(): void {
        const geo = new SphereGeometry(1);
        const light = new AmbientLight(0x404040);
        const directionalLight = new DirectionalLight(0xffffff, 2.5);
        const mat = new MeshStandardMaterial({ color: 0xfafafa });
        this.meteor = new Mesh(geo, mat);

        directionalLight.position.z = 1;
        this.scene.add(this.meteor);
        this.scene.add(light);
        this.scene.add(directionalLight);

        this.setRandom3DModel();
    }

    public render(): void {
        this.meteor!.rotation.x += 0.002;
        this.meteor!.rotation.y += 0.005;

        this.renderer.render(this.scene, this.camera);
    }

    public enable(): void {
        this._active = true;
        this.container?.classList.add("active");
        this.meteorCreatorBtn?.classList.add("active");

        // this.camera.aspect = this.canvas!.clientWidth / this.canvas!.clientHeight;
        // this.camera.updateProjectionMatrix();
        // this.renderer.setSize(this.canvas!.clientWidth, this.canvas!.clientHeight);
    }

    public disable(): void {
        this._active = false;
        this.container?.classList.remove("active");
        this.meteorCreatorBtn?.classList.remove("active");
    }

    private setRandom3DModel(): void {
        const randomNumber = Math.floor(Math.random() * 3);

        this.modelUrl = `/models/asteroid_model_${randomNumber}.obj`;

        const loader = new OBJLoader();

        loader.load(this.modelUrl, (obj) => {
            obj.traverse((child) => {
                if (child instanceof Mesh) {
                    if (this.meteor) {
                        this.meteor.geometry.dispose();
                        this.meteor.geometry = child.geometry;
                    }
                }
            })
        })
    }

    get active(): boolean {
        return this._active;
    }

    onInputChange(): void {
        this._diameter = parseInt(this.diameterInput!.value);
        this._density = parseInt(this.densityInput!.value);
        this._angle = parseInt(this.angleInput!.value);
        this._velocity = parseInt(this.velocityInput!.value);

        this.angleLabel!.innerHTML = `Angle: ${this._angle ? this._angle : 0}&deg`
        this.velocityLabel!.innerHTML = `Velocity: ${this._velocity ? this._velocity : 0} km/s`;
    }

    fetchHTMLElements(): void {
        this.diameterInput = document.querySelector<HTMLInputElement>("input[name='diameter']");
        this.densityInput = document.querySelector<HTMLInputElement>("input[name='density']");
        this.angleInput = document.querySelector<HTMLInputElement>("input[name='angle']");
        this.velocityInput = document.querySelector<HTMLInputElement>("input[name='velocity']");

        this.angleLabel = document.querySelector<HTMLLabelElement>("label[for='angle']");
        this.velocityLabel = document.querySelector<HTMLLabelElement>("label[for='velocity']");

        this.closeBtn = document.querySelector<HTMLDivElement>(".meteorCreator .closeBtn");
        this.hitBtn = document.querySelector<HTMLDivElement>(".meteorCreator .hitBtn");
        this.meteorCreatorBtn = document.querySelector<HTMLButtonElement>(".meteorCreatorBtn");


        this._diameter = parseInt(this.diameterInput!.value);
        this._density = parseInt(this.densityInput!.value);
        this._angle = parseInt(this.angleInput!.value);
        this._velocity = parseInt(this.velocityInput!.value);

        this.angleLabel!.innerHTML = `Angle: ${this._angle ? this._angle : 0}&deg`
        this.velocityLabel!.innerHTML = `Velocity: ${this._velocity ? this._velocity : 0} km/s`;
    }

    setEventListeners(): void {
        this.diameterInput?.addEventListener("input", () => this.onInputChange());
        this.densityInput?.addEventListener("input", () => this.onInputChange());
        this.angleInput?.addEventListener("input", () => this.onInputChange());
        this.velocityInput?.addEventListener("input", () => this.onInputChange());

        this.meteorCreatorBtn?.addEventListener("click", () => {
            this.active ? this.disable() : this.enable();
        })

        this.closeBtn?.addEventListener("click", () => {
            this.disable();
            this.ui.disableMeteorMode();
        })

        this.hitBtn?.addEventListener("click", () => {
            this.ui.enableMeteorMode();
        })
    }

    onResize(): void {
        if (!this.canvas) return;
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
    }
}

