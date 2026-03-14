import { useAppStore } from '../../store';
import { MetricCard } from '../../components/MetricCard';
import { formatDM } from '../../domain/math/angles';
import { formatArcmin } from '../../domain/formatting';

export function ResultsPanel() {
  const { result, solved } = useAppStore();

  if (!solved || !result) return null;

  return (
    <section className="bg-white rounded-xl border-2 border-indigo-200 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-4">
        Position Estimate
      </h3>

      {result.warnings.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {result.warnings.map((w, i) => (
            <p key={i} className="text-sm text-amber-700">{w}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Latitude"
          value={formatDM(result.estimatedLat, 'lat')}
          variant="info"
        />
        <MetricCard
          label="Longitude"
          value={formatDM(result.estimatedLon, 'lon')}
          variant="info"
        />
        <MetricCard
          label="RMS Residual"
          value={`${result.totalRMS.toFixed(2)}\u2032`}
          variant={result.totalRMS < 2 ? 'success' : result.totalRMS < 5 ? 'warning' : 'default'}
          sublabel={result.totalRMS < 2 ? 'Good fit' : result.totalRMS < 5 ? 'Acceptable' : 'Poor fit'}
        />
        <MetricCard
          label="Convergence"
          value={result.converged ? 'Yes' : 'No'}
          sublabel={`${result.iterations} iterations`}
          variant={result.converged ? 'success' : 'warning'}
        />
      </div>

      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        Per-Star Residuals
      </h4>
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-2">Star</th>
              <th className="text-right px-4 py-2">Expected dot</th>
              <th className="text-right px-4 py-2">Computed dot</th>
              <th className="text-right px-4 py-2">Residual</th>
            </tr>
          </thead>
          <tbody>
            {result.residuals.map((r) => (
              <tr key={r.starName} className="border-t border-gray-200">
                <td className="px-4 py-2 font-medium text-navy-700">{r.starName}</td>
                <td className="px-4 py-2 text-right font-mono text-gray-600">{r.expectedDot.toFixed(6)}</td>
                <td className="px-4 py-2 text-right font-mono text-gray-600">{r.computedDot.toFixed(6)}</td>
                <td className="px-4 py-2 text-right font-mono">
                  <span className={Math.abs(r.residualArcmin) < 2 ? 'text-emerald-600' : 'text-amber-600'}>
                    {formatArcmin(r.residualArcmin)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <span>Motion: {result.motionIncluded ? 'Included' : 'Stationary'}</span>
        <span>&middot;</span>
        <span>Decimal: {result.estimatedLat.toFixed(4)}&deg;, {result.estimatedLon.toFixed(4)}&deg;</span>
      </div>
    </section>
  );
}
