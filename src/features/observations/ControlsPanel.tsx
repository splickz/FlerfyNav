import { useAppStore } from '../../store';
import { ToggleRow } from '../../components/ToggleRow';

export function ControlsPanel() {
  const { settings, updateSettings, runSolver, reset, dataLoaded, solved } = useAppStore();

  if (!dataLoaded) return null;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-600 mb-4">Controls</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <ToggleRow
            label="Apply Corrections"
            description="Index error, dip, and atmospheric refraction"
            checked={settings.useCorrections}
            onChange={(v) => updateSettings({ useCorrections: v })}
          />
          <ToggleRow
            label="Moving Observer"
            description="Account for vessel motion between observations"
            checked={settings.useMotion}
            onChange={(v) => updateSettings({ useMotion: v })}
          />
        </div>

        <div className="space-y-1">
          <ToggleRow
            label="Symbolic Equations"
            description="Show equations in symbolic form"
            checked={settings.showSymbolic}
            onChange={(v) => updateSettings({ showSymbolic: v })}
          />
          <ToggleRow
            label="Numeric Substitution"
            description="Show equations with actual values"
            checked={settings.showNumeric}
            onChange={(v) => updateSettings({ showNumeric: v })}
          />
          <ToggleRow
            label="Advanced Detail"
            description="Show derivations and intermediate values"
            checked={settings.advancedDetail}
            onChange={(v) => updateSettings({ advancedDetail: v })}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={runSolver}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          {solved ? 'Re-solve' : 'Solve for Position'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
