import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Sparkles, ArrowLeft, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

import api from '../../services/api';
import authBg from '../../assets/auth_bg.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(response.data.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please check address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat overflow-hidden font-sans text-zinc-100"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      {/* Dark Ambient Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07080c]/90 via-[#0a0b12]/85 to-[#050609]/95 backdrop-blur-[2px]" />
      
      {/* Glowing Ambient Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-[#0e1017]/75 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-[0_0_60px_rgba(79,70,229,0.18)] transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-indigo-400 p-[1px] shadow-lg shadow-indigo-500/20 mb-3">
            <div className="w-full h-full bg-[#0c0e14] rounded-[15px] flex items-center justify-center">
              <Mail className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white mb-1">Reset Account Password</h1>
          <p className="text-xs text-zinc-400">Enter your registered email to receive your instant reset token</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-5 text-xs flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl mb-5 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                required
                placeholder="name@company.com"
                disabled={!!success}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !!success}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Send Security Reset Link</span>
                <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>

        {/* Footer Security Badges */}
        <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-Tenant
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> 17-Agent Engine
          </span>
        </div>
      </div>
    </div>
  );
}
