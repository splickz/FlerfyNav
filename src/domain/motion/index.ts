import { Vec3 } from '../../types';
import { degToRad } from '../math/angles';
import { CONSTANTS } from '../math/constants';

export function computeMotionDisplacement(
  speedKnots: number,
  bearingDeg: number,
  elapsedSeconds: number
): Vec3 {
  const nmPerSec = CONSTANTS.NM_PER_KNOT_SECOND.value;
  const distanceNM = speedKnots * nmPerSec * elapsedSeconds;
  const bearingRad = degToRad(bearingDeg);

  return {
    x: distanceNM * Math.sin(bearingRad),
    y: distanceNM * Math.cos(bearingRad),
    z: 0,
  };
}

export function displacementToAngularOffset(
  displacement: Vec3,
  latDeg: number
): { dLatDeg: number; dLonDeg: number } {
  const dLatNM = displacement.y;
  const dLonNM = displacement.x;

  const dLatDeg = dLatNM / 60;
  const dLonDeg = dLonNM / (60 * Math.cos(degToRad(latDeg)));

  return { dLatDeg, dLonDeg };
}

export function formatDisplacement(d: Vec3): string {
  const dist = Math.sqrt(d.x * d.x + d.y * d.y);
  return `${dist.toFixed(3)} NM (E: ${d.x.toFixed(3)}, N: ${d.y.toFixed(3)})`;
}
