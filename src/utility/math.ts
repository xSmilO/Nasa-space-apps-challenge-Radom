import type { CraterResult, FireballResult } from "./types";
import type { TsunamiParams, TsunamiResults } from "./types";
import type { DustParams, DustSpreadResult } from "./types";
import type { LossEstimate, LossParams } from "./types";

export function randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function degToRad(d: number) {
    return (d * Math.PI) / 180;
}

/**
 * Collins et al. (2005) transient crater scaling + final crater rules.
 * Inputs:
 *  - L_m: impactor diameter in meters
 *  - v_ms: impact speed in m/s
 *  - rho_imp: impactor density kg/m^3, default 3000 (stony)
 *  - rho_target: target density kg/m^3, default 2700 (typical crustal rock)
 *  - theta_deg: impact angle in degrees measured from horizontal (0° = grazing, 90° = vertical)
 *  - g: gravity m/s^2 (earth ~9.81)
 */
export function craterFromImpactor(
    L_m: number,
    v_ms: number,
    theta_deg: number,
    opts?: { rho_imp?: number; rho_target?: number; g?: number }
): CraterResult {
    const rho_imp = opts?.rho_imp ?? 3000;
    const rho_target = opts?.rho_target ?? 2700;
    const g = opts?.g ?? 9.81;

    // transient crater diameter (m) --- Collins et al. 2005
    // Dtc = 1.161 * (rho_i/rho_t)^(1/3) * L^0.78 * v^0.44 * g^-0.22 * sin(theta)^(1/3)
    const sinTheta = Math.sin(
        degToRad(Math.max(0.0001, Math.min(89.9999, theta_deg)))
    );
    const Dtc_m =
        1.161 *
        Math.pow(rho_imp / rho_target, 1 / 3) *
        Math.pow(L_m, 0.78) *
        Math.pow(v_ms, 0.44) *
        Math.pow(g, -0.22) *
        Math.pow(sinTheta, 1 / 3);

    // Decide simple vs complex regime and compute final rim diameter
    const Dtc_km = Dtc_m / 1000;
    const Dc_km = 3.2; // simple->complex transition diameter used by Collins (km)
    let Dfr_m: number;
    let regime: "simple" | "complex" = "simple";
    if (Dtc_km > 2.56) {
        regime = "complex";
        // Eq.27 (Collins): Dfr (km) = 1.17 * Dtc(km)^1.13 / Dc(km)^0.13
        const Dfr_km = (1.17 * Math.pow(Dtc_km, 1.13)) / Math.pow(Dc_km, 0.13);
        Dfr_m = Dfr_km * 1000;
    } else {
        regime = "simple";
        Dfr_m = 1.25 * Dtc_m; // Eq.22 approximate for simple craters
    }

    // transient crater depth approximation (Collins uses Dtc/2.828 for some estimates)
    const dtc_m = Dtc_m / 2.828;

    // area of final crater (planform)
    const area_m2 = Math.PI * Math.pow(Dfr_m / 2, 2);

    return {
        Dtc_m,
        Dfr_m,
        dtc_m,
        area_m2,
        regime,
    };
}

/**
 * compute fireball properties
 * @param E_J kinetic energy in joules
 * @param opts.K luminous/thermal efficiency (default 3e-3)
 * @param opts.transparencyTemp_K transparency temp for Stefan-Boltzmann based duration (default 3000 K)
 */
export function estimateFireball(
    E_J: number,
    opts?: {
        K?: number;
        transparencyTemp_K?: number;
        impactVelocity_ms?: number;
    }
): FireballResult {
    const K = opts?.K ?? 3e-3; // default luminous/thermal efficiency (Collins example)
    let Rf_m = 0.002 * Math.pow(E_J, 1 / 3); // Collins Eqn (32*)
    if (E_J < 1e15) {
        Rf_m = 0.002 * Math.pow(E_J, 1 / 3);
    } else {
        Rf_m = 0.013 * Math.pow(E_J, 0.294);
    }
    const Erad_J = K * E_J;

    // hemisphere area at radius r: 2 * PI * r^2
    const thermalFluxAt_r = (r_m: number) => {
        if (r_m <= 0) return Infinity;
        return Erad_J / (2 * Math.PI * r_m * r_m); // J/m^2 assuming isotropic hemisphere
    };

    // duration estimate (rough): use Stefan-Boltzmann at T* to estimate time Wt:
    // Wt ≈ (Erad_J / (2 * PI * Rf_m^2)) / (sigma * T*^4)
    // but Erad_J/(2*pi*Rf^2) is the average radiant energy per unit area;
    // we use T*=opts.transparencyTemp_K (Collins uses ~3000 K)
    const sigma = 5.670374419e-8;
    const Tstar = opts?.transparencyTemp_K ?? 3000;
    const avgFluxAtFireballSurface = Erad_J / (2 * Math.PI * Rf_m * Rf_m);
    const duration_s = avgFluxAtFireballSurface / (sigma * Math.pow(Tstar, 4));

    return {
        E_J,
        Rf_m,
        Erad_J,
        thermalFluxAt_r,
        duration_s,
        K_used: K,
    };
}

