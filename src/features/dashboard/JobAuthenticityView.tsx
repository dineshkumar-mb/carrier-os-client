import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, Search, FileCheck } from 'lucide-react';
import api from '../../services/api';

export interface VerificationMetrics {
  highConfidence: number;
  probablyReal: number;
  needsReview: number;
  suspicious: number;
  expired: number;
  duplicates: number;
  invalid: number;
  totalVerified: number;
}

const JobAuthenticityView = () => {
  const [metrics, setMetrics] = useState<VerificationMetrics>({
    highConfidence: 0,
    probablyReal: 0,
    needsReview: 0,
    suspicious: 0,
    expired: 0,
    duplicates: 0,
    invalid: 0,
    totalVerified: 0
  });

  const [loading, setLoading] = useState(true);
  const [testJobId, setTestJobId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/verification/dashboard');
      if (res.data?.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch verification metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleTestVerification = async () => {
    if (!testJobId.trim()) return;
    try {
      setVerifying(true);
      setVerificationResult(null);
      const res = await api.post(`/verification/verify/${testJobId.trim()}`, { forceRefresh: true });
      if (res.data?.data) {
        setVerificationResult(res.data.data);
        fetchMetrics();
      }
    } catch (err: any) {
      console.error('Verification request failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#131316] border border-zinc-800/80 rounded-xl p-5 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Job Authenticity Trust Layer
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Carrier OS verifies discovered jobs across official company domains, ATS portals, and risk signals before candidate matching or resume tailoring.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-2 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#131316] border border-emerald-500/30 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">High Confidence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 mt-2">{metrics.highConfidence}</span>
          <span className="text-[10px] text-zinc-500 mt-1">Score $\ge$ 90%</span>
        </div>

        <div className="bg-[#131316] border border-indigo-500/30 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Probably Real</span>
            <FileCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold text-indigo-400 mt-2">{metrics.probablyReal}</span>
          <span className="text-[10px] text-zinc-500 mt-1">Score 75–89%</span>
        </div>

        <div className="bg-[#131316] border border-amber-500/30 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Needs Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-amber-400 mt-2">{metrics.needsReview}</span>
          <span className="text-[10px] text-zinc-500 mt-1">Score 50–74%</span>
        </div>

        <div className="bg-[#131316] border border-rose-500/30 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Suspicious</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-rose-400 mt-2">{metrics.suspicious}</span>
          <span className="text-[10px] text-zinc-500 mt-1">Score $\le$ 49%</span>
        </div>

        <div className="bg-[#131316] border border-zinc-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Expired</span>
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
          </div>
          <span className="text-2xl font-bold text-zinc-300 mt-2">{metrics.expired}</span>
          <span className="text-[10px] text-zinc-500 mt-1">Listing closed</span>
        </div>

        <div className="bg-[#131316] border border-zinc-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Duplicates</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-2xl font-bold text-zinc-300 mt-2">{metrics.duplicates}</span>
          <span className="text-[10px] text-zinc-500 mt-1">Syndicated copy</span>
        </div>
      </div>

      {/* Manual Verification Test Console */}
      <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-400" /> Run On-Demand Job Verification
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Canonical Job ID to verify..."
            value={testJobId}
            onChange={(e) => setTestJobId(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleTestVerification}
            disabled={verifying || !testJobId.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {verifying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Verify Job
          </button>
        </div>

        {verificationResult && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Verification Status: {verificationResult.globalVerification?.verificationStatus}</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Score: {verificationResult.globalVerification?.authenticityScore}/100
              </span>
            </div>

            <p className="text-xs text-zinc-300">
              Gate Passed: <span className={verificationResult.gatePassed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {verificationResult.gatePassed ? 'YES' : 'NO'}
              </span> ({verificationResult.gateReason})
            </p>

            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Collected Evidence Items</span>
              {verificationResult.globalVerification?.evidence?.map((ev: any, idx: number) => (
                <div key={idx} className="text-xs text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-800/50 flex items-center justify-between">
                  <span>[{ev.strength} | {ev.provenance}] {ev.details}</span>
                  {ev.sourceUrl && (
                    <a href={ev.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline text-[10px] flex items-center gap-1">
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAuthenticityView;
