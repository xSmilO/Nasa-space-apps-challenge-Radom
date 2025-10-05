import {
    AmbientLight,
    DirectionalLight,
    EquirectangularReflectionMapping,
    MathUtils,
    PerspectiveCamera,
    Raycaster,
    Scene,
    SRGBColorSpace,
    Texture,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "three";
import { Earth } from "../element3D/earth";
import { CSS2DRenderer, OrbitControls } from "three/examples/jsm/Addons.js";
import Loader from "./loader";
import { SETTINGS } from "./Settings";
import type {
    AsteroidData,
    CraterResult,
    FireballResult,
} from "../utility/types";
import Orbit from "../components/Orbit.ts";
import { UI } from "./UI";
import Asteroid from "../components/Asteroid.ts";
import CelestialBody from "../components/CelestialBody.ts";
import type { MapMouseEvent } from "maplibre-gl";
import gsap from "gsap";
import HitScene from "../components/HitScene.ts";
import { Radar } from "../element2D/radar.ts";
import { AIExpert } from "../element2D/aiExpert.ts";
import {
    calculateKineticEnergy,
    calculateMass,
    estimateFireball,
} from "../utility/math.ts";

export default class Environment {
    public textureLoader: TextureLoader;
    public scene: Scene;
    public renderer: WebGLRenderer;
    public cssRenderer: CSS2DRenderer;
    public camera: PerspectiveCamera;
    public controls: OrbitControls;
    public directionalLight: DirectionalLight;
    public earth: Earth;
    public ambientLight: AmbientLight;
    public currentDate: Date;
    public radar: Radar;
    public phas: Map<string, AsteroidData>;
    public currentZoomAnimation: gsap.core.Tween;
    public hidePHAs: boolean;
    private ui: UI;
    private isLive: boolean;
    private earthOrbit: Orbit;
    private earthObject: CelestialBody;
    private phaBodies: Map<string, Asteroid>;
    private hitScene: HitScene;
    public aiExpert: AIExpert;

    public radarHTMLElement: HTMLDivElement;
    public earthPos: Vector3;
    constructor(
        animator?: (timeStamp: DOMHighResTimeStamp, frame: XRFrame) => void
    ) {
        this.ui = new UI(this);
        this.textureLoader = new TextureLoader();
        this.scene = new Scene();
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.cssRenderer = new CSS2DRenderer();
        this.camera = new PerspectiveCamera(
            SETTINGS.CAMERA_FOV,
            window.innerWidth / window.innerHeight,
            0.001,
            SETTINGS.CAMERA_RENDER_DISTANCE
        );

        this.currentZoomAnimation = gsap.to({}, {});
        this.controls = new OrbitControls(
            this.camera,
            this.cssRenderer.domElement
        );
        this.directionalLight = new DirectionalLight(0xffffff, 2.5);
        this.earth = new Earth(this.textureLoader);
        this.ambientLight = new AmbientLight(0xffffff, 0.1);
        this.radar = new Radar(this);
        this.phas = new Map<string, AsteroidData>();
        this.phaBodies = new Map<string, Asteroid>();
        this.currentDate = new Date();
        this.isLive = true;
        this.hitScene = new HitScene(this);
        this.aiExpert = new AIExpert();
        this.hidePHAs = false;
        this.earthObject = new CelestialBody(
            this,
            "Earth",
            6371 / SETTINGS.SIZE_SCALE,
            23.439,
            0.0000729115,
            "#4A8BD5"
        );
        this.earthPos = new Vector3();
        this.earthOrbit = new Orbit(
            6.2398516,
            1.00000261,
            0.01671123,
            102.93768193,
            0,
            0.0,
            1.000702364394,
            new Date("2000-01-01"),
            this.earthObject,
            SETTINGS.ORBIT_COLOR,
            null,
            SETTINGS.ORBIT_LAYER
        );

        this.camera.layers.enableAll();

        this.cssRenderer.domElement.style.position = "absolute";
        this.cssRenderer.domElement.style.top = "0px";
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.radarHTMLElement = document.getElementById(
            "radar"
        ) as HTMLDivElement;

        this.camera.position.z = SETTINGS.CAMERA_START_DISTANCE;

        this.directionalLight.position.set(5, 3, 5);
        this.directionalLight.target = this.earth;

        this.earth.enableEffects(
            new Vector3()
                .subVectors(
                    this.directionalLight.target.position,
                    this.directionalLight.position
                )
                .normalize(),
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

        this.textureLoader.load(
            "./../../assets/textures/skybox.png",
            (texture: Texture) => {
                texture.mapping = EquirectangularReflectionMapping;
                texture.colorSpace = SRGBColorSpace;

                this.scene.background = texture;
            }
        );

        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(
            (timeStamp: DOMHighResTimeStamp, frame: XRFrame) => {
                this.renderer.render(this.scene, this.camera);
                this.cssRenderer.render(this.scene, this.camera);

                if (animator != undefined) {
                    animator(timeStamp, frame);
                }
            }
        );

        const container = document.querySelector(".Meteors");

        if (container) {
            container.appendChild(this.renderer.domElement);
            container.appendChild(this.cssRenderer.domElement);
        }
    }

    public async init(): Promise<void> {
        const currentDate = new Date();
        this.phas = await Loader.loadPHAData();
        this.earthObject.setOrbit(this.earthOrbit);
        this.earthObject.init(currentDate);

        this.phaBodies = await Loader.loadPHA(this, this.phas, currentDate);

        for (let [_, pha] of this.phaBodies) {
            this.scene.add(pha.group);
        }
    }

    public updateControlsState(event: MouseEvent): void {
        if (this.hitScene.isActive) return;

        const mousePos: Vector2 = new Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const isLMBDown: boolean = (event.buttons & 1) === 1;
        const raycaster: Raycaster = new Raycaster();
        raycaster.setFromCamera(mousePos, this.camera);

        this.controls.enabled =
            raycaster.intersectObject(this.earth).length > 0 || isLMBDown;
    }

    public updateControlsSpeed(): void {
        const distance: number = this.controls.getDistance();
        const minSpeed: number = 0.001;
        const maxSpeed: number = 3.0;
        const delta: number = Math.min(
            Math.max(
                (distance - this.controls.minDistance) /
                    (this.controls.maxDistance - this.controls.minDistance),
                0
            ),
            1
        );
        this.controls.rotateSpeed = MathUtils.lerp(minSpeed, maxSpeed, delta);
    }

    public updateDimensions(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.updateProjectionMatrix();

        this.ui.onResize();
    }

    public update(deltaTime: number): void {
        this.currentDate = new Date(
            this.currentDate.getTime() +
                1000 * SETTINGS.simulationSpeed * deltaTime
        );

        this.ui.update();
        this.ui.updateTimelineInfo(this.currentDate);

        this.calculateEarthPosition(this.currentDate, deltaTime);

        if (this.hitScene.isActive) this.hitScene.update(deltaTime);

        for (let [_, phaBody] of this.phaBodies) {
            phaBody.hide();
            phaBody.updatePosition(
                this.currentDate,
                deltaTime,
                SETTINGS.simulationSpeed / 86400
            );
            if (
                this.controls.getDistance() >
                    SETTINGS.MIN_DISTANCE_ASTEROID_RENDER &&
                this.hidePHAs == false
            ) {
                if (phaBody.calcDistanceToEarth(this.earthPos)) {
                    phaBody.show();
                }
            }
        }

        if (this.isLive && SETTINGS.simulationSpeed != 1) {
            this.isLive = false;
            this.ui.noLive();
        }
    }

    public setUpEventListeners(): void {
        this.ui.setUpEventListeners();

        this.radar.on("load", () => {
            this.earth.rotateFromClientsGeolocation(this.controls);
            this.radar.update();
        });

        this.radar.on("click", (event: MapMouseEvent) => {
            if (!SETTINGS.METEOR_MODE) return;
            const craterResult: CraterResult = this.ui.launchMeteor();

            const hitNormalVec: Vector3 = this.earth.getPositionFromGeoLocation(
                event.lngLat.lat,
                event.lngLat.lng
            );
            const mass = calculateMass(
                this.ui.meteorCreator._density,
                this.ui.meteorCreator._diameter
            );

            const fireballParams: FireballResult = estimateFireball(
                calculateKineticEnergy(
                    mass,
                    this.ui.meteorCreator._velocity * 1000
                )
            );

            this.radar.markSpot(
                Radar.fireballRangeLayerID,
                Radar.fireballRangeSourceID,
                {
                    latitude: event.lngLat.lat,
                    longitude: event.lngLat.lng,
                },
                fireballParams.Rf_m,
                "#fcba03"
            );

            this.radar.markSpot(
                Radar.impactSpotMarkingLayerID,
                Radar.impactSpotMarkingSourceID,
                {
                    latitude: event.lngLat.lat,
                    longitude: event.lngLat.lng,
                },
                craterResult.Dtc_m
            );

            this.hitScene.playScene(
                hitNormalVec,
                event.lngLat.lat,
                event.lngLat.lng,
                craterResult,
                fireballParams,
                mass,
                this.ui.meteorCreator._velocity * 1000
            );
        });
    }

    public resetCamera() {
        this.hitScene.isActive = false;
        this.disableMeteorMode();
        this.hidePHAs = false;
        this.controls.minDistance = SETTINGS.CAMERA_MIN_DISTANCE;

        const direction = new Vector3()
            .subVectors(this.controls.object.position, this.controls.target)
            .normalize();

        this.controls.object.position.copy(
            this.controls.target
                .clone()
                .add(direction.multiplyScalar(SETTINGS.CAMERA_START_AFTER_HIT))
        );
        this.controls.target.copy(new Vector3(0, 0, 0));
        this.camera.lookAt(this.controls.target);
        this.controls.update();
    }

    public setLiveDate(): void {
        this.currentDate = new Date();
        this.isLive = true;

        for (let [_, phaBody] of this.phaBodies) {
            phaBody.setLivePosition(this.currentDate);
        }
    }

    public enableMeteorMode(): void {
        SETTINGS.METEOR_MODE = true;
        this.radar.enableMeteorMode();
    }

    public disableMeteorMode(): void {
        SETTINGS.METEOR_MODE = false;
        this.radar.disableMeteorMode();
    }

    public showUI(): void {
        this.radar.show();
        this.ui.show();
    }

    public hideUI(): void {
        this.radar.hide();
        this.ui.hide();
    }

    private calculateEarthPosition(date: Date, deltaTime: number): void {
        this.earthObject.updatePosition(
            date,
            deltaTime,
            SETTINGS.simulationSpeed / 86400
        );
        if (this.earthObject.mesh?.position != null) {
            this.earthPos = this.earthObject.mesh.position;
            this.earth.rotation.y = this.earthObject.mesh.rotation.y;
        }
    }
}
