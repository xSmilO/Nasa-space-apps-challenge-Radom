import type HitScene from "../components/HitScene";
import {
    calculateKineticEnergy,
    computeDustSpread,
    energyTNT,
    estimateImpactLosses,
} from "../utility/math";

export default class Info {
    private resetButton: HTMLButtonElement | null;
    private container: HTMLDivElement | null;
    private hitScene: HitScene;

    public isWater: boolean;
    public population: Array<number>;
    //HTML ELEMENTS

    constructor(hitScene: HitScene) {
        this.hitScene = hitScene;
        this.isWater = false;
        this.population = [0, 0];

        this.container =
            document.querySelector<HTMLDivElement>(".infoContainer");
        this.resetButton =
            document.querySelector<HTMLButtonElement>(".resetBtn");

        this.resetButton?.addEventListener("click", () => {
            this.hitScene.resetScene();
        });
    }

    public show(): void {
        this.setValues();
        this.container?.classList.add("show");
        this.resetButton?.classList.add("show");
    }

    public hide(): void {
        this.container?.classList.remove("show");
        this.resetButton?.classList.remove("show");
    }

    public setValues(): void {
        const craterCategory = document.querySelector(
            ".infoContainer #crater-parameters"
        );

        craterCategory!.querySelector(".depth")!.innerHTML = `Depth: ${(
            this.hitScene.craterResult!.dtc_m / 1000
        ).toFixed(2)} km`;
        craterCategory!.querySelector(".area")!.innerHTML = `Area: ${(
            this.hitScene.craterResult!.area_m2 / 1000000
        ).toFixed(2)} km<sup>2</sup>`;
        craterCategory!.querySelector(".diameter")!.innerHTML = `Diameter: ${(
            this.hitScene.craterResult!.Dfr_m / 1000
        ).toFixed(2)}`;
        craterCategory!.querySelector(
            ".population"
        )!.innerHTML = `Estimated human losses: ${this.population[0]} people`;
        craterCategory!.querySelector(
            ".impact-power"
        )!.innerHTML = `The impact equivalent to: ${(
            energyTNT(
                calculateKineticEnergy(this.hitScene.mass, this.hitScene.vel)
            ) / 1000
        ).toFixed(2)} GIGA TNT`;
        // console.log("Depth: " + this.hitScene.craterResult?.dtc_m);
        // console.log("Area: " + this.hitScene.craterResult?.area_m2);
        // console.log("diameter: " + this.hitScene.craterResult?.Dfr_m);
        // console.log("population: " + this.population[0]);
        // console.log(
        //     "TNT: " +
        //         (
        //             energyTNT(
        //                 calculateKineticEnergy(
        //                     this.hitScene.mass,
        //                     this.hitScene.vel
        //                 )
        //             ) / 1000
        //         ).toFixed(2) +
        //         " GIGATON"
        // );

        // console.log("----------");
        const fireballCategory = document.querySelector(
            ".infoContainer #fireball-parameters"
        );
        fireballCategory!.querySelector(".KE")!.innerHTML = `Kinetic energy: ${(
            this.hitScene.fireballResult!.E_J / 1000
        ).toFixed(2)} kJ`;
        fireballCategory!.querySelector(".radius")!.innerHTML = `Radius: ${(
            this.hitScene.fireballResult!.Rf_m / 1000000
        ).toFixed(2)} km<sup>2</sup>`;
        fireballCategory!.querySelector(".KE")!.innerHTML = `Thermal energy: ${(
            this.hitScene.fireballResult!.Erad_J / 1000
        ).toFixed(2)} kJ`;

        fireballCategory!.querySelector(
            ".KE"
        )!.innerHTML = `Estimated human losse: ${this.population[1]} people`;
        // console.log("Kinetic energy: " + this.hitScene.fireballResult?.E_J);
        // console.log("Radius: " + this.hitScene.fireballResult?.Rf_m);
        // console.log("TE: " + this.hitScene.fireballResult?.Erad_J);
        // console.log("Population: " + this.population[1]);

        // console.log("---------");
        const lossCategory = document.querySelector(
            ".infoContainer #estimate-loss"
        );
        lossCategory!.querySelector(
            ".economic"
        )!.innerHTML = `Economic loss: ${Intl.NumberFormat("en", {
            notation: "compact",
        }).format(
            estimateImpactLosses({
                destroyedAreaKm2: this.hitScene.craterResult!.area_m2,
            }).totalEconomicLoss
        )} USD`;
        // console.log(
        //     "economic: " +
        //         estimateImpactLosses({
        //             destroyedAreaKm2: this.hitScene.craterResult!.area_m2,
        //         })
        // );

        // console.log("--------------");
        const dustCategory = document.querySelector(
            ".infoContainer #impact-dust"
        );
        const dustResult = computeDustSpread({
            impactEnergy: calculateKineticEnergy(
                this.hitScene.mass,
                this.hitScene.vel
            ),
        });

        dustCategory!.querySelector(".radius")!.innerHTML = `Radius: ${(
            dustResult.dustRadius / 1000
        ).toFixed(2)} km`;
        dustCategory!.querySelector(
            ".classification"
        )!.innerHTML = `Classification: ${dustResult.classification}`;
        // console.log("radius: " + dustResult.dustRadius);
        // console.log("classification: " + dustResult.classification);
    }
}
