import gsap from "gsap";
import {
    Camera,
    MathUtils,
    Mesh,
    MeshStandardMaterial,
    RepeatWrapping,
    SphereGeometry,
    SRGBColorSpace,
    Texture,
    TextureLoader,
    Vector3,
    type IUniform,
    type WebGLProgramParametersWithUniforms,
} from "three";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import { SETTINGS } from "../core/Settings";

const SIDE_ROT_PER_SEC = 0.00007292115;
import { EarthTextureBlendingShader } from "../shader/earthTextureBlending";
import { CloudsMorphShader } from "../shader/cloudsMorph";

export class Earth extends Mesh {
    private static longitudalOffset: number = 90.015;
    private static latitudalOffset: number = -0.01;

    public textureLoader: TextureLoader;
    public clouds: Mesh;
    private lastTimeStamp: DOMHighResTimeStamp = 0;
    public shaders: { [mesh: string]: WebGLProgramParametersWithUniforms } = {};

    constructor(textureLoader: TextureLoader) {
        super();

        this.textureLoader = textureLoader;
        this.clouds = new Mesh();

        this.geometry = this.makeSphere(100.0);
        this.material = new MeshStandardMaterial({
            map: this.initializeTexture("day.jpg"),
        });

        this.clouds.geometry = this.makeSphere(101.0);
        this.clouds.material = new MeshStandardMaterial({
            map: this.initializeTexture("clouds.jpg"),
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
        });
    }

    private initializeTexture(
        fileName: string,
        useSRGB: boolean = true
    ): Texture {
        const texture: Texture = this.textureLoader.load(
            `./../../assets/textures/earth/${fileName}`
        );

        if (useSRGB) {
            texture.colorSpace = SRGBColorSpace;
        }

        return texture;
    }

    private makeSphere(radius: number): SphereGeometry {
        return new SphereGeometry(radius, 128, 128);
    }

    public enableEffects(sunLightDirection: Vector3, camera: Camera): void {
        this.enableTextureBlend(sunLightDirection, camera);
        /* this.enableCloudsMorph();

    this.getCloudsTexture().wrapS = RepeatWrapping;
    this.getCloudsTexture().wrapT = RepeatWrapping;
    this.getCloudsTexture().repeat.set(1, 1); */
    }

    private modifyMaterial(
        which: MeshStandardMaterial,
        baseTextureName: string,
        uniforms: { [uniform: string]: IUniform },
        vertexShader: string,
        fragmentShader: string
    ): void {
        which.map = this.initializeTexture(baseTextureName, false);

        which.onBeforeCompile = (
            shader: WebGLProgramParametersWithUniforms
        ) => {
            this.shaders[which.uuid] = shader;

            shader.uniforms = Object.assign({}, shader.uniforms, uniforms);
            shader.vertexShader = vertexShader;
            shader.fragmentShader = fragmentShader;
        };
    }

    private enableTextureBlend(
        sunLightDirection: Vector3,
        camera: Camera
    ): void {
        const material: MeshStandardMaterial = this.getMaterial();
        const lightDirectionViewSpace: Vector3 = new Vector3();

        lightDirectionViewSpace.copy(sunLightDirection);
        lightDirectionViewSpace.transformDirection(camera.matrixWorldInverse);

        this.modifyMaterial(
            material,
            "day.jpg",
            {
                dayTexture: { value: material.map },
                nightTexture: { value: this.initializeTexture("night.jpg") },
                nightColorMultiplayer: { value: 20.0 },
                sunLightDirection: { value: lightDirectionViewSpace },
            },
            EarthTextureBlendingShader.vertex,
            EarthTextureBlendingShader.fragment
        );
    }

    private enableCloudsMorph(): void {
        const material: MeshStandardMaterial = this.getCloudsMaterial();

        this.modifyMaterial(
            material,
            "clouds.jpg",
            {
                time: { value: 0 },
            },
            CloudsMorphShader.vertex,
            CloudsMorphShader.fragment
        );
    }

    public rotateFromGeolocationRaw(
        controls: OrbitControls,
        latitude: number,
        longitude: number
    ): void {
        latitude = MathUtils.degToRad(latitude + Earth.latitudalOffset);
        longitude = MathUtils.degToRad(longitude + Earth.longitudalOffset);
        const directionVector: Vector3 = new Vector3(
            Math.sin(longitude) * Math.cos(latitude),
            Math.sin(latitude),
            Math.cos(longitude) * Math.cos(latitude)
        );

        const cameraPosition = directionVector.multiplyScalar(
            controls.getDistance()
        );

        gsap.to(this.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1,
            ease: "power1.inOut",
        });

        gsap.to(controls.object.position, {
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            duration: 1,
            ease: "power1.inOut",
            onUpdate: () => {
                controls.object.lookAt(controls.target);
            },
        });
    }

    public rotateFromGeolocation(controls: OrbitControls): void {
        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
                this.rotateFromGeolocationRaw(
                    controls,
                    position.coords.latitude,
                    position.coords.longitude
                );
            }
        );
    }

    public rotateFromDebug(controls: OrbitControls) {
        controls.object.position.set(
            54.916056693992815,
            82.02188541720652,
            -18.227105447870695
        );
        controls.object.lookAt(controls.target);
    }

    public getGeolocation(controls: OrbitControls): {
        latitude: number;
        longitude: number;
    } {
        const directionVector = this.getCrosshairDirectionVector(controls);
        const rotatedDirection = directionVector
            .clone()
            .applyQuaternion(this.quaternion.clone().invert());
        const latitude_ = MathUtils.radToDeg(
            Math.atan2(rotatedDirection.x, rotatedDirection.z)
        );
        const longitude_ = MathUtils.radToDeg(Math.asin(rotatedDirection.y));

        return {
            latitude: longitude_ - Earth.latitudalOffset,
            longitude: latitude_ - Earth.longitudalOffset,
        };
    }

    public getCrosshairDirectionVector(controls: OrbitControls): Vector3 {
        return new Vector3()
            .subVectors(controls.object.position, controls.target)
            .normalize();
    }

    public rotate(timeStamp: DOMHighResTimeStamp) {
        const delta: number = (timeStamp - this.lastTimeStamp) / 1000.0;
        const angularSpeed = (2.0 * Math.PI) / 86400;

        this.rotation.y += angularSpeed * delta;
        this.lastTimeStamp = timeStamp;
    }

    public getMaterial(): MeshStandardMaterial {
        return this.material as MeshStandardMaterial;
    }

    public getCloudsMaterial(): MeshStandardMaterial {
        return this.clouds.material as MeshStandardMaterial;
    }

    private getCloudsTexture(): Texture {
        return this.getCloudsMaterial().map as Texture;
    }
}

