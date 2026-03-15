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

  let md = `# FlerfyNav — Reproducible Method Summary\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n`;
  md += `**Tool:** FlerfyNav — browser-based celestial navigation solver using transparent dot-product geometry\n\n`;
  md += `---\n\n`;

  // 1. Dataset
  md += `## 1. Dataset\n\n`;
  md += `| Parameter | Value |\n`;
  md += `|-----------|-------|\n`;
  md += `| Challenge | ${dataset.label} |\n`;
  md += `| Date | ${env.date} |\n`;
  md += `| Instrument | ${env.instrument} |\n`;
  md += `| Method | ${env.method} |\n`;
  md += `| Eye height | ${env.eyeHeightMeters} m |\n`;
  md += `| Index error | +${env.indexErrorArcmin}′ |\n`;
  md += `| Speed / bearing | ${env.speedKnots} kn / ${env.trueBearing}°T |\n`;
  md += `| Temperature | ${env.temperatureC}°C |\n`;
  md += `| Pressure | ${env.pressureMb} mb |\n\n`;

  // 2. Correction Settings
  md += `## 2. Correction Settings\n\n`;
  md += `- Corrections: **${settings.useCorrections ? 'Enabled' : 'Disabled'}**\n`;
  md += `- Motion model: **${settings.useMotion ? 'Moving observer' : 'Stationary observer'}**\n\n`;

  // 3. Correction Formulas
  md += `## 3. Correction Formulas\n\n`;
  md += `**Index correction:** IC = −IE\n\n`;
  md += `**Dip correction:** Dip = −${CONSTANTS.DIP_COEFFICIENT.value} · √(h_eye)  [h_eye in meters, result in arcminutes]\n\n`;
  md += `**Atmospheric refraction (Bennett 1982):**\n`;
  md += '```\n';
  md += `R₀ = 1.02 / tan(h + 10.3/(h + 5.11))    [h in degrees, R in arcminutes]\n`;
  md += `R  = R₀ · (P/1010) · (283.15/(T + 273.15))\n`;
  md += '```\n\n';
  md += `**Correction chain:** H_s → (−IE) → (−Dip) → (−Refraction) → H_c\n\n`;

  // 4. Observations & Corrections Table
  md += `## 4. Observations & Corrections\n\n`;
  md += `| Star | UTC | Raw Altitude | Index | Dip | Refraction | Corrected |\n`;
  md += `|------|-----|-------------|-------|-----|------------|----------|\n`;
  dataset.observations.forEach((obs, i) => {
    const c = corrections[i];
    md += `| ${obs.starName} | ${obs.utcTime} | ${obs.rawAltitude.degrees}°${obs.rawAltitude.minutes.toFixed(1)}′ `;
    md += `| ${formatArcmin(c.indexCorrection)} | ${formatArcmin(c.dipCorrection)} `;
    md += `| ${formatArcmin(c.refractionCorrection)} | ${formatAngle(c.correctedAltitudeDeg)} |\n`;
  });

  // 5. Source Star Data
  md += `\n## 5. Source Star Data\n\n`;
  md += `Star direction vectors represent the apparent incoming direction of starlight used as geometric inputs.\n`;
  md += `Positions from the Nautical Almanac 2018 daily pages for ${env.date} (epoch-of-date, precession/nutation pre-applied).\n\n`;
  md += `| Star | SHA (°) | Dec (°) | RA (°) |\n`;
  md += `|------|---------|--------|--------|\n`;
  transformations.forEach((t) => {
    const cat = STAR_CATALOG[t.starName];
    if (cat) {
      const sha = 360 - cat.ra;
      md += `| ${t.starName} | ${sha.toFixed(4)} | ${cat.dec.toFixed(4)} | ${cat.ra.toFixed(4)} |\n`;
    }
  });

  // 6. Transformation Pipeline
  md += `\n## 6. Source Data Transformation\n\n`;
  md += `Pipeline: SHA, Dec → GHA = GHA_Aries + SHA → Earth-fixed unit vector\n\n`;
  md += '```\n';
  md += `ŝ = (cos(Dec)·cos(−GHA), cos(Dec)·sin(−GHA), sin(Dec))\n`;
  md += '```\n\n';
  md += `GHA Aries at 08h UTC = 232°25.6′. Interpolation rate = 15.04107°/hr.\n\n`;
  md += `### Star Vectors Used\n\n`;
  transformations.forEach((t) => {
    const v = t.starUnitVector;
    const cat = STAR_CATALOG[t.starName];
    const sha = cat ? (360 - cat.ra).toFixed(2) : '—';
    const dec = cat ? cat.dec.toFixed(2) : '—';
    md += `- **${t.starName}** @ ${t.utcTime} UTC (SHA ${sha}°, Dec ${dec}°)\n`;
    md += `  ŝ = (${v.x.toFixed(6)}, ${v.y.toFixed(6)}, ${v.z.toFixed(6)}), target dot = ${t.targetDotProduct.toFixed(6)}\n`;
  });

  // 7. Light Path Assumptions
  md += `\n## 7. Light Path Assumptions\n\n`;
  md += `- Light travels in straight lines from distant stars to the observer\n`;
  md += `- The sextant measures the angle between the incoming ray and the visible sea horizon\n`;
  md += `- Atmospheric refraction is handled through the Bennett (1982) formula when corrections are enabled\n`;
  md += `- Star positions from the Nautical Almanac are treated as exact for this date\n`;
  md += `- No independent verification of almanac source values has been performed\n\n`;

  // 8. Geometric Model
  md += `## 8. Geometric Model\n\n`;
  md += `**Unknowns:** Observer latitude (φ) and longitude (λ), defining the local vertical unit vector.\n\n`;
  md += '```\n';
  md += `v̂(φ,λ) = (cosφ·cosλ, cosφ·sinλ, sinφ)\n`;
  md += '```\n\n';
  md += `**Core constraint equation:**\n\n`;
  md += '```\n';
  md += `ŝᵢ · v̂ = sin(hc,i)    for i = 1..${transformations.length}\n`;
  md += '```\n\n';
  md += `Where:\n`;
  md += `- ŝᵢ = star unit vector (known, from almanac data + time-dependent GHA)\n`;
  md += `- v̂  = observer local vertical (unknown, solved for)\n`;
  md += `- hc,i = corrected altitude (known, after index/dip/refraction)\n\n`;
  md += `With ${transformations.length} observations and 2 unknowns, there `;
  md += `${transformations.length - 2 === 1 ? 'is' : 'are'} ${transformations.length - 2} degree${transformations.length - 2 !== 1 ? 's' : ''} `;
  md += `of freedom for residual checking.\n\n`;
  md += `**Solver:** Gauss-Newton least squares with global grid search initial guess (10° then 2° refinement) and damped line search.\n\n`;

  // 9. Constants
  md += `## 9. Constants Used in Formulas\n\n`;
  md += `| Name | Value | Description |\n`;
  md += `|------|-------|-------------|\n`;
  Object.entries(constants).forEach(([key, c]) => {
    md += `| ${key} | ${c.value} | ${c.description} |\n`;
  });

  // 10. Results
  if (result) {
    md += `\n## 10. Result\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Estimated position | ${formatDM(result.estimatedLat, 'lat')}, ${formatDM(result.estimatedLon, 'lon')} |\n`;
    md += `| Decimal | ${result.estimatedLat.toFixed(4)}°, ${result.estimatedLon.toFixed(4)}° |\n`;
    md += `| RMS residual | ${result.totalRMS.toFixed(2)}′ |\n`;
    md += `| Converged | ${result.converged ? 'Yes' : 'No'} (${result.iterations} iterations) |\n`;
    md += `| Motion included | ${result.motionIncluded ? 'Yes' : 'No'} |\n\n`;

    if (result.warnings.length > 0) {
      md += `### Warnings\n\n`;
      result.warnings.forEach((w) => { md += `- ${w}\n`; });
      md += '\n';
    }

    md += `### Per-Star Residuals\n\n`;
    md += `| Star | Expected dot | Computed dot | Residual |\n`;
    md += `|------|-------------|-------------|----------|\n`;
    result.residuals.forEach((r) => {
      md += `| ${r.starName} | ${r.expectedDot.toFixed(6)} | ${r.computedDot.toFixed(6)} | ${formatArcmin(r.residualArcmin)} |\n`;
    });

    md += `\n### Fit Quality\n\n`;
    if (result.totalRMS < 2) {
      md += `This solution shows internal consistency at the arcminute level `;
      md += `(RMS ${result.totalRMS.toFixed(2)}′).\n\n`;
    } else if (result.totalRMS < 5) {
      md += `Residuals of a few arcminutes are consistent with normal sextant-style observational `;
      md += `uncertainty under field conditions (RMS ${result.totalRMS.toFixed(2)}′).\n\n`;
    } else {
      md += `RMS residual of ${result.totalRMS.toFixed(2)}′ is larger than typical. Review input data.\n\n`;
    }
  }

  // 11. Reproducibility
  md += `## 11. Reproducibility\n\n`;
  md += `This result was computed using FlerfyNav, a single-page React/TypeScript application `;
  md += `with no backend. All calculations run in the browser.\n\n`;
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
