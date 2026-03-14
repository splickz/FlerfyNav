import { CorrectionBreakdown, EnvironmentConfig, Observation } from '../../types';
import { CONSTANTS } from '../math/constants';
import { dmToDecimalDeg } from '../math/angles';

export function computeIndexCorrection(indexErrorArcmin: number): number {
  return -indexErrorArcmin;
}

export function computeDipCorrection(eyeHeightMeters: number): number {
  const coeff = CONSTANTS.DIP_COEFFICIENT.value;
  return -coeff * Math.sqrt(eyeHeightMeters);
}

export function computeRefractionCorrection(
  apparentAltDeg: number,
  temperatureC: number,
  pressureMb: number
): number {
  const A = CONSTANTS.STANDARD_REFRACTION_A.value;
  const B = CONSTANTS.STANDARD_REFRACTION_B.value;
  const C = CONSTANTS.STANDARD_REFRACTION_C.value;
  const T0 = CONSTANTS.STANDARD_TEMPERATURE_C.value;
  const P0 = CONSTANTS.STANDARD_PRESSURE_MB.value;

  if (apparentAltDeg <= 0) return 0;

  const h = apparentAltDeg;
  const tanArg = h + B / (h + C);
  const tanVal = Math.tan(tanArg * Math.PI / 180);

  if (tanVal <= 0) return 0;

  const R0 = A / tanVal;

  const pressureFactor = pressureMb / P0;
  const tempFactor = (T0 + 273.15) / (temperatureC + 273.15);

  return -(R0 * pressureFactor * tempFactor);
}

export function applyCorrections(
  obs: Observation,
  env: EnvironmentConfig,
  useCorrections: boolean
): CorrectionBreakdown {
  const rawDeg = dmToDecimalDeg(obs.rawAltitude.degrees, obs.rawAltitude.minutes);

  if (!useCorrections) {
    return {
      indexCorrection: 0,
      dipCorrection: 0,
      refractionCorrection: 0,
      totalCorrection: 0,
      rawAltitudeDeg: rawDeg,
      correctedAltitudeDeg: rawDeg,
    };
  }

  const indexCorr = computeIndexCorrection(env.indexErrorArcmin);
  const dipCorr = computeDipCorrection(env.eyeHeightMeters);
  const apparentDeg = rawDeg + (indexCorr + dipCorr) / 60;
  const refrCorr = computeRefractionCorrection(apparentDeg, env.temperatureC, env.pressureMb);
  const totalCorr = indexCorr + dipCorr + refrCorr;
  const correctedDeg = rawDeg + totalCorr / 60;

  return {
    indexCorrection: indexCorr,
    dipCorrection: dipCorr,
    refractionCorrection: refrCorr,
    totalCorrection: totalCorr,
    rawAltitudeDeg: rawDeg,
    correctedAltitudeDeg: correctedDeg,
  };
}
