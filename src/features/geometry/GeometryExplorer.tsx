import { useMemo } from 'react';
import { useAppStore } from '../../store';
import { formatAngle } from '../../domain/math/angles';

/**
 * SVG-based visualization of the celestial navigation geometry.
 *
 * Shows:
 * - Observer position with local vertical
 * - Horizon line
 * - Star direction vectors
 * - Altitude angle arcs
 * - Optional motion track
 */

const WIDTH = 700;
const HEIGHT = 420;
const CX = WIDTH / 2;
const CY = HEIGHT - 80;
const HORIZON_Y = CY;
const VERTICAL_LENGTH = 200;
const STAR_RAY_LENGTH = 260;

interface StarVisual {
  name: string;
  altDeg: number;
  color: string;
  labelOffset: number;
}

const STAR_COLORS: Record<string, string> = {
  Regulus: '#6366f1',
  Arcturus: '#f59e0b',
  Dubhe: '#10b981',
};

function polarToXY(cx: number, cy: number, angleDeg: number, length: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + length * Math.cos(rad),
    y: cy - length * Math.sin(rad),
  };
}

function arcPath(cx: number, cy: number, startDeg: number, endDeg: number, radius: number) {
  const start = polarToXY(cx, cy, startDeg, radius);
  const end = polarToXY(cx, cy, endDeg, radius);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function GeometryExplorer() {
  const { dataLoaded, corrections, transformations, result, settings, dataset } = useAppStore();

  const stars: StarVisual[] = useMemo(() => {
    if (!dataLoaded || corrections.length === 0) return [];
    return dataset.observations.map((obs, i) => ({
      name: obs.starName,
      altDeg: corrections[i]?.correctedAltitudeDeg ?? (obs.rawAltitude.degrees + obs.rawAltitude.minutes / 60),
      color: STAR_COLORS[obs.starName] || '#6b7280',
      labelOffset: i * 20,
    }));
  }, [dataLoaded, corrections, dataset.observations]);

  if (!dataLoaded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Load challenge data to see the geometry visualization</p>
      </div>
    );
  }

  // Motion track visualization
  const motionPoints = settings.useMotion && transformations.length > 0
    ? transformations.map((t) => {
        const dx = t.displacement ? t.displacement.x * 800 : 0; // Scale for visibility
        const dy = t.displacement ? -t.displacement.y * 800 : 0;
        return { x: CX + dx, y: HORIZON_Y + dy, label: t.starName };
      })
    : null;

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-600 mb-4">
        Geometry Visualization
      </h3>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          style={{ maxHeight: '480px' }}
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c1445" />
              <stop offset="70%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#2d4a6f" />
            </linearGradient>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b5998" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0.1" />
            </linearGradient>
            {stars.map((s) => (
              <radialGradient key={`glow-${s.name}`} id={`glow-${s.name}`}>
                <stop offset="0%" stopColor={s.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Sky background */}
          <rect x="0" y="0" width={WIDTH} height={HORIZON_Y} fill="url(#skyGrad)" />

          {/* Below horizon */}
          <rect x="0" y={HORIZON_Y} width={WIDTH} height={HEIGHT - HORIZON_Y} fill="#f8fafc" />

          {/* Horizon line */}
          <line
            x1="0" y1={HORIZON_Y} x2={WIDTH} y2={HORIZON_Y}
            stroke="#64748b" strokeWidth="2"
          />
          <text x="20" y={HORIZON_Y - 8} fill="#94a3b8" fontSize="11" fontFamily="Inter">
            Horizon
          </text>

          {/* Vertical (zenith) arrow */}
          <line
            x1={CX} y1={HORIZON_Y} x2={CX} y2={HORIZON_Y - VERTICAL_LENGTH}
            stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="6 3"
          />
          <polygon
            points={`${CX},${HORIZON_Y - VERTICAL_LENGTH - 10} ${CX - 5},${HORIZON_Y - VERTICAL_LENGTH} ${CX + 5},${HORIZON_Y - VERTICAL_LENGTH}`}
            fill="#94a3b8"
          />
          <text
            x={CX + 10} y={HORIZON_Y - VERTICAL_LENGTH - 5}
            fill="#94a3b8" fontSize="11" fontFamily="Inter"
          >
            Local Vertical (v&#x0302;)
          </text>

          {/* Star rays, angle arcs, and labels */}
          {stars.map((star, i) => {
            const altClamped = Math.max(5, Math.min(85, star.altDeg));
            const endPt = polarToXY(CX, HORIZON_Y, altClamped, STAR_RAY_LENGTH);
            const arcRadius = 50 + i * 22;
            const labelPt = polarToXY(CX, HORIZON_Y, altClamped, STAR_RAY_LENGTH + 15);
            const arcMidAngle = altClamped / 2;
            const arcLabelPt = polarToXY(CX, HORIZON_Y, arcMidAngle, arcRadius + 14);

            return (
              <g key={star.name}>
                {/* Star ray line */}
                <line
                  x1={CX} y1={HORIZON_Y}
                  x2={endPt.x} y2={endPt.y}
                  stroke={star.color}
                  strokeWidth="2"
                  strokeOpacity="0.8"
                />

                {/* Star glow dot */}
                <circle cx={endPt.x} cy={endPt.y} r="12" fill={`url(#glow-${star.name})`} />
                <circle cx={endPt.x} cy={endPt.y} r="3" fill={star.color} />

                {/* Altitude arc from horizon to star */}
                <path
                  d={arcPath(CX, HORIZON_Y, 0, altClamped, arcRadius)}
                  fill="none"
                  stroke={star.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  strokeDasharray="4 2"
                />

                {/* Arc label */}
                <text
                  x={arcLabelPt.x}
                  y={arcLabelPt.y}
                  fill={star.color}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {formatAngle(star.altDeg)}
                </text>

                {/* Star name */}
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  fill={star.color}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Inter"
                  textAnchor={labelPt.x > CX ? 'start' : 'end'}
                >
                  {star.name}
                </text>
              </g>
            );
          })}

          {/* Observer marker */}
          <circle cx={CX} cy={HORIZON_Y} r="5" fill="#f8fafc" stroke="#334e68" strokeWidth="2" />
          <text
            x={CX} y={HORIZON_Y + 20}
            fill="#64748b" fontSize="11" fontFamily="Inter" textAnchor="middle"
          >
            Observer
          </text>

          {/* Motion track */}
          {motionPoints && motionPoints.length > 1 && (
            <g>
              {motionPoints.map((pt, i) => {
                if (i === 0) return null;
                const prev = motionPoints[i - 1];
                return (
                  <line
                    key={`motion-${i}`}
                    x1={prev.x} y1={prev.y - 3}
                    x2={pt.x} y2={pt.y - 3}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                    strokeOpacity="0.7"
                  />
                );
              })}
              {motionPoints.map((pt, i) => (
                <circle
                  key={`mpt-${i}`}
                  cx={pt.x} cy={pt.y - 3}
                  r="2.5"
                  fill={i === 0 ? '#f59e0b' : '#fbbf24'}
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
              ))}
              <text
                x={motionPoints[motionPoints.length - 1].x + 8}
                y={motionPoints[motionPoints.length - 1].y - 8}
                fill="#d97706" fontSize="9" fontFamily="Inter"
              >
                Motion track
              </text>
            </g>
          )}

          {/* Dot product annotation */}
          <g>
            <rect x="16" y={HEIGHT - 55} width="260" height="42" rx="6" fill="#f8fafc" stroke="#e2e8f0" />
            <text x="26" y={HEIGHT - 32} fill="#475569" fontSize="11" fontFamily="Inter">
              Each ray: <tspan fontFamily="JetBrains Mono, monospace" fill="#6366f1">dot(s&#x0302;, v&#x0302;) = sin(h)</tspan>
            </text>
          </g>

          {/* Result annotation if solved */}
          {result && (
            <g>
              <rect x={WIDTH - 230} y={HEIGHT - 55} width="214" height="42" rx="6" fill="#f0fdf4" stroke="#bbf7d0" />
              <text x={WIDTH - 220} y={HEIGHT - 36} fill="#166534" fontSize="10" fontFamily="JetBrains Mono, monospace">
                Fit: RMS {result.totalRMS.toFixed(2)}&apos; ({result.converged ? 'converged' : 'not converged'})
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}
