import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Lock, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

import api from '../../services/api';
import authBg from '../../assets/auth_bg.png';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match. Please re-enter.');
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may have expired.');
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
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white mb-1">Create New Password</h1>
          <p className="text-xs text-zinc-400">Set a strong new password for your Carrier OS account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-5 text-xs flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Save New Password & Sign In</span>
                <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

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