export function energyTNT(energyJules: number): number {
    return energyJules / (4.184 * Math.pow(10, 15));
}

export function calculateMass(density: number, diameter: number): number {
    return (4 / 3) * Math.PI * Math.pow(diameter / 2, 3) * density;
}

export function calculateKineticEnergy(
    meteorMassKG: number,
    velocityMPS: number
): number {
    return meteorMassKG * (velocityMPS * velocityMPS) * 0.5;
}

export function shockwaveRange(energyTNT: number): number {
    return 10 * Math.pow(energyTNT, 0.33);
}

export function computeTsunamiImpact(params: TsunamiParams): TsunamiResults {
    const {
        craterRadius,
        craterDepth,
        displacedFraction = 0.5,
        dispersalFactor = 5,
        runupFactor = 2,
        shoreSlopeDeg = 1,
        shoreDistance = 1e5, // domyślnie 100 km
        craterShapeFactor = 1 / 3, // stożek
    } = params;

    const g = 9.80665;

    // --- Objętość krateru (stożek/paraboloida)
    const craterVolume =
        craterShapeFactor * Math.PI * craterRadius ** 2 * craterDepth;

    // --- Przemieszczona objętość wody
    const displacedVolume = displacedFraction * craterVolume;

    // --- Obszar początkowego zaburzenia
    const r0 = dispersalFactor * craterRadius;
    const A0 = Math.PI * r0 ** 2;

    // --- Początkowa wysokość fali
    const initialWaveHeight = displacedVolume / A0;

    // --- Zanikanie amplitudy: H(r) = H0 * sqrt(r0 / r)
    const waveHeightAtShore = initialWaveHeight * Math.sqrt(r0 / shoreDistance);

    // --- Run-up (napływ na brzeg)
    const runup = runupFactor * waveHeightAtShore;

    // --- Odległość zalania
    const slopeRad = (shoreSlopeDeg * Math.PI) / 180;
    const inundationDistance =
        Math.tan(slopeRad) > 1e-6 ? runup / Math.tan(slopeRad) : Infinity;

    return {
        craterVolume,
        displacedVolume,
        initialWaveHeight,
        waveHeightAtShore,
        runup,
        inundationDistance,
    };
}

export function computeDustSpread(params: DustParams): DustSpreadResult {
    const { impactEnergy, atmosphereHeight = 12_000 } = params;

    // klasyfikacja i promień na podstawie energii (logarytmicznie)
    const logE = Math.log10(impactEnergy);
    let dustRadius: number;
    let classification: string;

    if (logE < 15) {
        dustRadius = 50_000; // 50 km
        classification = "local";
    } else if (logE < 17) {
        dustRadius = 500_000; // 500 km
        classification = "regional";
    } else if (logE < 19) {
        dustRadius = 2_000_000; // 2000 km
        classification = "continental";
    } else {
        dustRadius = 6_400_000; // ~ promień Ziemi → globalny
        classification = "global";
    }

    const dustArea = Math.PI * dustRadius ** 2;

    return { dustRadius, dustArea, classification };
}

export function estimateImpactLosses(params: LossParams): LossEstimate {
    const {
        destroyedAreaKm2,
        costPerKm2 = 5e9, // domyślnie 5 mld USD/km² (duże miasta)
        populationDensity = 500,
        gdpPerCapita = 20_000,
    } = params;

    const totalEconomicLoss = destroyedAreaKm2 * costPerKm2;
    const populationAffected = destroyedAreaKm2 * populationDensity;
    const humanLossesValue = populationAffected * gdpPerCapita;
    const totalLossWithHumans = totalEconomicLoss + humanLossesValue;

    return {
        totalEconomicLoss,
        populationAffected,
        humanLossesValue,
        totalLossWithHumans,
    };
}
