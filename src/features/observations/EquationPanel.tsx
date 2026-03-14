import { useAppStore } from '../../store';
import { KatexBlock } from '../../components/KatexBlock';
import { CollapsibleSection } from '../../components/CollapsibleSection';

export function EquationPanel() {
  const { dataLoaded, settings, transformations, dataset } = useAppStore();

  if (!dataLoaded) return null;

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-600 mb-4">
          The Core Idea
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Each star altitude measurement creates a geometric constraint. The sine of the observed
          altitude equals the dot product of two unit vectors: the star's direction and the
          observer's local vertical.
        </p>

        {settings.showSymbolic && (
          <div className="bg-gray-50 rounded-lg p-6 mb-4 text-center">
            <KatexBlock
              math={"\\hat{\\mathbf{s}} \\cdot \\hat{\\mathbf{v}} = \\sin(h_c)"}
            />
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p><KatexBlock math={"\\hat{\\mathbf{s}}"} display={false} /> = star unit vector in Earth-fixed frame</p>
              <p><KatexBlock math={"\\hat{\\mathbf{v}}"} display={false} /> = observer&apos;s local vertical unit vector (unknown)</p>
              <p><KatexBlock math={"h_c"} display={false} /> = corrected observed altitude</p>
            </div>
          </div>
        )}

        <p className="text-gray-500 text-sm leading-relaxed">
          With three star observations, we get three such equations &mdash; enough to solve for
          the two unknowns (latitude and longitude) with one degree of freedom for checking
          consistency.
        </p>
      </div>

      {settings.showNumeric && transformations.length > 0 && (
        <CollapsibleSection title="Numeric Substitution" defaultOpen={true}>
          <div className="space-y-4">
            {transformations.map((t) => (
              <div key={t.starName} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-navy-700 mb-2">{t.starName}</p>
                <div className="text-center">
                  <KatexBlock
                    math={`\\begin{pmatrix} ${t.starUnitVector.x.toFixed(4)} \\\\ ${t.starUnitVector.y.toFixed(4)} \\\\ ${t.starUnitVector.z.toFixed(4)} \\end{pmatrix} \\cdot \\hat{\\mathbf{v}} = ${t.targetDotProduct.toFixed(6)}`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  sin({t.correctedAltitudeDeg.toFixed(4)}&deg;) = {t.targetDotProduct.toFixed(6)}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {settings.advancedDetail && (
        <CollapsibleSection title="Solver Method Detail" defaultOpen={false}>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              The solver uses iterative Gauss-Newton least-squares optimization to find the
              observer position (lat, lon) that minimizes the sum of squared residuals:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <KatexBlock
                math={"\\min_{\\phi, \\lambda} \\sum_{i=1}^{3} \\left[ \\arcsin(\\hat{\\mathbf{s}}_i \\cdot \\hat{\\mathbf{v}}(\\phi, \\lambda)) - h_{c,i} \\right]^2"}
              />
            </div>
            <p>
              The Jacobian is computed numerically (finite differences). The normal equations
              are solved directly for the 2&times;2 system. Convergence is typically achieved
              within 10-20 iterations.
            </p>
            {settings.useMotion && (
              <p className="text-amber-700 bg-amber-50 p-3 rounded-lg">
                Motion mode: The observer vertical vector is adjusted for each observation based
                on elapsed time, speed ({dataset.environment.speedKnots} kn),
                and bearing ({dataset.environment.trueBearing}&deg;T).
              </p>
            )}
          </div>
        </CollapsibleSection>
      )}
    </section>
  );
}
