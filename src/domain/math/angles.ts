import { CONSTANTS } from './constants';

const D2R = CONSTANTS.DEG_TO_RAD.value;
const R2D = CONSTANTS.RAD_TO_DEG.value;
const AM2D = CONSTANTS.ARCMIN_TO_DEG.value;

export function degToRad(deg: number): number {
  return deg * D2R;
}

export function radToDeg(rad: number): number {
  return rad * R2D;
}

export function dmToDecimalDeg(degrees: number, minutes: number): number {
  return degrees + minutes / 60;
}

export function decimalDegToDM(decDeg: number): { degrees: number; minutes: number } {
  const d = Math.floor(Math.abs(decDeg));
  const m = (Math.abs(decDeg) - d) * 60;
  return { degrees: decDeg < 0 ? -d : d, minutes: m };
}

export function arcminToDeg(arcmin: number): number {
  return arcmin * AM2D;
}

export function degToArcmin(deg: number): number {
  return deg * 60;
}

export function formatDM(decimalDeg: number, type: 'lat' | 'lon' = 'lat'): string {
  const abs = Math.abs(decimalDeg);
  let d = Math.floor(abs);
  let m = (abs - d) * 60;
  // Handle rounding: if minutes rounds to 60, carry into degrees
  if (m >= 59.95) {
    m = 0;
    d += 1;
  }
  const suffix = type === 'lat'
    ? (decimalDeg >= 0 ? 'N' : 'S')
    : (decimalDeg >= 0 ? 'E' : 'W');
  return `${d}\u00B0${m.toFixed(1)}\u2032 ${suffix}`;
}

export function formatAngle(decimalDeg: number): string {
  const abs = Math.abs(decimalDeg);
  let d = Math.floor(abs);
  let m = (abs - d) * 60;
  if (m >= 59.95) {
    m = 0;
    d += 1;
  }
  const sign = decimalDeg < 0 ? '-' : '';
  return `${sign}${d}\u00B0${m.toFixed(1)}\u2032`;
}

export function parseTimeToSeconds(utcTime: string): number {
  const [h, m, s] = utcTime.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

export function timeDeltaSeconds(t1: string, t2: string): number {
  return parseTimeToSeconds(t2) - parseTimeToSeconds(t1);
}
