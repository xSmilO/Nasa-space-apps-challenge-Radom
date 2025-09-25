import { AmbientLight, DirectionalLight, PerspectiveCamera, Raycaster, Scene, SRGBColorSpace, TextureLoader, Vector2, WebGLRenderer } from "three";
import { Earth } from "../element3D/earth";
import { Map } from "maplibre-gl";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { RadarHelper } from "../utility/radarHelper";

export class Environment {
  public textureLoader: TextureLoader;
  public scene: Scene;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public controls: OrbitControls;
  public earth: Earth;
  public directionalLight: DirectionalLight;
  public ambientLight: AmbientLight;
  public radar: Map;

  constructor(animator?: (time: DOMHighResTimeStamp, frame: XRFrame) => void) {
    this.textureLoader = new TextureLoader();
    this.scene = new Scene();
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.earth = new Earth(this.textureLoader);
    this.directionalLight = new DirectionalLight(0xffffff, 2.0);
    this.ambientLight = new AmbientLight(0xffffff, 0.5);
    this.radar = new Map({
      container: "radarContainer",
      style: "/radar/getStyle",
      center: [0.0, 0.0],
      zoom: 0,
      interactive: false
    });

    this.radar.on("load", () => {
      this.updateRadar();
    });

    this.camera.position.z = 200;
    this.directionalLight.position.set(5, 3, 5);
    this.controls.minDistance = 115;
    this.controls.maxDistance = 1200;

    this.scene.add(this.earth);
    this.scene.add(this.directionalLight);
    this.scene.add(this.ambientLight);

    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor(0x0d0d0f);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop((time: DOMHighResTimeStamp, frame: XRFrame) => {
      this.renderer.render(this.scene, this.camera);

      if(animator != undefined) {
        animator(time, frame);
      }
    });

    document.body.appendChild(this.renderer.domElement);
  }

  public updateRadar(): void {
    const geolocalization: {longitude: number, latitude: number} = this.earth.getGeolocalization(this.camera, this.controls);
    const zoom: number = RadarHelper.resolveZoom(this.controls);

    this.radar.setCenter([geolocalization.longitude, geolocalization.latitude]);
    this.radar.setZoom(zoom);
  }

  public updateControlsState(event: MouseEvent): void {
    const mousePos: Vector2 = new Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const isLMBDown: boolean = (event.buttons & 1) === 1;
    const raycaster: Raycaster = new Raycaster(); raycaster.setFromCamera(mousePos, this.camera);
    this.controls.enabled = (raycaster.intersectObject(this.earth).length > 0) || isLMBDown;

    this.updateRadar();
  }

  public updateControlsSpeed(): void {
    const distance: number = this.controls.getDistance();
    const minSpeed: number = 0.1;
    const maxSpeed: number = 1.0;
    const t: number = Math.min(Math.max((distance - this.controls.minDistance) / (this.controls.maxDistance - this.controls.minDistance), 0), 1);
    this.controls.rotateSpeed = minSpeed + t * (maxSpeed - minSpeed);
  }
}