import { create } from 'zustand';
import {
  AppSettings,
  ChallengeDataset,
  CorrectionBreakdown,
  SolverResult,
  TransformedObservation,
} from '../types';
import { CHALLENGE_DATASET_V2 } from '../features/challengeData';
import { applyCorrections } from '../domain/corrections';
import { buildTransformedObservations } from '../domain/transformations';
import { solve } from '../features/solver';

interface AppState {
  // Data
  dataset: ChallengeDataset;
  dataLoaded: boolean;

  // Settings
  settings: AppSettings;

  // Computed
  corrections: CorrectionBreakdown[];
  transformations: TransformedObservation[];
  result: SolverResult | null;
  solved: boolean;

  // Actions
  loadChallengeData: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  runSolver: () => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  showSymbolic: true,
  showNumeric: false,
  advancedDetail: false,
  useMotion: false,
  useCorrections: true,
};

function computeCorrections(dataset: ChallengeDataset, useCorrections: boolean): CorrectionBreakdown[] {
  return dataset.observations.map((obs) =>
    applyCorrections(obs, dataset.environment, useCorrections)
  );
}

function computeTransformations(
  dataset: ChallengeDataset,
  corrections: CorrectionBreakdown[],
  useMotion: boolean
): TransformedObservation[] {
  return buildTransformedObservations(
    dataset.observations,
    corrections,
    dataset.environment,
    useMotion
  );
}

export const useAppStore = create<AppState>((set, get) => ({
  dataset: CHALLENGE_DATASET_V2,
  dataLoaded: false,
  settings: DEFAULT_SETTINGS,
  corrections: [],
  transformations: [],
  result: null,
  solved: false,

  loadChallengeData: () => {
    const dataset = CHALLENGE_DATASET_V2;
    const settings = get().settings;
    const corrections = computeCorrections(dataset, settings.useCorrections);
    const transformations = computeTransformations(dataset, corrections, settings.useMotion);

    const result = solve(transformations, {
      useMotion: settings.useMotion,
      useCorrections: settings.useCorrections,
    });

    set({
      dataset,
      dataLoaded: true,
      corrections,
      transformations,
      result,
      solved: true,
    });
  },

  updateSettings: (partial) => {
    const prev = get();
    const settings = { ...prev.settings, ...partial };

    const corrections = computeCorrections(prev.dataset, settings.useCorrections);
    const transformations = computeTransformations(prev.dataset, corrections, settings.useMotion);

    // Re-run solver if previously solved and corrections/motion changed
    let result = prev.result;
    let solved = prev.solved;
    if (solved && (partial.useCorrections !== undefined || partial.useMotion !== undefined)) {
      result = solve(transformations, {
        useMotion: settings.useMotion,
        useCorrections: settings.useCorrections,
      });
    }

    set({ settings, corrections, transformations, result, solved });
  },

  runSolver: () => {
    const { transformations, settings } = get();
    if (transformations.length === 0) return;

    const result = solve(transformations, {
      useMotion: settings.useMotion,
      useCorrections: settings.useCorrections,
    });

    set({ result, solved: true });
  },

  reset: () => {
    set({
      dataLoaded: false,
      corrections: [],
      transformations: [],
      result: null,
      solved: false,
      settings: DEFAULT_SETTINGS,
    });
  },
}));
