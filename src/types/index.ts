export interface Observation {
  starName: string;
  utcTime: string;
  rawAltitude: { degrees: number; minutes: number };
  correctedAltitude?: number;
  corrections?: CorrectionBreakdown;
}

export interface CorrectionBreakdown {
  indexCorrection: number;
  dipCorrection: number;
  refractionCorrection: number;
  totalCorrection: number;
  rawAltitudeDeg: number;
  correctedAltitudeDeg: number;
}

export interface EnvironmentConfig {
  date: string;
  eyeHeightMeters: number;
  indexErrorArcmin: number;
  trueBearing: number;
  speedKnots: number;
  temperatureC: number;
  pressureMb: number;
  instrument: string;
  method: string;
}

export interface ChallengeDataset {
  id: string;
  label: string;
  environment: EnvironmentConfig;
  observations: Observation[];
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface StarData {
  name: string;
  ra: number;
  dec: number;
  unitVector: Vec3;
}

export interface TransformedObservation {
  starName: string;
  starUnitVector: Vec3;
  correctedAltitudeDeg: number;
  targetDotProduct: number;
  utcTime: string;
  elapsedSeconds: number;
  displacement?: Vec3;
}

export interface SolverConfig {
  useMotion: boolean;
  useCorrections: boolean;
  maxIterations: number;
  tolerance: number;
}

export interface SolverResult {
  estimatedLat: number;
  estimatedLon: number;
  residuals: StarResidual[];
  totalRMS: number;
  iterations: number;
  converged: boolean;
  motionIncluded: boolean;
  localVertical: Vec3;
  warnings: string[];
}

export interface StarResidual {
  starName: string;
  expectedDot: number;
  computedDot: number;
  residualArcmin: number;
}

export interface AppSettings {
  showSymbolic: boolean;
  showNumeric: boolean;
  advancedDetail: boolean;
  useMotion: boolean;
  useCorrections: boolean;
}

export interface ExportState {
  dataset: ChallengeDataset;
  settings: AppSettings;
  corrections: CorrectionBreakdown[];
  transformations: TransformedObservation[];
  result: SolverResult | null;
  constants: Record<string, { value: number; description: string; source: string }>;
}
