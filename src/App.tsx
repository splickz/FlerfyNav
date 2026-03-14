import { AppShell } from './components/AppShell';
import { HeroPanel } from './features/observations/HeroPanel';
import { ControlsPanel } from './features/observations/ControlsPanel';
import { GeometryExplorer } from './features/geometry/GeometryExplorer';
import { ObservationCards } from './features/observations/ObservationCards';
import { EquationPanel } from './features/observations/EquationPanel';
import { CorrectionBreakdownPanel } from './features/observations/CorrectionBreakdownPanel';
import { TransformationPanel } from './features/observations/TransformationPanel';
import { ResultsPanel } from './features/solver/ResultsPanel';
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
      <ResultsPanel />
      <ExportPanel />
    </AppShell>
  );
}
