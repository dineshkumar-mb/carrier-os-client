import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, triggerAutoApply } from '../../services/api';
import { ApplicationsSkeleton } from '../../components/Skeleton';
import { io } from 'socket.io-client';
import { Send, Loader2, Play, Calendar, AlertCircle, Clock, CheckSquare, Award, ChevronDown, ChevronUp, Plus, Filter, Mail, RefreshCw } from 'lucide-react';
import api, { API_SERVER_URL } from '../../services/api';

interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary?: { min: number; max: number; currency: string } | string;
    url: string;
  };
  status: 'Pending' | 'Auto-Applying' | 'Applied' | 'Interview' | 'Rejected';
  timeline: TimelineEvent[];
  createdAt: string;
}

interface RecruiterEmail {
  _id: string;
  sender: string;
  subject: string;
  body: string;
  receivedAt: string;
  classification: string;
}

export default function Applications() {
  const queryClient = useQueryClient();
  
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'inbox'>('tracker');
  const [emails, setEmails] = useState<RecruiterEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [scanningInbox, setScanningInbox] = useState(false);

  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('Applied');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchEmails = async () => {
    try {
      setEmailsLoading(true);
      const res = await api.get('/inbox');
      if (res.data) setEmails(res.data);
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setEmailsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'inbox') {
      fetchEmails();
    }
  }, [activeSubTab]);

  useEffect(() => {
    const socket = io(API_SERVER_URL);

    socket.on('live-activity', (message: string) => {
      if (message.includes('Worker') || message.includes('application') || message.includes('Applied') || message.includes('Email') || message.includes('Inbox')) {
        queryClient.invalidateQueries({ queryKey: ['applications'] });
        if (activeSubTab === 'inbox') fetchEmails();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, activeSubTab]);

  const autoApplyMutation = useMutation({
    mutationFn: triggerAutoApply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const handleAutoApply = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    autoApplyMutation.mutate(appId);
  };

  const handleUpdateStatus = async (appId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingAppId(appId);
      await api.patch(`/applications/${appId}`, {
        status: newStatus,
        note: newNote
      });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setNewNote('');
      setSuccessMsg('Application status updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleScanInbox = async () => {
    try {
      setScanningInbox(true);
      const res = await api.post('/inbox/scan');
      setSuccessMsg(res.data?.message || 'Inbox scanned.');
      fetchEmails();
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Scan inbox error:', err);
    } finally {
      setScanningInbox(false);
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-fit"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'Auto-Applying':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 w-fit"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Auto-Applying</span>;
      case 'Applied':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit"><CheckSquare className="w-3.5 h-3.5" /> Applied</span>;
      case 'Interview':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5 w-fit"><Award className="w-3.5 h-3.5" /> Interview</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-fit"><AlertCircle className="w-3.5 h-3.5" /> Rejected</span>;
    }
  };

  const filteredApps = (applications || []).filter((app: Application) => {
    if (filterStatus === 'All') return true;
    return app.status === filterStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Application Tracker & Email Sync</h1>
          <p className="text-zinc-400 mt-1 text-sm">Monitor job application pipelines and incoming recruiter email threads.</p>
        </div>
        {activeSubTab === 'inbox' && (
          <button
            onClick={handleScanInbox}
            disabled={scanningInbox}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            {scanningInbox ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
            Scan Recruiter Emails
          </button>
        )}
      </header>

      {/* Sub Tabs */}
      <div className="flex border-b border-zinc-950 gap-6">
        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'tracker'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Active Pipelines ({applications?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('inbox')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'inbox'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Recruiter Communications ({emails.length || 0})
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-semibold">
          <CheckSquare className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {activeSubTab === 'tracker' ? (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center gap-2 bg-[#131316] border border-zinc-800 rounded-xl p-1.5 w-fit">
            <Filter className="w-3.5 h-3.5 text-zinc-500 ml-2" />
            {['All', 'Pending', 'Applied', 'Interview', 'Rejected'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {appsLoading ? (
            <ApplicationsSkeleton />
          ) : filteredApps.length === 0 ? (
            <div className="text-zinc-550 py-16 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl gap-3 bg-[#131316]/30">
              <Send className="w-8 h-8 text-zinc-700" />
              <h3 className="text-sm font-semibold text-zinc-400">No applications matching filter</h3>
            </div>
          ) : (
            <div className="grid gap-4 animate-in fade-in duration-200">
              {filteredApps.map((app: Application) => {
                const isExpanded = expandedAppId === app._id;
                return (
                  <div
                    key={app._id}
                    onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                    className={`bg-[#131316] border rounded-xl overflow-hidden cursor-pointer hover:border-zinc-700/60 transition-all duration-200 ${
                      isExpanded ? 'border-indigo-500/40 shadow-lg' : 'border-zinc-850'
                    }`}
                  >
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-zinc-100 leading-snug">{app.jobId?.title || 'Job Title'}</h3>
                        <p className="text-zinc-400 text-xs font-medium">{app.jobId?.company || 'Company'} • {app.jobId?.location || 'Location'}</p>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-center">
                        {getStatusBadge(app.status)}

                        {(app.status === 'Pending' || app.status === 'Rejected') && (
                          <button
                            onClick={(e) => handleAutoApply(app._id, e)}
                            disabled={autoApplyMutation.isPending}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md"
                          >
                            <Play className="w-3 h-3 fill-current text-white" />
                            Run Auto-Apply
                          </button>
                        )}

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0c0c0e]/80 px-6 py-5 border-t border-zinc-900 text-xs space-y-6"
                      >
                        <div>
                          <h4 className="font-semibold text-zinc-400 mb-4 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                            <Calendar className="w-4 h-4 text-indigo-400" /> Event Activity History
                          </h4>

                          <div className="relative pl-6 border-l border-zinc-800 space-y-5 ml-2">
                            {app.timeline?.map((event, idx) => (
                              <div key={idx} className="relative">
                                <div className="absolute -left-[29px] top-1 bg-[#131316] rounded-full p-0.5 border border-indigo-500">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                </div>
                                <div>
                                  <div className="flex items-baseline justify-between gap-4">
                                    <span className="font-bold text-zinc-200 uppercase text-[10px] tracking-wide">{event.status}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">{new Date(event.timestamp).toLocaleString()}</span>
                                  </div>
                                  {event.note && (
                                    <p className="text-zinc-400 mt-1 text-[11px] leading-relaxed pr-6 bg-[#131316] p-2.5 rounded border border-zinc-850 font-mono">
                                      {event.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <form onSubmit={(e) => handleUpdateStatus(app._id, e)} className="bg-[#131316] p-4 rounded-xl border border-zinc-800 space-y-3">
                          <h4 className="font-bold text-zinc-200 text-xs flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-indigo-400" /> Update Status & Log Recruiter Interaction
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Interview">Interview Inviting</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <input
                              type="text"
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="e.g. Recruiter email received..."
                              className="sm:col-span-2 bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={updatingAppId === app._id}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            {updatingAppId === app._id && <Loader2 className="w-3 h-3 animate-spin" />}
                            Save Update
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Recruiter Communications Inbox View */
        <div className="space-y-4 max-w-4xl animate-in fade-in duration-200">
          {emailsLoading ? (
            <div className="flex items-center justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : emails.length === 0 ? (
            <div className="text-zinc-550 py-16 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl gap-3 bg-[#131316]/30">
              <Mail className="w-8 h-8 text-zinc-700" />
              <h3 className="text-sm font-semibold text-zinc-400">No recruiter messages found</h3>
              <p className="text-xs text-zinc-650">Click "Scan Recruiter Emails" above to verify new inbound mail.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {emails.map((mail) => {
                const isExpanded = expandedEmailId === mail._id;
                return (
                  <div
                    key={mail._id}
                    onClick={() => setExpandedEmailId(isExpanded ? null : mail._id)}
                    className="bg-[#131316] border border-zinc-850 hover:border-zinc-800 rounded-xl p-5 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-200 text-sm">{mail.sender}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            mail.classification === 'Interview' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            mail.classification === 'Rejection' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {mail.classification}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-zinc-400 leading-snug">{mail.subject}</h4>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {new Date(mail.receivedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 p-4 bg-[#09090b]/80 border border-zinc-900 rounded-lg text-xs leading-relaxed text-zinc-300 font-mono whitespace-pre-line">
                        {mail.body}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 mt-2.5 truncate font-mono">
                        {mail.body}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
