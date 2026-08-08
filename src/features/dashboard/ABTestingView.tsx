import { useState, useEffect } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface Variant {
  variantId: string;
  variantName: string;
  description: string;
  timesUsed: number;
  interviewsTriggered: number;
  conversionRate: number;
  averageATSScore: number;
  status: string;
}

const ABTestingView = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/ab-testing')
      .then(res => {
        if (res.data?.data) {
          setVariants(res.data.data);
        }
      })
      .catch(err => console.error('AB testing fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400 text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Loading A/B Testing Strategy Performance...
      </div>
    );
  }

  const winner = variants.find(v => v.status === 'ACTIVE_WINNER') || variants[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> A/B Testing Resume Strategies
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Tracks application-to-interview performance across multiple resume tailoring variants.</p>
        </div>
        {winner && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-lg font-mono">
            Winning Strategy: {winner.variantName} ({winner.conversionRate}% Conversion)
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {variants.map(v => (
          <div key={v.variantId} className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  v.status === 'ACTIVE_WINNER'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {v.status}
                </span>
                <span className="text-xs font-bold text-indigo-400">Avg ATS: {v.averageATSScore}%</span>
              </div>
              <h3 className="text-base font-bold text-white mt-3">{v.variantName}</h3>
              <p className="text-xs text-zinc-400 mt-1">{v.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#09090b] p-2 rounded-lg border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">Applied</div>
                <div className="font-bold text-zinc-200 mt-0.5">{v.timesUsed}</div>
              </div>
              <div className="bg-[#09090b] p-2 rounded-lg border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">Interviews</div>
                <div className="font-bold text-emerald-400 mt-0.5">{v.interviewsTriggered}</div>
              </div>
              <div className="bg-[#09090b] p-2 rounded-lg border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">Conv Rate</div>
                <div className="font-bold text-indigo-400 mt-0.5">{v.conversionRate}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ABTestingView;
