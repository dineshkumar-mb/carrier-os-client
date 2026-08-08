import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Flame, Loader2, Building2 } from 'lucide-react';
import axios from 'axios';

interface TrendingSkill {
  name: string;
  growthPercent: number;
  demandLevel: string;
}

interface SalaryBenchmark {
  role: string;
  p25: string;
  p50: string;
  p75: string;
}

interface HiringSignal {
  company: string;
  status: string;
  openRoles: number;
  funding: string;
}

const MarketIntelligenceView = () => {
  const [skills, setSkills] = useState<TrendingSkill[]>([]);
  const [salaries, setSalaries] = useState<SalaryBenchmark[]>([]);
  const [signals, setSignals] = useState<HiringSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/market/intelligence')
      .then(res => {
        if (res.data?.data) {
          const rawSkills = res.data.data.trendingSkills || [];
          setSkills(rawSkills);

          const rawSalaries = res.data.data.salaryBenchmarks || {};
          const formattedSalaries = Object.entries(rawSalaries).map(([role, val]: [string, any]) => ({
            role,
            p25: `$${(val.p25 / 1000).toFixed(0)}k`,
            p50: `$${(val.p50 / 1000).toFixed(0)}k`,
            p75: `$${(val.p75 / 1000).toFixed(0)}k`
          }));
          setSalaries(formattedSalaries);

          setSignals(res.data.data.hiringSignals || []);
        }
      })
      .catch(err => console.error('Market intelligence fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400 text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Loading Market Intelligence...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Global Job Market Intelligence
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Real-time tech stack demand, salary distributions, and hiring signals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Technologies */}
        <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-amber-400" /> High-Demand Tech Stacks
          </h3>
          <div className="space-y-3">
            {skills.map((t, idx) => (
              <div key={idx} className="bg-[#09090b] p-3.5 rounded-lg border border-zinc-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-zinc-100">{t.name}</div>
                  <div className="text-zinc-500 mt-0.5">Demand Level: {t.demandLevel}</div>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded font-mono border border-emerald-500/20">
                  +{t.growthPercent}% YoY
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Benchmarks */}
        <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Salary Benchmarks
          </h3>
          <div className="space-y-3">
            {salaries.map((s, idx) => (
              <div key={idx} className="bg-[#09090b] p-3.5 rounded-lg border border-zinc-800 text-xs space-y-2">
                <div className="font-semibold text-zinc-100">{s.role}</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#131316] p-2 rounded">
                    <div className="text-zinc-500 text-[10px]">P25</div>
                    <div className="text-zinc-300 font-semibold">{s.p25}</div>
                  </div>
                  <div className="bg-[#131316] p-2 rounded">
                    <div className="text-zinc-500 text-[10px]">P50 Median</div>
                    <div className="text-indigo-400 font-bold">{s.p50}</div>
                  </div>
                  <div className="bg-[#131316] p-2 rounded">
                    <div className="text-zinc-500 text-[10px]">P75 Top</div>
                    <div className="text-emerald-400 font-semibold">{s.p75}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Hiring Signals */}
        <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-indigo-400" /> Hiring Signals
          </h3>
          <div className="space-y-3">
            {signals.map((sig, idx) => (
              <div key={idx} className="bg-[#09090b] p-3.5 rounded-lg border border-zinc-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-100">{sig.company}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {sig.status}
                  </span>
                </div>
                <div className="text-zinc-400 flex justify-between">
                  <span>Open Roles: <strong className="text-white">{sig.openRoles}</strong></span>
                  <span>{sig.funding}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligenceView;
