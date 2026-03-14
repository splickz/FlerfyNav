import { ExportState } from '../../types';
import { CONSTANTS } from '../../domain/math/constants';
import { formatDM, formatAngle } from '../../domain/math/angles';
import { formatArcmin } from '../../domain/formatting';

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
  md += `## Settings Used\n\n`;
  md += `- **Corrections:** ${settings.useCorrections ? 'Enabled' : 'Disabled'}\n`;
  md += `- **Motion model:** ${settings.useMotion ? 'Moving observer' : 'Stationary observer'}\n\n`;

  // Observations & Corrections
  md += `## Observations\n\n`;
  md += `| Star | UTC | Raw Altitude | Index | Dip | Refraction | Corrected |\n`;
  md += `|------|-----|-------------|-------|-----|------------|----------|\n`;

  dataset.observations.forEach((obs, i) => {
    const c = corrections[i];
    md += `| ${obs.starName} | ${obs.utcTime} | ${obs.rawAltitude.degrees}°${obs.rawAltitude.minutes.toFixed(1)}′ `;
    md += `| ${formatArcmin(c.indexCorrection)} | ${formatArcmin(c.dipCorrection)} `;
    md += `| ${formatArcmin(c.refractionCorrection)} | ${formatAngle(c.correctedAltitudeDeg)} |\n`;
  });

  // Core Equation
  md += `\n## Core Equation\n\n`;
  md += `Each star observation constrains the observer position via:\n\n`;
  md += '```\n';
  md += `dot(ŝ, v̂) = sin(h_corrected)\n`;
  md += '```\n\n';
  md += `Where:\n`;
  md += `- **ŝ** = star unit vector in Earth-fixed frame at observation time\n`;
  md += `- **v̂** = observer's local vertical unit vector (unknown, to be solved)\n`;
  md += `- **h_corrected** = corrected observed altitude of the star\n\n`;
  md += `Three observations yield three constraint equations. The solver minimizes `;
  md += `the sum of squared residuals to find the best-fit observer position.\n\n`;

  // Transformation Notes
  md += `## Source Data Transformation\n\n`;
  md += `1. Star SHA and Dec from Nautical Almanac 2018 daily pages\n`;
  md += `2. GHA Aries at 08h UTC from hourly tables, interpolated to observation time\n`;
  md += `3. Star GHA = GHA_Aries + SHA\n`;
  md += `4. Unit vector computed as: (cos(Dec)·cos(-GHA), cos(Dec)·sin(-GHA), sin(Dec))\n\n`;

  md += `### Star Vectors Used\n\n`;
  transformations.forEach((t) => {
    const v = t.starUnitVector;
    md += `- **${t.starName}:** (${v.x.toFixed(6)}, ${v.y.toFixed(6)}, ${v.z.toFixed(6)}), `;
    md += `target dot = ${t.targetDotProduct.toFixed(6)}\n`;
  });

  // Constants
  md += `\n## Constants\n\n`;
  md += `| Name | Value | Description | Source |\n`;
  md += `|------|-------|-------------|--------|\n`;
  Object.entries(constants).forEach(([key, c]) => {
    md += `| ${key} | ${c.value} | ${c.description} | ${c.source} |\n`;
  });

  // Results
  if (result) {
    md += `\n## Result\n\n`;
    md += `- **Estimated position:** ${formatDM(result.estimatedLat, 'lat')}, ${formatDM(result.estimatedLon, 'lon')}\n`;
    md += `- **RMS residual:** ${result.totalRMS.toFixed(2)}′\n`;
    md += `- **Converged:** ${result.converged ? 'Yes' : 'No'} (${result.iterations} iterations)\n`;
    md += `- **Motion included:** ${result.motionIncluded ? 'Yes' : 'No'}\n\n`;

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
  }

  md += `\n## Reproducibility\n\n`;
  md += `This result was computed using the FlerfyNav, a single-page `;
  md += `React application with no backend. All calculations run in the browser using `;
  md += `modular TypeScript. The full computation state can be exported as JSON for `;
  md += `independent verification. All constants, formulas, and source data are `;
  md += `documented above.\n`;

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
