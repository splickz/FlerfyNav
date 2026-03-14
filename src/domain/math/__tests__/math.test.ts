import { describe, it, expect } from 'vitest';
import {
  degToRad,
  radToDeg,
  dmToDecimalDeg,
  decimalDegToDM,
  arcminToDeg,
  degToArcmin,
  parseTimeToSeconds,
  timeDeltaSeconds,
  formatDM,
} from '../angles';
import { dot, normalize, magnitude, latLonToUnitVec, unitVecToLatLon, cross } from '../../vectors';
import { computeIndexCorrection, computeDipCorrection, computeRefractionCorrection } from '../../corrections';
import { computeMotionDisplacement } from '../../motion';

describe('Angle Conversions', () => {
  it('converts degrees to radians', () => {
    expect(degToRad(0)).toBe(0);
    expect(degToRad(180)).toBeCloseTo(Math.PI, 10);
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2, 10);
    expect(degToRad(360)).toBeCloseTo(2 * Math.PI, 10);
  });

  it('converts radians to degrees', () => {
    expect(radToDeg(0)).toBe(0);
    expect(radToDeg(Math.PI)).toBeCloseTo(180, 10);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 10);
  });

  it('converts degrees-minutes to decimal degrees', () => {
    expect(dmToDecimalDeg(70, 48.7)).toBeCloseTo(70.8117, 3);
    expect(dmToDecimalDeg(27, 9.0)).toBeCloseTo(27.15, 4);
    expect(dmToDecimalDeg(55, 18.4)).toBeCloseTo(55.3067, 3);
    expect(dmToDecimalDeg(0, 30)).toBeCloseTo(0.5, 10);
  });

  it('converts decimal degrees to degrees-minutes', () => {
    const { degrees, minutes } = decimalDegToDM(70.8117);
    expect(degrees).toBe(70);
    expect(minutes).toBeCloseTo(48.7, 0);
  });

  it('converts arcminutes to degrees', () => {
    expect(arcminToDeg(60)).toBeCloseTo(1, 10);
    expect(arcminToDeg(30)).toBeCloseTo(0.5, 10);
    expect(arcminToDeg(1)).toBeCloseTo(1 / 60, 10);
  });

  it('converts degrees to arcminutes', () => {
    expect(degToArcmin(1)).toBeCloseTo(60, 10);
    expect(degToArcmin(0.5)).toBeCloseTo(30, 10);
  });

  it('parses UTC time to seconds', () => {
    expect(parseTimeToSeconds('00:00:00')).toBe(0);
    expect(parseTimeToSeconds('01:00:00')).toBe(3600);
    expect(parseTimeToSeconds('08:28:15')).toBe(8 * 3600 + 28 * 60 + 15);
  });

  it('computes time delta in seconds', () => {
    expect(timeDeltaSeconds('08:28:15', '08:30:30')).toBe(135);
    expect(timeDeltaSeconds('08:28:15', '08:32:15')).toBe(240);
  });

  it('formats lat/lon in degrees-minutes', () => {
    expect(formatDM(51.5, 'lat')).toMatch(/51°30.0′ N/);
    expect(formatDM(-33.8, 'lat')).toMatch(/33°48.0′ S/);
    expect(formatDM(-122.4, 'lon')).toMatch(/122°24.0′ W/);
  });
});

