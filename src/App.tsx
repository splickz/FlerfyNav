import { AppShell } from './components/AppShell';
import { HeroPanel } from './features/observations/HeroPanel';
import { ControlsPanel } from './features/observations/ControlsPanel';
import { GeometryExplorer } from './features/geometry/GeometryExplorer';
import { ObservationCards } from './features/observations/ObservationCards';
import { EquationPanel } from './features/observations/EquationPanel';
import { CorrectionBreakdownPanel } from './features/observations/CorrectionBreakdownPanel';
import { TransformationPanel } from './features/observations/TransformationPanel';
import { StarDirectionDataPanel } from './features/observations/StarDirectionDataPanel';
import { LightPathPanel } from './features/observations/LightPathPanel';
import { GeometricModelPanel } from './features/observations/GeometricModelPanel';
import { ResultsPanel } from './features/solver/ResultsPanel';
import { SolutionValidationPanel } from './features/solver/SolutionValidationPanel';
import { ReproducibilityChecklist } from './features/observations/ReproducibilityChecklist';
import { ExportPanel } from './features/export/ExportPanel';

export default function App() {
  return (
    <AppShell>
      <HeroPanel />
      <ControlsPanel />
      <GeometryExplorer />
      <ObservationCards />
      <EquationPanel />
      <CorrectionBreakdownPanel />
      <TransformationPanel />
      <StarDirectionDataPanel />
      <LightPathPanel />
      <GeometricModelPanel />
      <ResultsPanel />
      <SolutionValidationPanel />
      <ReproducibilityChecklist />
      <ExportPanel />
    </AppShell>
  );
}
