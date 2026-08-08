import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe } from '../../services/api';
import { User, Mail, Send, Loader2, CheckCircle2, Shield } from 'lucide-react';

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const [name, setName] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTelegramChatId(user.telegramChatId || '');
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['me'], updatedUser);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, telegramChatId });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-zinc-400 text-sm">Fetching user credentials...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
        <p className="text-zinc-400 mt-1 text-sm">Manage your personal credentials, contact endpoints, and bot syncs.</p>
      </header>

      <section className="bg-[#131316] border border-zinc-800/85 rounded-xl p-6 shadow-sm glow-accent">
        <form onSubmit={handleSubmit} className="space-y-6">
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow-sm glow-success">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-[#09090b]/60 border border-zinc-900 rounded-lg pl-10 pr-4 py-2.5 text-zinc-500 cursor-not-allowed text-sm focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-zinc-500">Official account login endpoint. Contact support to change.</p>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#09090b]/80 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Telegram Chat ID */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Telegram Chat ID</label>
            <div className="relative">
              <Send className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="e.g. 123456789"
                className="w-full bg-[#09090b]/80 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <p className="text-[10px] text-zinc-500">
              Supply your chat ID to receive real-time application updates and interview prep checklists directly in Telegram.
            </p>
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm shadow-md active:scale-98 cursor-pointer"
          >
            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </section>

      {/* Security Info Card */}
      <section className="bg-[#131316] border border-zinc-800/80 rounded-xl p-5 flex items-start gap-4">
        <div className="bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20 shrink-0">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">PII Encryption Active</h3>
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
            Your name and Telegram contact coordinates are encrypted at rest using AES-256-GCM. 
            Only you and authorized system background workers can decrypt this information.
          </p>
        </div>
      </section>
    </div>
  );
}
