import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, ShieldAlert, Loader2 } from 'lucide-react';
import axios from 'axios';

export interface ApprovalItem {
  id: string;
  jobId: string;
  roleTitle: string;
  companyName: string;
  matchScore: number;
  atsScore: number;
  policyMode: string;
  resumeVariant: string;
  coverLetterSnippet: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const HumanApprovalCenter = () => {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const fetchQueue = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/approval/queue');
      if (res.data?.data) {
        setItems(res.data.data);
        if (res.data.data.length > 0 && !selectedItem) {
          setSelectedItem(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch approval queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setActionProcessingId(id);
      setMessage('');
      const res = await axios.post(`http://localhost:3000/api/approval/${id}/action`, { action });

      setMessage(res.data?.message || `Item ${action === 'approve' ? 'Approved & Submitted' : 'Rejected'}`);

      // Update local state
      const updatedStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: updatedStatus } : item));
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status: updatedStatus } : null);
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
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Loading Approval Queue...
      </div>
    );
  }

  const pendingCount = items.filter(i => i.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-[#131316] border border-zinc-800/80 rounded-xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> Human Approval Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Review pending resumes, cover letters, and applications before submission.</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-3 py-1.5 rounded-lg font-mono font-semibold">
          {pendingCount} Pending Sign-off{pendingCount !== 1 ? 's' : ''}
        </div>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="bg-[#131316] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Approval Queue</h3>
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedItem?.id === item.id
                  ? 'bg-indigo-500/10 border-indigo-500/50'
                  : 'bg-[#09090b] border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm text-zinc-100">{item.roleTitle}</div>
                  <div className="text-xs text-zinc-400">{item.companyName}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  item.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="flex gap-3 mt-3 text-xs">
                <span className="text-indigo-400 font-medium">Match: {item.matchScore}%</span>
                <span className="text-emerald-400 font-medium">ATS: {item.atsScore}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Item Preview & Sign-off Panel */}
        <div className="lg:col-span-2 bg-[#131316] border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-4">
          {selectedItem ? (
            <>
              <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedItem.roleTitle}</h3>
                  <div className="text-xs text-zinc-400">{selectedItem.companyName} • Policy: <span className="text-indigo-400 font-semibold">{selectedItem.policyMode}</span></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(selectedItem.id, 'approve')}
                    disabled={actionProcessingId === selectedItem.id || selectedItem.status === 'APPROVED'}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    {actionProcessingId === selectedItem.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {selectedItem.status === 'APPROVED' ? 'Submitted' : 'Approve & Submit'}
                  </button>
                  <button
                    onClick={() => handleAction(selectedItem.id, 'reject')}
                    disabled={actionProcessingId === selectedItem.id || selectedItem.status === 'REJECTED'}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-red-400" /> Reject
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#09090b] p-3 rounded-lg border border-zinc-800/80">
                  <div className="text-zinc-500 font-medium">Match Fit Score</div>
                  <div className="text-lg font-bold text-indigo-400">{selectedItem.matchScore}%</div>
                </div>
                <div className="bg-[#09090b] p-3 rounded-lg border border-zinc-800/80">
                  <div className="text-zinc-500 font-medium">ATS Optimization Score</div>
                  <div className="text-lg font-bold text-emerald-400">{selectedItem.atsScore}%</div>
                </div>
              </div>

              <div className="bg-[#09090b] p-4 rounded-lg border border-zinc-800/80 space-y-2">
                <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" /> Generated Cover Letter Preview
                </div>
                <p className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-line bg-[#131316] p-3 rounded border border-zinc-800/60">
                  {selectedItem.coverLetterSnippet}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-zinc-500 py-12">Select an item from the queue to review</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HumanApprovalCenter;
