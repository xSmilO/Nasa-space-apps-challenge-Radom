import { AmbientLight, DirectionalLight, EquirectangularReflectionMapping, MathUtils, PerspectiveCamera, Raycaster, Scene, SRGBColorSpace, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { AmbientLight, DirectionalLight, PerspectiveCamera, Raycaster, Scene, SRGBColorSpace, TextureLoader, Vector2, WebGLRenderer, Clock } from "three";
import { Earth } from "../element3D/earth";
import { Map as MapLibre } from "maplibre-gl";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { RadarHelper } from "../utility/radarHelper";
import Loader from "./loader";
import { SETTINGS } from './Settings';
import type { AsteroidData } from "../utility/types";
import { UI } from "./UI";

const clock = new Clock();
import { resolveRadarZoom } from "../utility/radarHelper";

export class Environment {
  public textureLoader: TextureLoader;
  public scene: Scene;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public controls: OrbitControls;
  public directionalLight: DirectionalLight;
  public earth: Earth;
  public ambientLight: AmbientLight;
  public radar: MapLibre;
  public phas: Map<string, AsteroidData>;

  private ui: UI;
  private currentDate: Date;
  private isLive: boolean;

  public radar: Map;
  public radarHTMLElement: HTMLDivElement;

  constructor(animator?: (timeStamp: DOMHighResTimeStamp, frame: XRFrame) => void) {
    this.ui = new UI(this);
    this.textureLoader = new TextureLoader();
    this.scene = new Scene();
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.0001, SETTINGS.CAMERA_MAX_DISTANCE);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.directionalLight = new DirectionalLight(0xffffff, 2.5);
    this.earth = new Earth(this.textureLoader);
    this.directionalLight = new DirectionalLight(0xffffff, 2.0);
    this.ambientLight = new AmbientLight(0xffffff, 0.5);
    this.radar = new MapLibre({
    this.ambientLight = new AmbientLight(0xffffff, 0.1);
    this.radar = new Map({
      container: "radarContainer",
      style: "/radar/getStyle",
      center: [0.0, 0.0],
      zoom: 0,
      interactive: false
    });
    this.phas = new Map<string, AsteroidData>;
    this.currentDate = new Date();
    this.isLive = true;

    this.radarHTMLElement = document.getElementById("radar") as HTMLDivElement;

    this.radar.on("load", () => {
      this.earth.rotateFromGeolocation(this.controls);
      this.updateRadar();
    });

    this.camera.position.z = this.earth.radius * 1.5;
    this.directionalLight.target = this.earth;

    this.earth.enableEffects(
      new Vector3().subVectors(
        this.directionalLight.target.position,
        this.directionalLight.position
      ).normalize(),
      this.camera
    );

    this.controls.minDistance = 115;
    this.controls.maxDistance = 1200;
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

  public updateRadar(): void {
    const geolocalization: {longitude: number, latitude: number} = this.earth.getGeolocation(this.controls);
    const zoom: number = resolveRadarZoom(this.controls);
    
    try {
      this.radar.setCenter([geolocalization.longitude, geolocalization.latitude]);
      this.radar.setZoom(zoom);
      this.radar.resize();

      if(zoom == 10) {
        this.radarHTMLElement.classList.add("bigger");
      } else if(zoom < 2) {
        this.radarHTMLElement.classList.add("smaller");
      } else {
        this.radarHTMLElement.classList.remove("bigger", "smaller");
      }
    } catch(exception: any) {}
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
    this.earth.update(this.currentDate);

    if (this.isLive && SETTINGS.simulationSpeed != 1) {
      this.isLive = false;
      this.ui.noLive();
    }
  }

  public onResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.updateControlsSpeed();
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
