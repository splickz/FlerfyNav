import { ExportState } from '../../types';
import { CONSTANTS } from '../../domain/math/constants';
import { formatDM, formatAngle } from '../../domain/math/angles';
import { formatArcmin } from '../../domain/formatting';
import { STAR_CATALOG } from '../../domain/transformations';

export function buildExportState(store: {
  dataset: ExportState['dataset'];
  settings: ExportState['settings'];
  corrections: ExportState['corrections'];
  transformations: ExportState['transformations'];
  result: ExportState['result'];
}): ExportState {
  return {
    ...store,
    constants: Object.fromEntries(
      Object.entries(CONSTANTS).map(([k, v]) => [k, v])
    ),
  };
}

export function exportJSON(state: ExportState): string {
  return JSON.stringify(state, null, 2);
}

export function exportMarkdown(state: ExportState): string {
  const { dataset, settings, corrections, transformations, result, constants } = state;
  const env = dataset.environment;

  let md = `# FlerfyNav — Method Summary\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `**Tool:** FlerfyNav — browser-based celestial navigation solver using dot-product geometry\n\n`;

  // Dataset
  md += `## Dataset\n\n`;
  md += `- **Challenge:** ${dataset.label}\n`;
  md += `- **Date:** ${env.date}\n`;
  md += `- **Instrument:** ${env.instrument}\n`;
  md += `- **Method:** ${env.method}\n`;
  md += `- **Eye height:** ${env.eyeHeightMeters} m\n`;
  md += `- **Index error:** +${env.indexErrorArcmin}′\n`;
  md += `- **Speed:** ${env.speedKnots} kn, bearing ${env.trueBearing}°T\n`;
  md += `- **Temperature:** ${env.temperatureC}°C\n`;
  md += `- **Pressure:** ${env.pressureMb} mb\n\n`;

  // Settings
  md += `## Correction Settings\n\n`;
  md += `- **Corrections:** ${settings.useCorrections ? 'Enabled' : 'Disabled'}\n`;
  md += `- **Motion model:** ${settings.useMotion ? 'Moving observer' : 'Stationary observer'}\n\n`;

  // Observations & Corrections
  md += `## Observations & Corrections\n\n`;
  md += `| Star | UTC | Raw Altitude | Index | Dip | Refraction | Corrected |\n`;
  md += `|------|-----|-------------|-------|-----|------------|----------|\n`;

  dataset.observations.forEach((obs, i) => {
    const c = corrections[i];
    md += `| ${obs.starName} | ${obs.utcTime} | ${obs.rawAltitude.degrees}°${obs.rawAltitude.minutes.toFixed(1)}′ `;
    md += `| ${formatArcmin(c.indexCorrection)} | ${formatArcmin(c.dipCorrection)} `;
    md += `| ${formatArcmin(c.refractionCorrection)} | ${formatAngle(c.correctedAltitudeDeg)} |\n`;
  });

  // Source Star Data
  md += `\n## Source Star Data\n\n`;
  md += `Star positions from the Nautical Almanac 2018 daily pages for ${env.date}.\n`;
  md += `SHA and Declination are epoch-of-date values (precession/nutation pre-applied).\n\n`;
  md += `| Star | SHA (°) | Dec (°) | RA (°) |\n`;
  md += `|------|---------|--------|--------|\n`;
  transformations.forEach((t) => {
    const cat = STAR_CATALOG[t.starName];
    if (cat) {
      const sha = 360 - cat.ra;
      md += `| ${t.starName} | ${sha.toFixed(4)} | ${cat.dec.toFixed(4)} | ${cat.ra.toFixed(4)} |\n`;
    } else {
      md += `| ${t.starName} | — | — | — |\n`;
    }
  });

  // Transformation Pipeline
  md += `## Source Data Transformation\n\n`;
  md += `1. Star SHA and Dec from Nautical Almanac 2018 daily pages\n`;
  md += `2. GHA Aries at 08h UTC from hourly tables, interpolated at 15.04107°/hr\n`;
  md += `3. Star GHA = GHA_Aries + SHA\n`;
  md += `4. Unit vector: ŝ = (cos(Dec)·cos(-GHA), cos(Dec)·sin(-GHA), sin(Dec))\n\n`;

  md += `### Star Vectors Used\n\n`;
  transformations.forEach((t) => {
    const v = t.starUnitVector;
    md += `- **${t.starName}** @ ${t.utcTime} UTC: (${v.x.toFixed(6)}, ${v.y.toFixed(6)}, ${v.z.toFixed(6)}), `;
    md += `target dot = ${t.targetDotProduct.toFixed(6)}\n`;
  });

  // Light Path Assumptions
  md += `\n## Light Path Assumptions\n\n`;
  md += `- Light travels in straight lines from distant stars to the observer\n`;
  md += `- The sextant measures the angle between the incoming ray and the visible sea horizon\n`;
  md += `- Atmospheric refraction bends light downward, modeled via the Bennett (1982) formula\n`;
  md += `- Correction chain: H_s → (−IE) → (−Dip) → (−Refraction) → H_c\n\n`;

  // Geometric Model
  md += `## Geometric Model\n\n`;
  md += `**Unknowns:** Observer latitude (φ) and longitude (λ)\n\n`;
  md += `**Local vertical:** v̂(φ,λ) = (cosφ·cosλ, cosφ·sinλ, sinφ)\n\n`;
  md += `**Core constraint equation:**\n\n`;
  md += '```\n';
  md += `ŝᵢ · v̂ = sin(hc,i)    for i = 1..${transformations.length}\n`;
  md += '```\n\n';
  md += `With ${transformations.length} observations and 2 unknowns, there `;
  md += `${transformations.length - 2 === 1 ? 'is' : 'are'} ${transformations.length - 2} degree${transformations.length - 2 !== 1 ? 's' : ''} `;
  md += `of freedom for residual checking.\n\n`;
  md += `**Solver:** Gauss-Newton least squares with grid search initial guess and damped line search.\n\n`;

  // Constants
  md += `## Constants\n\n`;
  md += `| Name | Value | Description | Source |\n`;
  md += `|------|-------|-------------|--------|\n`;
  Object.entries(constants).forEach(([key, c]) => {
    md += `| ${key} | ${c.value} | ${c.description} | ${c.source} |\n`;
  });

  // Results
  if (result) {
    md += `\n## Result\n\n`;
    md += `- **Estimated position:** ${formatDM(result.estimatedLat, 'lat')}, ${formatDM(result.estimatedLon, 'lon')}\n`;
    md += `- **Decimal:** ${result.estimatedLat.toFixed(4)}°, ${result.estimatedLon.toFixed(4)}°\n`;
    md += `- **RMS residual:** ${result.totalRMS.toFixed(2)}′\n`;
    md += `- **Converged:** ${result.converged ? 'Yes' : 'No'} (${result.iterations} iterations)\n`;
    md += `- **Motion included:** ${result.motionIncluded ? 'Yes' : 'No'}\n\n`;

    if (result.warnings.length > 0) {
      md += `### Warnings\n\n`;
      result.warnings.forEach((w) => { md += `- ${w}\n`; });
      md += '\n';
    }

    md += `### Per-Star Residuals\n\n`;
    md += `| Star | Expected dot | Computed dot | Residual | Assessment |\n`;
    md += `|------|-------------|-------------|----------|------------|\n`;
    result.residuals.forEach((r) => {
      const abs = Math.abs(r.residualArcmin);
      const assessment = abs < 1 ? 'Excellent' : abs < 2 ? 'Good' : abs < 5 ? 'Acceptable' : 'Check data';
      md += `| ${r.starName} | ${r.expectedDot.toFixed(6)} | ${r.computedDot.toFixed(6)} | ${formatArcmin(r.residualArcmin)} | ${assessment} |\n`;
    });

    md += `\n### Fit Quality\n\n`;
    if (result.totalRMS < 2) {
      md += `RMS residual of ${result.totalRMS.toFixed(2)}′ indicates good internal consistency, `;
      md += `well within typical sextant precision (1′–2′).\n\n`;
    } else if (result.totalRMS < 5) {
      md += `RMS residual of ${result.totalRMS.toFixed(2)}′ is acceptable for field sextant observations.\n\n`;
    } else {
      md += `RMS residual of ${result.totalRMS.toFixed(2)}′ is larger than expected. Review input data.\n\n`;
    }
  }

  md += `## Reproducibility\n\n`;
  md += `This result was computed using FlerfyNav, a single-page React application `;
  md += `with no backend. All calculations run in the browser using modular TypeScript.\n\n`;
  md += `**Checklist:**\n`;
  md += `- [x] Dataset loaded and displayed\n`;
  md += `- [x] Correction formulas shown with all constants\n`;
  md += `- [x] Source star data and transformation pipeline documented\n`;
  md += `- [x] Light path assumptions stated\n`;
  md += `- [x] Geometric model and constraint equations shown\n`;
  md += `- [x] Residual validation computed\n`;
  md += `- [x] Full JSON export available for independent verification\n`;

  return md;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadJSON(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