describe('Vector Operations', () => {
  it('computes dot product correctly', () => {
    expect(dot({ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 })).toBe(1);
    expect(dot({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toBe(0);
    expect(dot({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 })).toBe(32);
  });

  it('computes magnitude', () => {
    expect(magnitude({ x: 3, y: 4, z: 0 })).toBeCloseTo(5, 10);
    expect(magnitude({ x: 1, y: 0, z: 0 })).toBe(1);
    expect(magnitude({ x: 0, y: 0, z: 0 })).toBe(0);
  });

  it('normalizes vectors to unit length', () => {
    const n = normalize({ x: 3, y: 4, z: 0 });
    expect(magnitude(n)).toBeCloseTo(1, 10);
    expect(n.x).toBeCloseTo(0.6, 10);
    expect(n.y).toBeCloseTo(0.8, 10);
  });

  it('handles zero vector normalization', () => {
    const n = normalize({ x: 0, y: 0, z: 0 });
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
    expect(n.z).toBe(0);
  });

  it('computes cross product', () => {
    const c = cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
    expect(c.x).toBeCloseTo(0, 10);
    expect(c.y).toBeCloseTo(0, 10);
    expect(c.z).toBeCloseTo(1, 10);
  });

  it('converts lat/lon to unit vector and back', () => {
    const v = latLonToUnitVec(45, 90);
    expect(magnitude(v)).toBeCloseTo(1, 10);
    const { lat, lon } = unitVecToLatLon(v);
    expect(lat).toBeCloseTo(45, 8);
    expect(lon).toBeCloseTo(90, 8);
  });

  it('dot product of star and vertical equals sin(altitude)', () => {
    // If a star is directly overhead (altitude 90°), the dot product
    // of the star vector and local vertical should be 1 = sin(90°)
    const lat = 30;
    const lon = -60;
    const vertical = latLonToUnitVec(lat, lon);
    // Star at same position = directly overhead
    const d = dot(vertical, vertical);
    expect(d).toBeCloseTo(Math.sin(degToRad(90)), 10);
  });
});

describe('Corrections', () => {
  it('computes index correction as negated IE', () => {
    expect(computeIndexCorrection(0.3)).toBeCloseTo(-0.3, 10);
    expect(computeIndexCorrection(-0.5)).toBeCloseTo(0.5, 10);
    expect(computeIndexCorrection(0)).toBeCloseTo(0, 10);
  });

  it('computes dip correction', () => {
    const dip = computeDipCorrection(2);
    expect(dip).toBeLessThan(0); // dip is always negative
    expect(dip).toBeCloseTo(-1.758 * Math.sqrt(2), 3);
  });

  it('computes refraction correction for moderate altitude', () => {
    const refr = computeRefractionCorrection(45, 10, 1010);
    expect(refr).toBeLessThan(0); // refraction always negative
    expect(Math.abs(refr)).toBeLessThan(2); // should be less than 2 arcmin at 45°
    expect(Math.abs(refr)).toBeGreaterThan(0.5); // but noticeable
  });

  it('refraction is larger at low altitudes', () => {
    const refrLow = computeRefractionCorrection(10, 10, 1010);
    const refrHigh = computeRefractionCorrection(60, 10, 1010);
    expect(Math.abs(refrLow)).toBeGreaterThan(Math.abs(refrHigh));
  });

  it('returns zero refraction at or below horizon', () => {
    expect(computeRefractionCorrection(0, 10, 1010)).toBe(0);
    expect(computeRefractionCorrection(-1, 10, 1010)).toBe(0);
  });
});

describe('Motion Displacement', () => {
  it('computes displacement for due north', () => {
    const d = computeMotionDisplacement(12, 0, 60); // 12 kn, north, 60 sec
    expect(d.y).toBeCloseTo(12 / 3600 * 60, 6); // 0.2 NM north
    expect(Math.abs(d.x)).toBeLessThan(1e-10); // no east component
    expect(d.z).toBe(0);
  });

  it('computes displacement for due east', () => {
    const d = computeMotionDisplacement(12, 90, 60);
    expect(d.x).toBeCloseTo(12 / 3600 * 60, 6); // 0.2 NM east
    expect(Math.abs(d.y)).toBeLessThan(1e-10);
  });

  it('returns zero displacement for zero time', () => {
    const d = computeMotionDisplacement(12, 45, 0);
    expect(d.x).toBe(0);
    expect(d.y).toBe(0);
  });

  it('returns zero displacement for zero speed', () => {
    const d = computeMotionDisplacement(0, 45, 120);
    expect(d.x).toBe(0);
    expect(d.y).toBe(0);
  });
});
