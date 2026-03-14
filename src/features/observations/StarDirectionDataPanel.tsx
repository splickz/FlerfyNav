import { useAppStore } from '../../store';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { KatexBlock } from '../../components/KatexBlock';
import { STAR_CATALOG } from '../../domain/transformations';

export function StarDirectionDataPanel() {
  const { dataLoaded, transformations, dataset } = useAppStore();

  if (!dataLoaded || transformations.length === 0) return null;

  return (
    <CollapsibleSection title="Star Direction Data: Source & Assumptions" defaultOpen={false} badge="Methodology">
      <div className="space-y-5 text-sm text-gray-600">
        <div>
          <p className="font-medium text-navy-700 mb-2">Data Source</p>
          <p className="text-xs text-gray-500">
            Star positions are taken from the <strong>Nautical Almanac 2018</strong> daily pages
            for {dataset.environment.date}. Each star is listed with its Sidereal Hour Angle (SHA)
            and Declination (Dec), which are epoch-of-date values already corrected for precession
            and nutation.
          </p>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Raw Source Coordinates</p>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Star</th>
                  <th className="text-right px-3 py-2">SHA (&deg;)</th>
                  <th className="text-right px-3 py-2">Dec (&deg;)</th>
                  <th className="text-right px-3 py-2">RA (&deg;)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(STAR_CATALOG).map((star) => {
                  const sha = 360 - star.ra;
                  return (
                    <tr key={star.name} className="border-t border-gray-200">
                      <td className="px-3 py-2 font-medium text-navy-700">{star.name}</td>
                      <td className="px-3 py-2 text-right font-mono">{sha.toFixed(4)}</td>
                      <td className="px-3 py-2 text-right font-mono">{star.dec.toFixed(4)}</td>
                      <td className="px-3 py-2 text-right font-mono">{star.ra.toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Transformation Pipeline</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-600 justify-center">
              <span className="bg-white px-2 py-1 rounded border border-gray-200">SHA, Dec</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="bg-white px-2 py-1 rounded border border-gray-200">GHA = GHA<sub>Aries</sub> + SHA</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="bg-white px-2 py-1 rounded border border-gray-200">GHA, Dec</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="bg-sky-50 px-2 py-1 rounded border border-sky-200 text-sky-700">Earth-fixed unit vector <strong>&sdot;</strong></span>
            </div>
            <div className="mt-3 text-center">
              <KatexBlock
                math={"\\hat{\\mathbf{s}} = \\begin{pmatrix} \\cos(\\delta)\\cos(-\\text{GHA}) \\\\ \\cos(\\delta)\\sin(-\\text{GHA}) \\\\ \\sin(\\delta) \\end{pmatrix}"}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            GHA Aries at 08h UTC = 232&deg;25.6&prime;. Interpolation rate = 15.04107&deg;/hr (sidereal rotation).
          </p>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Final Normalized Star Vectors</p>
          <div className="space-y-2">
            {transformations.map((t) => (
              <div key={t.starName} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-navy-700 text-xs">{t.starName}</span>
                  <span className="text-xs text-gray-400 font-mono">{t.utcTime} UTC</span>
                </div>
                <div className="font-mono text-xs text-gray-600">
                  <KatexBlock
                    math={`\\hat{\\mathbf{s}}_{\\text{${t.starName}}} = (${t.starUnitVector.x.toFixed(6)},\\; ${t.starUnitVector.y.toFixed(6)},\\; ${t.starUnitVector.z.toFixed(6)})`}
                    display={false}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  |&sdot;| = {Math.sqrt(
                    t.starUnitVector.x ** 2 + t.starUnitVector.y ** 2 + t.starUnitVector.z ** 2
                  ).toFixed(9)} (unit vector check)
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700">
          <strong>Assumptions:</strong> (1) Star positions from the Nautical Almanac are treated as exact
          for this date. (2) The GHA Aries interpolation uses a constant sidereal rate over the observation
          window (~4 min), which is accurate to sub-arcsecond level. (3) Proper motion and aberration are
          already folded into the almanac&apos;s epoch-of-date values.
        </div>
      </div>
    </CollapsibleSection>
  );
}
