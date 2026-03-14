import { useAppStore } from '../../store';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { MetricCard } from '../../components/MetricCard';
import { formatArcmin } from '../../domain/formatting';

export function SolutionValidationPanel() {
  const { result, solved } = useAppStore();

  if (!solved || !result) return null;

  const maxResidual = Math.max(...result.residuals.map((r) => Math.abs(r.residualArcmin)));
  const allSmall = result.residuals.every((r) => Math.abs(r.residualArcmin) < 3);

  let fitInterpretation: string;
  if (result.totalRMS < 1) {
    fitInterpretation = 'Excellent internal consistency. Residuals are well within typical sextant precision (~1\u20322\u2032).';
  } else if (result.totalRMS < 2) {
    fitInterpretation = 'Good fit. Residuals are consistent with careful sextant observations (typical error ~1\u20322\u2032).';
  } else if (result.totalRMS < 5) {
    fitInterpretation = 'Acceptable fit. Residuals are within the range expected for practiced sextant use under field conditions.';
  } else {
    fitInterpretation = 'Residuals are larger than expected. This may indicate data entry error, incorrect star identification, or poor observing conditions.';
  }

  return (
    <CollapsibleSection title="Solution Validation" defaultOpen={true} badge="Results">
      <div className="space-y-4 text-sm text-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            label="RMS Residual"
            value={`${result.totalRMS.toFixed(2)}\u2032`}
            variant={result.totalRMS < 2 ? 'success' : result.totalRMS < 5 ? 'warning' : 'default'}
          />
          <MetricCard
            label="Max Residual"
            value={formatArcmin(maxResidual)}
            variant={maxResidual < 3 ? 'success' : 'warning'}
          />
          <MetricCard
            label="All < 3\u2032?"
            value={allSmall ? 'Yes' : 'No'}
            variant={allSmall ? 'success' : 'warning'}
          />
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Per-Star Residuals</p>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Star</th>
                  <th className="text-right px-3 py-2">Residual</th>
                  <th className="text-left px-3 py-2">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {result.residuals.map((r) => {
                  const abs = Math.abs(r.residualArcmin);
                  const assessment = abs < 1 ? 'Excellent' : abs < 2 ? 'Good' : abs < 5 ? 'Acceptable' : 'Check data';
                  return (
                    <tr key={r.starName} className="border-t border-gray-200">
                      <td className="px-3 py-2 font-medium text-navy-700">{r.starName}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        <span className={abs < 2 ? 'text-emerald-600' : abs < 5 ? 'text-amber-600' : 'text-red-600'}>
                          {formatArcmin(r.residualArcmin)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{assessment}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-sky-50 rounded-lg p-3 text-xs text-sky-800">
          <strong>Interpretation:</strong> {fitInterpretation}
        </div>

        <p className="text-xs text-gray-400">
          Sextant observations typically carry errors of 0.5&prime;&ndash;3&prime; due to horizon clarity,
          instrument precision, and observer skill. Residuals in this range indicate the observations are
          internally consistent with the geometric model.
        </p>
      </div>
    </CollapsibleSection>
  );
}
