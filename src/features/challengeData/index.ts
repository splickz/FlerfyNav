import { ChallengeDataset } from '../../types';

/**
 * MCToon $10,000 Sextant Challenge v2 — Published First Dataset
 *
 * Source: https://mctoon.net/10ksextantv2/
 * Date retrieved: 2026-03-15
 *
 * IMPORTANT: This dataset can change when no active submission is in progress.
 * Keep it in this single module for easy updating.
 */
export const CHALLENGE_DATASET_V2: ChallengeDataset = {
  id: 'mctoon-10k-v2-set1',
  label: 'MCToon 10K Sextant Challenge v2 — Published Set 1',
  environment: {
    date: '2018-11-15',
    eyeHeightMeters: 2,
    indexErrorArcmin: 0.3, // +0.3′
    trueBearing: 0, // degrees (true north)
    speedKnots: 12,
    temperatureC: 12,
    pressureMb: 975,
    instrument: 'Sextant',
    method: 'Angle between star and horizon',
  },
  observations: [
    {
      starName: 'Regulus',
      utcTime: '08:28:15',
      rawAltitude: { degrees: 70, minutes: 48.7 },
    },
    {
      starName: 'Arcturus',
      utcTime: '08:30:30',
      rawAltitude: { degrees: 27, minutes: 9.0 },
    },
    {
      starName: 'Dubhe',
      utcTime: '08:32:15',
      rawAltitude: { degrees: 55, minutes: 18.4 },
    },
  ],
};
