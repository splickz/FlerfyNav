import { useAppStore } from '../../store';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { KatexBlock } from '../../components/KatexBlock';

export function GeometricModelPanel() {
  const { dataLoaded, transformations } = useAppStore();

  if (!dataLoaded) return null;

  const n = transformations.length;

  return (
    <CollapsibleSection title="Geometric Model Used" defaultOpen={false} badge="Methodology">
      <div className="space-y-5 text-sm text-gray-600">
        <div>
          <p className="font-medium text-navy-700 mb-2">Unknowns</p>
          <p className="text-xs text-gray-500">
            The two unknowns are the observer&apos;s <strong>latitude</strong> (&phi;) and <strong>longitude</strong> (&lambda;).
            These define the observer&apos;s local vertical unit vector:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-2 text-center">
            <KatexBlock
              math={"\\hat{\\mathbf{v}}(\\phi, \\lambda) = \\begin{pmatrix} \\cos\\phi \\cos\\lambda \\\\ \\cos\\phi \\sin\\lambda \\\\ \\sin\\phi \\end{pmatrix}"}
            />
          </div>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Constraint Equation</p>
          <p className="text-xs text-gray-500 mb-2">
            Each star observation creates one scalar constraint. The dot product of the star&apos;s
            unit vector with the observer&apos;s local vertical equals the sine of the corrected altitude:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <KatexBlock
              math={"\\hat{\\mathbf{s}}_i \\cdot \\hat{\\mathbf{v}} = \\sin(h_{c,i})"}
            />
          </div>
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <p>
              <KatexBlock math={"\\hat{\\mathbf{s}}_i"} display={false} /> = unit vector pointing from Earth&apos;s
              center toward star <em>i</em> at the time of observation (known, computed from almanac data)
            </p>
            <p>
              <KatexBlock math={"\\hat{\\mathbf{v}}"} display={false} /> = unit vector from Earth&apos;s center
              through the observer&apos;s position (unknown, to be solved for)
            </p>
            <p>
              <KatexBlock math={"h_{c,i}"} display={false} /> = corrected observed altitude of star <em>i</em> (known,
              after applying index, dip, and refraction corrections)
            </p>
          </div>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Degrees of Freedom</p>
          <div className="bg-sky-50 rounded-lg p-3 text-xs text-sky-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{n}</p>
                <p>constraint equations</p>
              </div>
              <div>
                <p className="text-lg font-bold">2</p>
                <p>unknowns (&phi;, &lambda;)</p>
              </div>
              <div>
                <p className="text-lg font-bold">{n - 2}</p>
                <p>degrees of freedom</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            With {n} star observations and 2 unknowns, there {n - 2 === 1 ? 'is' : 'are'} {n - 2} degree{n - 2 !== 1 ? 's' : ''} of
            freedom available for residual checking. The system is over-determined, so the solver
            minimizes the sum of squared residuals using Gauss-Newton least squares.
          </p>
        </div>

        <div>
          <p className="font-medium text-navy-700 mb-2">Solver Objective</p>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <KatexBlock
              math={"\\min_{\\phi, \\lambda} \\sum_{i=1}^{" + n + "} \\left[ \\arcsin(\\hat{\\mathbf{s}}_i \\cdot \\hat{\\mathbf{v}}(\\phi, \\lambda)) - h_{c,i} \\right]^2"}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Initial guess via global grid search (10&deg; then 2&deg; refinement). Gauss-Newton iterations
            with damped line search until convergence.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
