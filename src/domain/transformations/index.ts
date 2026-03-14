import { StarData, TransformedObservation, CorrectionBreakdown, Observation, EnvironmentConfig } from '../../types';
import { raDecToUnitVec } from '../vectors';
import { degToRad, parseTimeToSeconds, timeDeltaSeconds } from '../math/angles';
import { computeMotionDisplacement } from '../motion';

/**
 * Star catalog data for the challenge observations.
 *
 * Source: Nautical Almanac 2018 daily pages.
 * SHA and Dec are epoch-of-date values for 2018-11-15.
 *
 * Transformation pipeline:
 * 1. Start with star SHA, Dec from almanac
 * 2. Compute GHA_Aries at observation time
 * 3. Star GHA = GHA_Aries + SHA
 * 4. Convert (GHA, Dec) to unit vector in Earth-fixed frame
 */
export const STAR_CATALOG: Record<string, StarData> = {
  Regulus: {
    name: 'Regulus',
    ra: 360 - 207.6433,
    dec: 11.875,
    unitVector: raDecToUnitVec(360 - 207.6433, 11.875),
  },
  Arcturus: {
    name: 'Arcturus',
    ra: 360 - 145.8383,
    dec: 19.085,
    unitVector: raDecToUnitVec(360 - 145.8383, 19.085),
  },
  Dubhe: {
    name: 'Dubhe',
    ra: 360 - 193.7417,
    dec: 61.6583,
    unitVector: raDecToUnitVec(360 - 193.7417, 61.6583),
  },
};

/**
 * GHA of Aries for 2018-11-15 at 08h UTC.
 * From Nautical Almanac: GHA Aries 08h = ~232 deg 25.6'
 * Rate: ~15.0411 deg/hr (sidereal rotation rate)
 */
const GHA_ARIES_08H = 232 + 25.6 / 60;
const GHA_ARIES_RATE = 15.04107;

export function getGHAAries(utcTime: string): number {
  const secs = parseTimeToSeconds(utcTime);
  const hoursSince08 = (secs - 8 * 3600) / 3600;
  return (GHA_ARIES_08H + hoursSince08 * GHA_ARIES_RATE) % 360;
}

export function starVectorAtTime(star: StarData, utcTime: string): { x: number; y: number; z: number } {
  const ghaAries = getGHAAries(utcTime);
  const sha = 360 - star.ra;
  const gha = (ghaAries + sha) % 360;

  const dec = degToRad(star.dec);
  const lon = degToRad(-gha);

  return {
    x: Math.cos(dec) * Math.cos(lon),
    y: Math.cos(dec) * Math.sin(lon),
    z: Math.sin(dec),
  };
}

export function buildTransformedObservations(
  observations: Observation[],
  corrections: CorrectionBreakdown[],
  env: EnvironmentConfig,
  useMotion: boolean
): TransformedObservation[] {
  const baseTime = observations[0].utcTime;

  return observations.map((obs, i) => {
    const star = STAR_CATALOG[obs.starName];
    if (!star) throw new Error(`Unknown star: ${obs.starName}`);

    const correctedAlt = corrections[i].correctedAltitudeDeg;
    const elapsedSec = timeDeltaSeconds(baseTime, obs.utcTime);
    const starUnitVec = starVectorAtTime(star, obs.utcTime);

    let displacement;
    if (useMotion && elapsedSec > 0) {
      displacement = computeMotionDisplacement(
        env.speedKnots,
        env.trueBearing,
        elapsedSec
      );
    }

    return {
      starName: obs.starName,
      starUnitVector: starUnitVec,
      correctedAltitudeDeg: correctedAlt,
      targetDotProduct: Math.sin(degToRad(correctedAlt)),
      utcTime: obs.utcTime,
      elapsedSeconds: elapsedSec,
      displacement,
    };
  });
}
