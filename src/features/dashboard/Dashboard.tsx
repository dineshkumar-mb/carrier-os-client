import { useState, useRef, useEffect } from 'react';
import { Briefcase, Activity, Crosshair, Terminal, TrendingUp, Cpu, Server, ShieldAlert, Layers, Play, Pause, RefreshCw, Zap } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardStats, getObservabilityStats } from '../../services/api';
import { DashboardSkeleton } from '../../components/Skeleton';
import StatCard from '../../components/StatCard';
import HumanApprovalCenter from './HumanApprovalCenter';
import SkillGraphView from './SkillGraphView';
import ABTestingView from './ABTestingView';
import MarketIntelligenceView from './MarketIntelligenceView';
import api, { API_SERVER_URL } from '../../services/api';

type TabType = 'overview' | 'approval' | 'skill_graph' | 'ab_testing' | 'market';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAutonomousRunning, setIsAutonomousRunning] = useState<boolean>(false);
  const [isExecutingCycle, setIsExecutingCycle] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const [logs, setLogs] = useState<{ time: string, message: string }[]>([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), message: 'Carrier OS v1.0 Agent Runtime initialized. 17 Agents registered.' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  useQuery({
    queryKey: ['observability-stats'],
    queryFn: getObservabilityStats,
  });

  useEffect(() => {
    // Fetch initial autonomous engine status
    api.get('/autonomous/status')
      .then(res => {
        if (res.data?.data) {
          setIsAutonomousRunning(res.data.data.isRunning);
        }
      })
      .catch(() => {});

    const socket: Socket = io(API_SERVER_URL);

    socket.on('live-activity', (message: string) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLogs((prev) => [...prev, { time, message }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleAutonomous = async () => {
    try {
      const nextState = !isAutonomousRunning;
      setIsAutonomousRunning(nextState);
      await api.post('/autonomous/toggle', { enable: nextState, intervalMs: 30000 });
    } catch (err) {
      console.error('Failed to toggle autonomous loop:', err);
    }
  };

  const triggerCycleNow = async () => {
    try {
      setIsExecutingCycle(true);
      await api.post('/autonomous/run-cycle');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (err) {
      console.error('Failed to trigger autonomous cycle:', err);
    } finally {
      setIsExecutingCycle(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Brand & Navigation Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-[#131316] border border-slate-200 dark:border-zinc-800/80 rounded-xl p-4 gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Carrier OS <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">v1.0</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400">Autonomous Multi-Agent Career Operating System</p>
          </div>
        </div>

        {/* Autonomous Control Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleAutonomous}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              isAutonomousRunning
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            {isAutonomousRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Autonomous Loop Active (30s)
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Start Autonomous Loop
              </>
            )}
          </button>

          <button
            onClick={triggerCycleNow}
            disabled={isExecutingCycle}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isExecutingCycle ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            )}
            Run Cycle Now
          </button>
        </div>
      </header>

      {/* Feature Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        {[
          { id: 'overview', label: 'Overview', icon: Briefcase },
          { id: 'approval', label: 'Human Approval', icon: ShieldAlert },
          { id: 'skill_graph', label: 'Skill Graph', icon: Layers },
          { id: 'ab_testing', label: 'A/B Testing', icon: Activity },
          { id: 'market', label: 'Job Market', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Rendering */}
      {activeTab === 'approval' && <HumanApprovalCenter />}
      {activeTab === 'skill_graph' && <SkillGraphView />}
      {activeTab === 'ab_testing' && <ABTestingView />}
      {activeTab === 'market' && <MarketIntelligenceView />}

      {activeTab === 'overview' && (
        statsLoading ? (
          <DashboardSkeleton />
        ) : (
        <div className="flex flex-col gap-6">
          {/* Main Metrics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Discovered Jobs" value={statsLoading ? '...' : stats?.jobsFound ?? 0} icon={Briefcase} trend="Real-time matching" trendUp={true} />
            <StatCard title="Applications Sent" value={statsLoading ? '...' : stats?.totalApplications ?? 0} icon={TrendingUp} trend="Direct auto apply" trendUp={true} />
            <StatCard title="ATS Avg Match" value={statsLoading ? '...' : stats?.avgAtsScore ?? '0%'} icon={Crosshair} trend="Zod validated optimization" trendUp={true} />
            <StatCard title="Interviews Booked" value={statsLoading ? '...' : stats?.interviewCount ?? 0} icon={Cpu} trend="Calendar synchronized" trendUp={true} />
          </section>

          {/* Observability & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-white dark:bg-[#131316] border border-slate-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm flex flex-col h-80 lg:col-span-2 transition-colors">
              <div className="bg-slate-100 dark:bg-[#0c0c0e] border-b border-slate-200 dark:border-zinc-900/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-200">17-Agent Execution Trace Stream</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isAutonomousRunning ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-500'}`}></span>
                  <span className="text-[10px] text-slate-600 dark:text-zinc-400 font-mono">
                    {isAutonomousRunning ? 'AUTONOMOUS LOOP ACTIVE' : 'LIVE AGENT RUNTIME'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-2.5 scrollbar-thin bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border-t border-slate-200 dark:border-zinc-900/80 transition-colors">
                {logs.map((log, i) => (
                  <div key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed border-l-2 border-indigo-500/50 pl-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold mr-1">[{log.time}]</span> {log.message}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </section>

            <section className="bg-white dark:bg-[#131316] border border-slate-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm flex flex-col h-80 transition-colors">
              <div className="bg-slate-100 dark:bg-[#0c0c0e] border-b border-slate-200 dark:border-zinc-900/80 px-4 py-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-200">System Telemetry & Policy</h3>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between text-xs text-slate-600 dark:text-zinc-400 space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-200 dark:border-zinc-900/50 pb-2.5">
                    <span className="text-slate-600 dark:text-zinc-400">Registered Agents:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">17 Agents Active</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-zinc-900/50 py-2.5">
                    <span className="text-slate-600 dark:text-zinc-400">Autonomous Engine:</span>
                    <span className={`font-semibold ${isAutonomousRunning ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400'}`}>
                      {isAutonomousRunning ? 'Running (30s Interval)' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-zinc-900/50 py-2.5">
                    <span className="text-slate-600 dark:text-zinc-400">Target ATS Score Floor:</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-200">&gt; 90 Target Threshold</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#09090b] p-3 rounded-lg border border-slate-200 dark:border-zinc-800/80 text-center">
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-semibold">Career Health Score</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">94 / 100</div>
                </div>
              </div>
            </section>
          </div>
        </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
