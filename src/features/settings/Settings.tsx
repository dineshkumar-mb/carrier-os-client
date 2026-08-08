import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getMe, updateMe } from '../../services/api';
import { Loader2, Mail, Send, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [policyMode, setPolicyMode] = useState<'Manual' | 'Assisted' | 'Automatic'>('Assisted');
  const [minSalary, setMinSalary] = useState(130000);
  const [atsThreshold, setAtsThreshold] = useState(90);
  const [maxRiskScore, setMaxRiskScore] = useState(20);
  const [policySaving, setPolicySaving] = useState(false);

  useEffect(() => {
    api.get('/policy/config')
      .then(res => {
        if (res.data?.data) {
          setPolicyMode(res.data.data.mode || 'Assisted');
          setMinSalary(res.data.data.minSalaryTarget || 130000);
          setAtsThreshold(res.data.data.atsScoreThreshold || 90);
          setMaxRiskScore(res.data.data.maxRiskScore || 20);
        }
      })
      .catch(() => {});
  }, []);

  const updateSettingsMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['me'], updatedUser);
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleToggle = (settingKey: 'notifyEmail' | 'notifyTelegram') => {
    if (!user) return;
    const currentPrefs = user.preferences || { notifyEmail: false, notifyTelegram: false };
    const newPrefs = {
      ...currentPrefs,
      [settingKey]: !currentPrefs[settingKey],
    };
    updateSettingsMutation.mutate({ preferences: newPrefs });
  };

  const handleSavePolicy = async () => {
    try {
      setPolicySaving(true);
      setSuccessMsg('');
      await api.put('/policy/config', {
        mode: policyMode,
        minSalaryTarget: minSalary,
        atsScoreThreshold: atsThreshold,
        maxRiskScore: maxRiskScore
      });
      setSuccessMsg('Policy engine configuration updated live!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Policy update error:', err);
    } finally {
      setPolicySaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const prefs = user?.preferences || { notifyEmail: true, notifyTelegram: true };

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Settings & Policy Rules</h1>
        <p className="text-zinc-400 mt-1 text-sm">Configure notification channels, automation policy modes, and ATS thresholds.</p>
      </header>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Policy Engine Configuration */}
      <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Automation Policy Engine</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-semibold">
            {policyMode} Mode Active
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-zinc-400 font-semibold mb-1 block">Automation Execution Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Manual', label: 'Manual (User Sign-off)' },
                { id: 'Assisted', label: 'Assisted (Queue Review)' },
                { id: 'Automatic', label: 'Automatic (Full Auto)' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPolicyMode(m.id as any)}
                  className={`p-3 rounded-xl border text-center transition font-semibold ${
                    policyMode === m.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 font-semibold mb-1 block">Target ATS Score Floor ({atsThreshold}%)</label>
              <input
                type="range"
                min="70"
                max="98"
                value={atsThreshold}
                onChange={(e) => setAtsThreshold(Number(e.target.value))}
                className="w-full text-indigo-500 accent-indigo-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold mb-1 block">Max Risk Score Limit ({maxRiskScore})</label>
              <input
                type="range"
                min="5"
                max="50"
                value={maxRiskScore}
                onChange={(e) => setMaxRiskScore(Number(e.target.value))}
                className="w-full text-indigo-500 accent-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleSavePolicy}
            disabled={policySaving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {policySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Save Policy Rules
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-white">Notification Channels</h2>

        <div className="divide-y divide-zinc-800/80">
          <div className="flex items-center justify-between py-4 first:pt-0">
            <div className="flex gap-3">
              <div className="bg-[#09090b] p-2.5 rounded-lg h-fit text-zinc-400 border border-zinc-800">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Email Notifications</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Receive job scan results and interview tips in your inbox.</p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('notifyEmail')}
              disabled={updateSettingsMutation.isPending}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.notifyEmail ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.notifyEmail ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-4 last:pb-0">
            <div className="flex gap-3">
              <div className="bg-[#09090b] p-2.5 rounded-lg h-fit text-zinc-400 border border-zinc-800">
                <Send className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Telegram Notifications</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Get live status updates for auto-apply tasks via Telegram.</p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('notifyTelegram')}
              disabled={updateSettingsMutation.isPending}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.notifyTelegram ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.notifyTelegram ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
