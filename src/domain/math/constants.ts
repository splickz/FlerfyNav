export const CONSTANTS = {
  EARTH_RADIUS_NM: {
    value: 3440.065,
    description: 'Mean radius of Earth in nautical miles',
    source: 'WGS-84 mean radius 6371.0088 km / 1.852 km per NM',
  },
  EARTH_RADIUS_KM: {
    value: 6371.0088,
    description: 'WGS-84 mean radius of Earth in kilometers',
    source: 'WGS-84 standard',
  },
  DEG_TO_RAD: {
    value: Math.PI / 180,
    description: 'Conversion factor from degrees to radians',
    source: 'Mathematical constant: pi/180',
  },
  RAD_TO_DEG: {
    value: 180 / Math.PI,
    description: 'Conversion factor from radians to degrees',
    source: 'Mathematical constant: 180/pi',
  },
  ARCMIN_TO_DEG: {
    value: 1 / 60,
    description: 'Conversion factor from arcminutes to degrees',
    source: 'Definition: 1 arcminute = 1/60 degree',
  },
  NM_PER_KNOT_SECOND: {
    value: 1 / 3600,
    description: 'Nautical miles traveled per second at 1 knot',
    source: 'Definition: 1 knot = 1 NM/hour = 1/3600 NM/s',
  },
  STANDARD_REFRACTION_A: {
    value: 1.02,
    description: 'Coefficient A in Bennett refraction formula',
    source: 'Bennett 1982 refraction formula',
  },
  STANDARD_REFRACTION_B: {
    value: 10.3,
    description: 'Coefficient B in Bennett refraction formula',
    source: 'Bennett 1982 refraction formula',
  },
  STANDARD_REFRACTION_C: {
    value: 5.11,
    description: 'Coefficient C in Bennett refraction formula',
    source: 'Bennett 1982 refraction formula',
  },
  STANDARD_TEMPERATURE_C: {
    value: 10,
    description: 'Standard temperature for refraction adjustment (Celsius)',
    source: 'Standard atmosphere reference',
  },
  STANDARD_PRESSURE_MB: {
    value: 1010,
    description: 'Standard pressure for refraction adjustment (millibars)',
    source: 'Standard atmosphere reference',
  },
  DIP_COEFFICIENT: {
    value: 1.758,
    description: 'Dip correction coefficient: dip = coeff * sqrt(height_m) arcminutes',
    source: 'Standard dip formula with terrestrial refraction coefficient ~0.8315',
  },
} as const;

export type ConstantKey = keyof typeof CONSTANTS;
