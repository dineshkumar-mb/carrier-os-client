import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, ExternalLink, Loader2, Info } from 'lucide-react';
import api from '../../services/api';

export interface VerificationQueueItem {
  id: string;
  canonicalJobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  applicationUrl: string;
  authenticityScore: number;
  verificationStatus: string;
  evidence: any[];
  riskSignals: any[];
  reasons: string[];
  createdAt: string;
}

const JobVerificationApprovalCenter = () => {
  const [items, setItems] = useState<VerificationQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VerificationQueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/verification/approval-center');
      if (res.data?.data) {
        setItems(res.data.data);
        if (res.data.data.length > 0 && !selectedItem) {
          setSelectedItem(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch verification review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (canonicalJobId: string, action: 'approve' | 'reject') => {
    try {
      setActionProcessingId(canonicalJobId);
      setMessage('');
      const endpoint = action === 'approve' ? `/verification/${canonicalJobId}/approve` : `/verification/${canonicalJobId}/reject`;
      const res = await api.post(endpoint);

      setMessage(res.data?.message || `Job ${action === 'approve' ? 'Approved' : 'Rejected'}`);

      setItems(prev => prev.filter(item => item.canonicalJobId !== canonicalJobId));
      if (selectedItem?.canonicalJobId === canonicalJobId) {
        setSelectedItem(items.find(i => i.canonicalJobId !== canonicalJobId) || null);
      }
    } catch (err: any) {
      console.error('Action error:', err);
    } finally {
      setActionProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400 text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading Verification Approval Center...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#131316] border border-zinc-800/80 rounded-xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> Human Approval Center: Job Authenticity
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Review jobs marked <span className="text-amber-400 font-semibold">NEEDS_REVIEW</span> before they enter candidate matching and resume tailoring pipelines.
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-3 py-1.5 rounded-lg font-mono font-semibold">
          {items.length} Pending Sign-off{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
          <span className="font-semibold text-white">Verification Approval Queue Empty</span>
          <span>All discovered job listings have been verified or resolved.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Column */}
          <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Flagged Jobs Queue</h3>
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedItem?.canonicalJobId === item.canonicalJobId
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{item.title}</div>
                  <div className="text-[11px] text-zinc-400">{item.company} • {item.location}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      Score: {item.authenticityScore}/100
                    </span>
                    <span className="text-[10px] text-zinc-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Column */}
          {selectedItem && (
            <div className="lg:col-span-2 bg-[#131316] border border-zinc-800/80 rounded-xl p-6 flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedItem.title}</h3>
                  <p className="text-xs text-zinc-400">{selectedItem.company} • {selectedItem.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    Open Source <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Reasons & Evidence */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Verification Observations</span>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col gap-2">
                  {selectedItem.reasons.map((r, idx) => (
                    <div key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  onClick={() => handleAction(selectedItem.canonicalJobId, 'reject')}
                  disabled={actionProcessingId === selectedItem.canonicalJobId}
                  className="bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 text-rose-300 text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject Job
                </button>
                <button
                  onClick={() => handleAction(selectedItem.canonicalJobId, 'approve')}
                  disabled={actionProcessingId === selectedItem.canonicalJobId}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Job for Application
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobVerificationApprovalCenter;
