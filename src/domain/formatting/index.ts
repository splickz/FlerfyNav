export function formatNumber(n: number, decimals: number = 4): string {
  return n.toFixed(decimals);
}

export function formatArcmin(arcmin: number): string {
  const sign = arcmin >= 0 ? '+' : '';
  return `${sign}${arcmin.toFixed(1)}\u2032`;
}

export function formatDegrees(deg: number, decimals: number = 4): string {
  return `${deg.toFixed(decimals)}\u00B0`;
}

export function formatTimeDelta(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
