import { useAppStore } from '../../store';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { KatexBlock } from '../../components/KatexBlock';
import { CONSTANTS } from '../../domain/math/constants';

export function LightPathPanel() {
  const { dataLoaded, settings } = useAppStore();

  if (!dataLoaded) return null;

  return (
    <CollapsibleSection title="Light Path Assumptions" defaultOpen={false} badge="Methodology">
      <div className="space-y-5 text-sm text-gray-600">
        <div>
          <p className="font-medium text-navy-700 mb-2">Physical Model</p>
          <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
            <li>Light travels in straight lines from distant stars to the observer</li>
            <li>The sextant measures the angle between the incoming light ray and the visible sea horizon</li>
            <li>Atmospheric refraction bends light downward near the horizon, making stars appear slightly higher than their geometric position</li>
            <li>This bending is modeled as a correction subtracted from the observed altitude when corrections are enabled</li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Full Correction Chain</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-600 justify-center">
              <span className="bg-white px-2 py-1 rounded border border-gray-200">H<sub>s</sub> (observed)</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="bg-white px-2 py-1 rounded border border-amber-200">&minus; IE</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="bg-white px-2 py-1 rounded border border-amber-200">&minus; Dip</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="bg-white px-2 py-1 rounded border border-amber-200">&minus; Refraction</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="bg-sky-50 px-2 py-1 rounded border border-sky-200 text-sky-700">H<sub>c</sub> (corrected)</span>
            </div>
            <div className="mt-3 text-center">
              <KatexBlock
                math={"h_c = H_s + \\text{IC} + \\text{Dip} + R"}
                display={false}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              IC and Dip are negative corrections; refraction R is subtracted (also negative).
            </p>
          </div>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Correction Formulas & Constants</p>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-navy-700 mb-1">Index Correction</p>
              <KatexBlock math={"\\text{IC} = -\\text{IE}"} display={false} />
              <p className="text-xs text-gray-400 mt-1">IE = instrument index error in arcminutes</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-navy-700 mb-1">Dip Correction</p>
              <KatexBlock math={"\\text{Dip} = -1.758 \\cdot \\sqrt{h_{\\text{eye}}}"} display={false} />
              <p className="text-xs text-gray-400 mt-1">
                h<sub>eye</sub> in meters, result in arcminutes. Coefficient {CONSTANTS.DIP_COEFFICIENT.value} accounts
                for geometric dip adjusted by standard terrestrial refraction (~0.8315).
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-navy-700 mb-1">Atmospheric Refraction (Bennett 1982)</p>
              <KatexBlock
                math={"R_0 = \\frac{1.02}{\\tan\\!\\left(h + \\frac{10.3}{h + 5.11}\\right)}"}
                display={false}
              />
              <KatexBlock
                math={"R = R_0 \\cdot \\frac{P}{1010} \\cdot \\frac{283.15}{T + 273.15}"}
                display={false}
                className="mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">h in degrees, R in arcminutes.</p>
            </div>
          </div>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Constants Used in Correction Formulas</p>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Constant</th>
                  <th className="text-right px-3 py-2">Value</th>
                  <th className="text-left px-3 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(CONSTANTS) as [string, { value: number; description: string; source: string }][]).map(([key, c]) => (
                  <tr key={key} className="border-t border-gray-200">
                    <td className="px-3 py-2 font-mono text-navy-700">{key}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {Number.isInteger(c.value) ? c.value : c.value.toPrecision(6)}
                    </td>
                    <td className="px-3 py-2 text-gray-500">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-500">
          <strong>Status:</strong> Corrections are currently <strong>{settings.useCorrections ? 'enabled' : 'disabled'}</strong>.
          {!settings.useCorrections && ' The solver is using raw sextant altitudes with no correction applied.'}
        </div>
      </div>
    </CollapsibleSection>
  );
}
