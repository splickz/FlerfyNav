import { useAppStore } from '../../store';
import { CollapsibleSection } from '../../components/CollapsibleSection';

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-4 h-4 rounded flex items-center justify-center text-white ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}>
        {checked ? '\u2713' : '\u00B7'}
      </span>
      <span className={checked ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
    </div>
  );
}

export function ReproducibilityChecklist() {
  const { dataLoaded, solved, settings, transformations, corrections } = useAppStore();

  if (!dataLoaded) return null;

  const hasCorrections = corrections.length > 0;
  const hasTransformations = transformations.length > 0;

  const items = [
    { checked: dataLoaded, label: 'Challenge dataset loaded' },
    { checked: hasCorrections && settings.useCorrections, label: 'Correction formulas shown with all constants' },
    { checked: hasTransformations, label: 'Source star data and coordinates displayed' },
    { checked: hasTransformations, label: 'Transformation pipeline steps documented' },
    { checked: true, label: 'Solver constraint equations shown' },
    { checked: !!solved, label: 'Residual validation computed' },
    { checked: !!solved, label: 'JSON/Markdown export available' },
  ];

  const total = items.length;
  const done = items.filter((i) => i.checked).length;

  return (
    <CollapsibleSection title="Reproducibility Checklist" defaultOpen={false}>
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 rounded-full h-2 transition-all"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500">{done}/{total}</span>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <CheckItem key={i} checked={item.checked} label={item.label} />
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          All inputs, formulas, constants, and intermediate results are shown in the sections above.
          The full computation state can be exported as JSON for independent verification.
        </p>
      </div>
    </CollapsibleSection>
  );
}
