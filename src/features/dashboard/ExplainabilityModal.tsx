import { X, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface DecisionExplainability {
  decisionId: string;
  jobId: string;
  companyName: string;
  roleTitle: string;
  action: 'AUTO_APPLY' | 'REQUEST_REVIEW' | 'REJECT';
  overallScore: number;
  breakdown: {
    matchScore: number;
    atsScore: number;
    riskScore: number;
    salaryFit: boolean;
    locationFit: boolean;
    policyMode: 'Manual' | 'Assisted' | 'Automatic';
  };
  ruleEvaluations: Array<{
    rule: string;
    passed: boolean;
    detail: string;
  }>;
  rationale: string;
  timestamp: string;
}

interface Props {
  decision: DecisionExplainability | null;
  onClose: () => void;
}

const ExplainabilityModal = ({ decision, onClose }: Props) => {
  if (!decision) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
          <div>
            <div className="text-xs font-mono uppercase text-indigo-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Decision Audit Trail
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{decision.roleTitle}</h3>
            <div className="text-xs text-zinc-400">{decision.companyName} • Action: <span className="font-bold text-emerald-400">{decision.action}</span></div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Structured Rationale */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 text-xs font-mono leading-relaxed text-zinc-300">
          <div className="text-zinc-500 font-sans text-[11px] font-semibold mb-1 uppercase tracking-wider">Generated Rationale</div>
          {decision.rationale}
        </div>

        {/* Rule Evaluations */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Evaluated Policy Rules</div>
          <div className="space-y-2">
            {decision.ruleEvaluations.map((r, i) => (
              <div key={i} className="bg-[#09090b] p-3 rounded-lg border border-zinc-800/80 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  {r.passed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="font-medium text-zinc-200">{r.rule}</span>
                </div>
                <span className="text-zinc-400 font-mono text-[11px]">{r.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityModal;
