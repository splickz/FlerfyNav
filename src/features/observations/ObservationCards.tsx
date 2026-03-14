import { useAppStore } from '../../store';
import { formatAngle } from '../../domain/math/angles';
import { formatArcmin } from '../../domain/formatting';

export function ObservationCards() {
  const { dataset, corrections, dataLoaded, settings } = useAppStore();

  if (!dataLoaded) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-600 mb-4">
        Observations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dataset.observations.map((obs, i) => {
          const corr = corrections[i];
          const starColors: Record<string, string> = {
            Regulus: 'from-blue-500 to-indigo-500',
            Arcturus: 'from-amber-500 to-orange-500',
            Dubhe: 'from-emerald-500 to-teal-500',
          };
          const gradient = starColors[obs.starName] || 'from-gray-500 to-gray-600';

          return (
            <div key={obs.starName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className={`bg-gradient-to-r ${gradient} px-5 py-3`}>
                <h4 className="text-white font-bold text-lg">{obs.starName}</h4>
                <p className="text-white/80 text-xs font-mono">{obs.utcTime} GMT</p>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Raw Altitude</p>
                  <p className="text-lg font-mono font-semibold text-navy-800">
                    {obs.rawAltitude.degrees}&deg;{obs.rawAltitude.minutes.toFixed(1)}&prime;
                  </p>
                </div>

                {settings.useCorrections && corr && (
                  <div className="text-xs space-y-1 border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Index</span>
                      <span className="font-mono text-gray-600">{formatArcmin(corr.indexCorrection)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dip</span>
                      <span className="font-mono text-gray-600">{formatArcmin(corr.dipCorrection)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Refraction</span>
                      <span className="font-mono text-gray-600">{formatArcmin(corr.refractionCorrection)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-gray-100 pt-1">
                      <span className="text-gray-500">Total</span>
                      <span className="font-mono text-navy-700">{formatArcmin(corr.totalCorrection)}</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Corrected Altitude</p>
                  <p className="text-lg font-mono font-semibold text-sky-700">
                    {corr ? formatAngle(corr.correctedAltitudeDeg) : formatAngle(
                      obs.rawAltitude.degrees + obs.rawAltitude.minutes / 60
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
