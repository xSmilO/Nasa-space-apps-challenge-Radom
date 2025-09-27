import type { CraterResult } from "./types";


export function degToRad(d: number) { return d * Math.PI / 180; }

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
    opts?: { rho_imp?: number; rho_target?: number; g?: number; }
): CraterResult {
    const rho_imp = opts?.rho_imp ?? 3000;
    const rho_target = opts?.rho_target ?? 2700;
    const g = opts?.g ?? 9.81;

    // transient crater diameter (m) --- Collins et al. 2005
    // Dtc = 1.161 * (rho_i/rho_t)^(1/3) * L^0.78 * v^0.44 * g^-0.22 * sin(theta)^(1/3)
    const sinTheta = Math.sin(degToRad(Math.max(0.0001, Math.min(89.9999, theta_deg))));
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
    let regime: 'simple' | 'complex' = 'simple';
    if (Dtc_km > 2.56) {
        regime = 'complex';
        // Eq.27 (Collins): Dfr (km) = 1.17 * Dtc(km)^1.13 / Dc(km)^0.13
        const Dfr_km = 1.17 * Math.pow(Dtc_km, 1.13) / Math.pow(Dc_km, 0.13);
        Dfr_m = Dfr_km * 1000;
    } else {
        regime = 'simple';
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
        regime
    };
}
}
