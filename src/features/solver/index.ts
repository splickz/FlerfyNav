import { SolverConfig, SolverResult, StarResidual, TransformedObservation, Vec3 } from '../../types';
import { dot, latLonToUnitVec } from '../../domain/vectors';
import { degToRad, radToDeg } from '../../domain/math/angles';
import { displacementToAngularOffset } from '../../domain/motion';

/**
 * Celestial Navigation Solver
 *
 * Core idea: Each star observation constrains the observer position via:
 *
 *   dot(starUnitVector, localVerticalUnitVector) = sin(correctedAltitude)
 *
 * Given three observations, we have three such constraints. The solver
 * finds the observer position (lat, lon) that best satisfies all three
 * simultaneously, using iterative least-squares minimization.
 */

const DEFAULT_CONFIG: SolverConfig = {
  useMotion: false,
  useCorrections: true,
  maxIterations: 500,
  tolerance: 1e-6,
};

/**
 * Get the observer vertical unit vector at a given position, optionally
 * shifted by a displacement from the base position.
 */
function getObserverVertical(
  baseLat: number,
  baseLon: number,
  displacement: Vec3 | undefined,
  useMotion: boolean
): Vec3 {
  if (useMotion && displacement) {
    const offset = displacementToAngularOffset(displacement, baseLat);
    return latLonToUnitVec(baseLat + offset.dLatDeg, baseLon + offset.dLonDeg);
  }
  return latLonToUnitVec(baseLat, baseLon);
}

/**
 * Compute total cost (sum of squared residuals) for a candidate position.
 */
function computeCost(
  obs: TransformedObservation[],
  lat: number,
  lon: number,
  useMotion: boolean
): number {
  let cost = 0;
  for (const o of obs) {
    const v = getObserverVertical(lat, lon, o.displacement, useMotion);
    const d = dot(o.starUnitVector, v);
    const clamped = Math.max(-1, Math.min(1, d));
    const computedAlt = Math.asin(clamped);
    const targetAlt = degToRad(o.correctedAltitudeDeg);
    const residual = computedAlt - targetAlt;
    cost += residual * residual;
  }
  return cost;
}

/**
 * Compute residual vector for current position.
 */
function computeResiduals(
  obs: TransformedObservation[],
  lat: number,
  lon: number,
  useMotion: boolean
): number[] {
  return obs.map((o) => {
    const v = getObserverVertical(lat, lon, o.displacement, useMotion);
    const d = dot(o.starUnitVector, v);
    const clamped = Math.max(-1, Math.min(1, d));
    const computedAlt = Math.asin(clamped);
    const targetAlt = degToRad(o.correctedAltitudeDeg);
    return computedAlt - targetAlt;
  });
}

/**
 * Compute numerical Jacobian.
 */
function numericalJacobian(
  obs: TransformedObservation[],
  lat: number,
  lon: number,
  useMotion: boolean
): { J: number[][]; r: number[] } {
  const delta = 1e-7;
  const r = computeResiduals(obs, lat, lon, useMotion);
  const rLat = computeResiduals(obs, lat + delta, lon, useMotion);
  const rLon = computeResiduals(obs, lat, lon + delta, useMotion);

  const J: number[][] = r.map((_, i) => [
    (rLat[i] - r[i]) / delta,
    (rLon[i] - r[i]) / delta,
  ]);

  return { J, r };
}

/**
 * Solve 2x2 normal equations: (J^T J) dx = -J^T r
 */
function solveNormalEquations(
  J: number[][],
  r: number[]
): { dLat: number; dLon: number } | null {
  let a00 = 0, a01 = 0, a11 = 0;
  let b0 = 0, b1 = 0;

  for (let i = 0; i < J.length; i++) {
    a00 += J[i][0] * J[i][0];
    a01 += J[i][0] * J[i][1];
    a11 += J[i][1] * J[i][1];
    b0 -= J[i][0] * r[i];
    b1 -= J[i][1] * r[i];
  }

  const det = a00 * a11 - a01 * a01;
  if (Math.abs(det) < 1e-30) return null;

  return {
    dLat: (a11 * b0 - a01 * b1) / det,
    dLon: (a00 * b1 - a01 * b0) / det,
  };
}

/**
 * Coarse grid search over the globe to find a good initial guess.
 * Tests positions at gridStep degree intervals and picks the one
 * with the lowest cost.
 */
