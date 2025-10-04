import { Vector3 } from "three";
import type Environment from "../core/environment";
import Meteor from "../element3D/meteor";
import { SETTINGS } from "../core/Settings";
import gsap from "gsap";
import Courtains from "../ui/courtains";
import Info from "../ui/info";
import Api from "../utility/api";

export default class HitScene {
    public isActive: boolean;
    private environment: Environment;
    private hitNormalVec: Vector3;
    private meteor: Meteor;
    private pointPos: Vector3;
    private courtains: Courtains;
    private info: Info;
    private api: Api;
    private meteorSpawned: boolean;

    constructor(environment: Environment) {
        this.isActive = false;
        this.environment = environment;
        this.hitNormalVec = new Vector3(0, 0, 0);
        this.meteor = new Meteor(environment);
        this.pointPos = new Vector3(0, 0, 0);
        this.courtains = new Courtains();
        this.info = new Info(this);
        this.api = new Api(this.info);
        this.meteorSpawned = false;

        this.meteor.init();
    }

    public playScene(hitNormalVec: Vector3, lan: number, long: number, craterRadius: number): void {
        this.isActive = true;
        this.hitNormalVec = hitNormalVec;
        this.environment.hidePHAs = true;

        this.environment.hideUI();

        // 1. go to the surface (check)
        // 2. Spawn meteor      (check)
        // 3. View this meteor  (check, chyba)
        // 4. Meteor is moving towards the camera (check)
        // 5. when it's close (flashbang on screen) (check)
        // 6. go to the default position (check, ale do poprawy chyba)
        // 7. set bigger radar (zara)
        // 8. show the statistics, like meteor parameters, zniszczenia, ile ludzi pierdyklo, (tera na to setup)
        // parametru krateru itd
        // 9. repeat
        //

        //1.

        this.goToSurface();
        this.api.calculatePopulation(lan, long, craterRadius);
    }

    public resetScene(): void {
        this.isActive = false;
        this.info.hide();
        this.environment.showUI();
    }

    public update(deltaTime: number): void {
        this.environment.controls.update();

        if (this.meteorSpawned) this.moveToTarget(deltaTime);
    }

    private goToSurface(): void {
        this.info.hide();
        const object = { distance: this.environment.controls.getDistance() };
        this.pointPos = this.hitNormalVec.clone().multiplyScalar(this.environment.earth.radius);
        const lookAtTarget = this.hitNormalVec.clone().multiplyScalar(this.environment.earth.radius * 10);
        // this.environment.camera.position.copy(this.pointPos);
        this.environment.controls.minDistance = 0;
        this.environment.camera.lookAt(lookAtTarget);
        this.environment.controls.target.copy(this.pointPos);
        this.environment.controls.enabled = false;

        this.courtains.close();
        gsap.to(object, {
            distance: 0,
            duration: 2,
            ease: "power1.inOut",
            onUpdate: () => {
                const direction = new Vector3().subVectors(this.environment.controls.object.position, this.pointPos).normalize();

                this.environment.controls.object.position.copy(
                    this.environment.controls.target.clone().add(direction.multiplyScalar(object.distance))
                );
            },
            onComplete: () => {
                this.environment.camera.position.copy(this.pointPos);
                this.environment.controls.target.copy(lookAtTarget);
                this.environment.camera.lookAt(lookAtTarget);
                this.courtains.open();

                this.spawnMeteor();
            }
        })
    }

    private spawnMeteor(): void {
        const meteorPos: Vector3 = this.environment.camera.position.clone().add(this.hitNormalVec.clone().multiplyScalar(SETTINGS.DISTANCE_SCALE));
        const radius = 50 / SETTINGS.SIZE_SCALE;

        this.meteor.spawn(radius, meteorPos);

        this.meteorSpawned = true;
    }

    private moveToTarget(deltaTime: number): void {
        if (this.meteor.mesh!.position.distanceTo(this.environment.camera.position) < 0.06) return this.flashbang();
        const direction = new Vector3().subVectors(this.environment.camera.position, this.meteor.mesh!.position);
        const speed = 70 * 70;
        // console.log(this.meteor.mesh!.position.distanceTo(this.environment.camera.position));
        this.meteor.mesh?.position.add(direction.multiplyScalar((1 / SETTINGS.DISTANCE_SCALE) * speed * deltaTime));
    }

    private flashbang(): void {
        this.meteor.hide();
        this.meteorSpawned = false;
        this.courtains.boom();

        setTimeout(() => {
            this.environment.radar.fullscreen();
        }, 1000);
        setTimeout(() => {
            this.environment.resetCamera();
            this.environment.resetCamera();
            this.courtains.boomFade();

            this.showInfo();
        }, 3000);
    }

    private showInfo(): void {
        this.info.show();
    }
}
