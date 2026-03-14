import { useAppStore } from '../../store';

export function HeroPanel() {
  const { dataLoaded, loadChallengeData, dataset } = useAppStore();

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">
          Celestial Navigation as Vector Geometry
        </h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          When you measure a star's altitude with a sextant, you're measuring the angle between the
          star's direction and your local horizon. This angle can be expressed as a{' '}
          <strong className="text-navy-700">dot product</strong> between two unit vectors: the star's
          direction and your local vertical. The math framework — vectors and dot products — is
          general-purpose linear algebra, not exclusive to any particular geometric model.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          This app demonstrates that relationship interactively, supports the{' '}
          <a href="https://mctoon.net/10ksextantv2/" target="_blank" rel="noopener noreferrer"
            className="text-sky-600 hover:underline">
            MCToon $10K Sextant Challenge v2
          </a>{' '}
          submission, and makes every calculation transparent and reproducible.
        </p>

        <div className="flex items-center gap-4">
          {!dataLoaded ? (
            <button
              onClick={loadChallengeData}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              Load Challenge Data
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Challenge data loaded</span>
            </div>
          )}
        </div>

        {dataLoaded && (
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>Date: <strong className="text-navy-700">{dataset.environment.date}</strong></span>
            <span>Stars: <strong className="text-navy-700">{dataset.observations.length}</strong></span>
            <span>Eye height: <strong className="text-navy-700">{dataset.environment.eyeHeightMeters}m</strong></span>
            <span>Speed: <strong className="text-navy-700">{dataset.environment.speedKnots} kn</strong></span>
          </div>
        )}
      </div>
    </section>
  );
}
