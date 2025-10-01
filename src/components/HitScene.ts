import { Vector3 } from "three";
import type Environment from "../core/environment";
import { SETTINGS } from "../core/Settings";

export default class HitScene {
    public isActive: boolean;
    private environment: Environment;
    private hitNormalVec: Vector3;
    constructor(environment: Environment) {
        this.isActive = false;
        this.environment = environment;
        this.hitNormalVec = new Vector3(0, 0, 0);
    }

    public playScene(hitNormalVec: Vector3): void {
        this.isActive = true;
        this.hitNormalVec = hitNormalVec;
        this.environment.hidePHAs = true;

        this.environment.hideUI();

        // 1. go to the surface
        // 2. Spawn meteor
        // 3. View this meteor
        // 4. Meteor is moving towards the camera
        // 5. when it's close (flashbang on screen)
        // 6. go to the default position
        // 7. set bigger radar
        // 8. show the statistics, like meteor parameters, zniszczenia, ile ludzi zajebalo,
        // parametru krateru itd
        // 9. repeat
        //

        //1.

        this.goToSurface();
        this.spawnMeteor();
    }

    public update(deltaTime: number): void {

    }

    private goToSurface(): void {
        const pointPos = this.hitNormalVec.clone().multiplyScalar(this.environment.earth.radius * 1.000001);
        const lookAtTarget = this.hitNormalVec.clone().multiplyScalar(this.environment.earth.radius * 10);
        this.environment.camera.position.copy(pointPos);
        this.environment.camera.lookAt(lookAtTarget);

        this.environment.controls.minDistance = 0;
        this.environment.controls.target.copy(lookAtTarget);

        this.environment.controls.update();

        // setTimeout(() => {
        //     this.resetCamera();
        // }, 2000);
    }

    private spawnMeteor(): void {

    }
}
