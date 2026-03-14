import { useAppStore } from '../../store';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { KatexBlock } from '../../components/KatexBlock';

export function CorrectionBreakdownPanel() {
  const { dataLoaded, settings } = useAppStore();

  if (!dataLoaded || !settings.useCorrections) return null;

  return (
    <CollapsibleSection title="Correction Formulas" defaultOpen={false} badge="Transparent">
      <div className="text-sm text-gray-600 space-y-4">
        <div>
          <p className="font-medium text-navy-700 mb-1">Index Correction</p>
          <p className="text-xs text-gray-500 mb-2">
            The sextant&apos;s index error is a constant offset applied to every reading.
          </p>
          <div className="bg-gray-50 rounded p-3 text-center">
            <KatexBlock math={"\\text{IC} = -\\text{IE}"} display={false} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            For IE = +0.3&prime;, IC = &minus;0.3&prime;
          </p>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-1">Dip Correction</p>
          <p className="text-xs text-gray-500 mb-2">
            Accounts for the observer&apos;s eye being above the waterline. The visible horizon
            is depressed below the geometric horizon.
          </p>
          <div className="bg-gray-50 rounded p-3 text-center">
            <KatexBlock math={"\\text{Dip} = -1.758 \\sqrt{h_{\\text{eye}}}"} display={false} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            where h_eye is in meters, result is in arcminutes. Coefficient 1.758 derives from
            geometric dip adjusted for standard terrestrial refraction.
          </p>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-1">Atmospheric Refraction</p>
          <p className="text-xs text-gray-500 mb-2">
            Light bends as it passes through the atmosphere. The Bennett (1982) formula
            gives the refraction at standard conditions, then adjusts for actual T and P.
          </p>
          <div className="bg-gray-50 rounded p-3 text-center">
            <KatexBlock
              math={"R_0 = \\frac{1.02}{\\tan\\!\\left(h + \\frac{10.3}{h + 5.11}\\right)}"}
              display={false}
            />
          </div>
          <div className="bg-gray-50 rounded p-3 mt-2 text-center">
            <KatexBlock
              math={"R = R_0 \\cdot \\frac{P}{1010} \\cdot \\frac{283.15}{T + 273.15}"}
              display={false}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            h in degrees, R in arcminutes. Standard conditions: P=1010 mb, T=10&deg;C.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
