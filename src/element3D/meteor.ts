import { MeshStandardMaterial, SphereGeometry, Mesh, Vector3, Quaternion } from "three";
import type Environment from "../core/environment";
import { randomNumber } from "../utility/math";

export default class Meteor {
    public mesh: Mesh | null;
    public speed: number;
    private radius: number;
    private environment: Environment;

    constructor(environment: Environment) {
        this.environment = environment;
        this.mesh = null;
        this.radius = 1;
        this.speed = 1;
    }

    public init(): void {
        const geo = new SphereGeometry(this.radius);
        const mat = new MeshStandardMaterial({ color: 0xfafafa });

        this.mesh = new Mesh(geo, mat);

        this.environment.scene.add(this.mesh);
    }

    public spawn(size: number, pos: Vector3): void {
        if (!this.mesh) return;
        this.mesh.visible = true;
        this.mesh.scale.copy(new Vector3(size, size, size));

        const axis = new Vector3(Math.random(), Math.random(), Math.random()).normalize();
        const angle = randomNumber(0, Math.PI * 0.08);
        const q = new Quaternion().setFromAxisAngle(axis, angle);


        this.mesh.position.copy(pos).applyQuaternion(q);
    }

    public hide(): void {
        this.mesh!.visible = false;
    }
}
