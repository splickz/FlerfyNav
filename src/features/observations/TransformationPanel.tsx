import { useAppStore } from '../../store';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { STAR_CATALOG } from '../../domain/transformations';
import { formatTimeDelta } from '../../domain/formatting';

export function TransformationPanel() {
  const { dataLoaded, transformations, settings, dataset } = useAppStore();

  if (!dataLoaded || transformations.length === 0) return null;

  return (
    <CollapsibleSection title="Source Data & Transformation" defaultOpen={false} badge="Critical">
      <div className="space-y-5 text-sm text-gray-600">
        <div>
          <p className="font-medium text-navy-700 mb-2">Source Star Data</p>
          <p className="text-xs text-gray-500 mb-3">
            Star positions from the Nautical Almanac 2018 daily pages. SHA (Sidereal Hour Angle)
            and Declination are epoch-of-date values.
          </p>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Star</th>
                  <th className="text-right px-3 py-2">RA (&deg;)</th>
                  <th className="text-right px-3 py-2">Dec (&deg;)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(STAR_CATALOG).map((star) => (
                  <tr key={star.name} className="border-t border-gray-200">
                    <td className="px-3 py-2 font-medium text-navy-700">{star.name}</td>
                    <td className="px-3 py-2 text-right font-mono">{star.ra.toFixed(4)}</td>
                    <td className="px-3 py-2 text-right font-mono">{star.dec.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Transformation Pipeline</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
            <li>Start with star SHA and Dec from the Nautical Almanac for {dataset.environment.date}</li>
            <li>Compute GHA Aries at each observation time using the hourly table + interpolation rate</li>
            <li>Star GHA = GHA_Aries + SHA</li>
            <li>Convert (GHA, Dec) to unit vector: (cos(Dec)&middot;cos(&minus;GHA), cos(Dec)&middot;sin(&minus;GHA), sin(Dec))</li>
          </ol>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Transformed Star Vectors</p>
          <p className="text-xs text-gray-500 mb-3">
            Unit vectors in the Earth-fixed frame at each observation time.
          </p>
          <div className="space-y-3">
            {transformations.map((t) => (
              <div key={t.starName} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-navy-700">{t.starName}</span>
                  <span className="text-xs text-gray-400 font-mono">{t.utcTime} GMT</span>
                </div>
                <div className="font-mono text-xs text-gray-600">
                  <span className="text-gray-400">s&#x0302; = </span>
                  ({t.starUnitVector.x.toFixed(6)}, {t.starUnitVector.y.toFixed(6)}, {t.starUnitVector.z.toFixed(6)})
                </div>
                <div className="font-mono text-xs text-gray-600 mt-0.5">
                  <span className="text-gray-400">target dot = </span>
                  sin({t.correctedAltitudeDeg.toFixed(4)}&deg;) = {t.targetDotProduct.toFixed(6)}
                </div>
                {t.elapsedSeconds > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    &Delta;t = {formatTimeDelta(t.elapsedSeconds)} from first observation
                    {settings.useMotion && t.displacement && (
                      <span className="ml-2">
                        | displacement: E {t.displacement.x.toFixed(4)} NM, N {t.displacement.y.toFixed(4)} NM
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700">
          <strong>Transparency note:</strong> The transformation from Nautical Almanac data to
          working unit vectors is fully described above. The GHA Aries rate (15.04107&deg;/hr) is
          the sidereal rotation rate. All intermediate values are available in the JSON export.
        </div>
      </div>
    </CollapsibleSection>
  );
}
