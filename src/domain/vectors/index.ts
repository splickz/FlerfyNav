import { Vec3 } from '../../types';
import { degToRad } from '../math/angles';

export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function magnitude(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function normalize(v: Vec3): Vec3 {
  const m = magnitude(v);
  if (m === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function latLonToUnitVec(latDeg: number, lonDeg: number): Vec3 {
  const lat = degToRad(latDeg);
  const lon = degToRad(lonDeg);
  return {
    x: Math.cos(lat) * Math.cos(lon),
    y: Math.cos(lat) * Math.sin(lon),
    z: Math.sin(lat),
  };
}

export function unitVecToLatLon(v: Vec3): { lat: number; lon: number } {
  const n = normalize(v);
  const lat = Math.asin(Math.max(-1, Math.min(1, n.z))) * (180 / Math.PI);
  const lon = Math.atan2(n.y, n.x) * (180 / Math.PI);
  return { lat, lon };
}

export function raDecToUnitVec(raDeg: number, decDeg: number): Vec3 {
  const ra = degToRad(raDeg);
  const dec = degToRad(decDeg);
  return {
    x: Math.cos(dec) * Math.cos(ra),
    y: Math.cos(dec) * Math.sin(ra),
    z: Math.sin(dec),
  };
}
