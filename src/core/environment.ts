import { AmbientLight, DirectionalLight, EquirectangularReflectionMapping, MathUtils, PerspectiveCamera, Raycaster, Scene, SRGBColorSpace, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer, Clock } from "three";
import { Earth } from "../element3D/earth";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Loader from "./loader";
import { SETTINGS } from './Settings';
import type { AsteroidData } from "../utility/types";
import { UI } from "./UI";
import { Radar } from "../element2D/radar";

const clock = new Clock();

export class Environment {
  public textureLoader: TextureLoader;
  public scene: Scene;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public controls: OrbitControls;
  public directionalLight: DirectionalLight;
  public earth: Earth;
  public ambientLight: AmbientLight;
  public radar: Radar;
  public phas: Map<string, AsteroidData>;

  private ui: UI;
  private currentDate: Date;
  private isLive: boolean;
  public radarHTMLElement: HTMLDivElement;

  constructor(animator?: (timeStamp: DOMHighResTimeStamp, frame: XRFrame) => void) {
    this.ui = new UI(this);
    this.textureLoader = new TextureLoader();
    this.scene = new Scene();
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.directionalLight = new DirectionalLight(0xffffff, 2.5);
    this.earth = new Earth(this.textureLoader);
    this.ambientLight = new AmbientLight(0xffffff, 0.1);
    this.radar = new Radar(this);
    this.phas = new Map<string, AsteroidData>;
    this.currentDate = new Date();
    this.isLive = true;

    this.radarHTMLElement = document.getElementById("radar") as HTMLDivElement;

    this.radar.on("load", () => {
      this.earth.rotateFromClientsGeolocation(this.controls);
      this.radar.update();
    });

    this.camera.position.z = SETTINGS.CAMERA_START_DISTANCE;

    this.directionalLight.position.set(5, 3, 5);
    this.directionalLight.target = this.earth;

    this.earth.enableEffects(
      new Vector3().subVectors(
        this.directionalLight.target.position,
        this.directionalLight.position
      ).normalize(),
      this.camera
    );

    this.controls.minDistance = SETTINGS.CAMERA_MIN_DISTANCE;
    this.controls.maxDistance = SETTINGS.CAMERA_MAX_DISTANCE;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;

    this.updateControlsSpeed();

    this.scene.add(this.earth);
    this.scene.add(this.earth.clouds);
    this.scene.add(this.directionalLight);
    this.scene.add(this.ambientLight);

    this.textureLoader.load("./../../assets/textures/skybox.png", (texture: Texture) => {
      texture.mapping = EquirectangularReflectionMapping;
      texture.colorSpace = SRGBColorSpace;

      this.scene.background = texture;
    });

    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop((timeStamp: DOMHighResTimeStamp, frame: XRFrame) => {
      this.renderer.render(this.scene, this.camera);

      if (animator != undefined) {
        animator(timeStamp, frame);
      }

      this.update(clock.getDelta());
    });

    clock.start();

    document.body.appendChild(this.renderer.domElement);
  }

  public async init(): Promise<void> {
    this.phas = await Loader.loadPHAData();
  }

  public updateControlsState(event: MouseEvent): void {
    const mousePos: Vector2 = new Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const isLMBDown: boolean = (event.buttons & 1) === 1;
    const raycaster: Raycaster = new Raycaster(); raycaster.setFromCamera(mousePos, this.camera);
    this.controls.enabled = (raycaster.intersectObject(this.earth).length > 0) || isLMBDown;
  }

  public updateControlsSpeed(): void {
    const distance: number = this.controls.getDistance();
    const minSpeed: number = 0.001;
    const maxSpeed: number = 3.0;
    const delta: number = Math.min(Math.max((distance - this.controls.minDistance) / (this.controls.maxDistance - this.controls.minDistance), 0), 1);
    this.controls.rotateSpeed = MathUtils.lerp(minSpeed, maxSpeed, delta);
  }

  public updateDimensions(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.updateProjectionMatrix();
  }

  public update(deltaTime: number): void {
    this.currentDate = new Date(this.currentDate.getTime() + (1000 * SETTINGS.simulationSpeed * deltaTime));

    this.ui.update();
    this.ui.updateTimelineInfo(this.currentDate);

    if (this.isLive && SETTINGS.simulationSpeed != 1) {
      this.isLive = false;
      this.ui.noLive();
    }
  }
  public setUpEventListeners(): void {
    this.ui.setUpEventListeners();
  }
  public setLiveDate(): void {
    this.currentDate = new Date();
    this.isLive = true;
    // for (let [_, celestialBody] of this.celestialBodies) {
    //   celestialBody.setLivePosition(this.currentDate);
    // }

    // for (let [_, phaBody] of this.phaBodies) {
    //   phaBody.setLivePosition(this.currentDate);
    // }
  }
}