function gridSearchInitialGuess(
  obs: TransformedObservation[],
  useMotion: boolean
): { lat: number; lon: number } {
  let bestLat = 0;
  let bestLon = 0;
  let bestCost = Infinity;

  // Coarse grid: 10° steps
  for (let lat = -80; lat <= 80; lat += 10) {
    for (let lon = -180; lon < 180; lon += 10) {
      const cost = computeCost(obs, lat, lon, useMotion);
      if (cost < bestCost) {
        bestCost = cost;
        bestLat = lat;
        bestLon = lon;
      }
    }
  }

  // Refine: 2° steps around best coarse result
  const refineLat = bestLat;
  const refineLon = bestLon;
  for (let lat = refineLat - 10; lat <= refineLat + 10; lat += 2) {
    for (let lon = refineLon - 10; lon <= refineLon + 10; lon += 2) {
      const cost = computeCost(obs, lat, lon, useMotion);
      if (cost < bestCost) {
        bestCost = cost;
        bestLat = lat;
        bestLon = lon;
      }
    }
  }

  return { lat: bestLat, lon: bestLon };
}

/**
 * Main solver entry point.
 */
export function solve(
  observations: TransformedObservation[],
  config: Partial<SolverConfig> = {}
): SolverResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const warnings: string[] = [];

  if (observations.length < 3) {
    warnings.push('Fewer than 3 observations — solution is underdetermined.');
  }

  // Grid search for initial guess
  let { lat, lon } = gridSearchInitialGuess(observations, cfg.useMotion);
  let iterations = 0;
  let converged = false;
  let prevCost = computeCost(observations, lat, lon, cfg.useMotion);

  for (let i = 0; i < cfg.maxIterations; i++) {
    const { J, r } = numericalJacobian(observations, lat, lon, cfg.useMotion);
    const step = solveNormalEquations(J, r);

    if (!step) {
      warnings.push('Singular Jacobian encountered — geometry may be degenerate.');
      break;
    }

    // Convert step from radians to degrees
    let dLat = radToDeg(step.dLat);
    let dLon = radToDeg(step.dLon);

    // Clamp step size to avoid divergence
    const maxStep = 5; // degrees
    const stepMag = Math.sqrt(dLat * dLat + dLon * dLon);
    if (stepMag > maxStep) {
      const scale = maxStep / stepMag;
      dLat *= scale;
      dLon *= scale;
    }

    // Line search: try full step, then progressively smaller
    let bestDamping = 0;
    let bestCost = prevCost;
    let bestLat = lat;
    let bestLon = lon;
    for (let damping = 1.0; damping >= 0.0625; damping *= 0.5) {
      const newLat = lat + dLat * damping;
      let newLon = lon + dLon * damping;
      while (newLon > 180) newLon -= 360;
      while (newLon < -180) newLon += 360;

      const newCost = computeCost(observations, newLat, newLon, cfg.useMotion);
      if (newCost < bestCost) {
        bestDamping = damping;
        bestCost = newCost;
        bestLat = newLat;
        bestLon = newLon;
      }
    }

    const oldCost = prevCost;
    const actualDLat = dLat * bestDamping;
    const actualDLon = dLon * bestDamping;
    lat = bestLat;
    lon = bestLon;
    prevCost = bestCost;

    // Clamp latitude
    if (lat > 89.99) lat = 89.99;
    if (lat < -89.99) lat = -89.99;

    // Normalize longitude
    while (lon > 180) lon -= 360;
    while (lon < -180) lon += 360;

    iterations = i + 1;

    // Converged: no improving step found, step is tiny, or cost barely changed
    const actualStepSize = Math.sqrt(actualDLat * actualDLat + actualDLon * actualDLon);
    const costChange = Math.abs(oldCost - prevCost);
    if (bestDamping === 0 || actualStepSize < cfg.tolerance || prevCost < 1e-18 || (costChange / (oldCost + 1e-30) < 1e-8 && i > 10)) {
      converged = true;
      break;
    }

  }

  if (!converged && iterations >= cfg.maxIterations) {
    warnings.push(`Did not converge within ${cfg.maxIterations} iterations.`);
  }

  // Compute final residuals
  const residuals: StarResidual[] = observations.map((o) => {
    const vertical = getObserverVertical(lat, lon, o.displacement, cfg.useMotion);
    const expected = Math.sin(degToRad(o.correctedAltitudeDeg));
    const computed = dot(o.starUnitVector, vertical);
    const residualRad = Math.asin(Math.max(-1, Math.min(1, computed))) - degToRad(o.correctedAltitudeDeg);
    const residualArcmin = radToDeg(residualRad) * 60;

    return {
      starName: o.starName,
      expectedDot: expected,
      computedDot: computed,
      residualArcmin,
    };
  });

  const totalRMS = Math.sqrt(
    residuals.reduce((sum, r) => sum + r.residualArcmin * r.residualArcmin, 0) / residuals.length
  );

  if (totalRMS > 5) {
    warnings.push(`RMS residual is ${totalRMS.toFixed(1)}\u2032 — fit quality is poor.`);
  }

  const localVertical = latLonToUnitVec(lat, lon);

  return {
    estimatedLat: lat,
    estimatedLon: lon,
    residuals,
    totalRMS,
    iterations,
    converged,
    motionIncluded: cfg.useMotion,
    localVertical,
    warnings,
  };
}
