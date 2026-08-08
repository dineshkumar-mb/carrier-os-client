import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock, User, ShieldCheck, CheckCircle2, Zap, Rocket, ArrowRight, Server, Info } from 'lucide-react';

import api from '../../services/api';
import authBg from '../../assets/auth_bg.png';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Animated server wake-up loading ticker steps
  const loadingSteps = [
    '⚡ Waking up 17-agent runtime kernel on free tier...',
    '🛡️ Verifying multi-tenant security context...',
    '🚀 Authenticating candidate workspace & job matches...'
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { email, password, name: name || email.split('@')[0] };
      
      const response = await api.post(endpoint, payload);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials or allow a few seconds for free tier server to wake up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat overflow-hidden font-sans text-zinc-100"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      {/* Dark Ambient Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07080c]/95 via-[#0a0b12]/90 to-[#050609]/95 backdrop-blur-[2px]" />
      
      {/* Glowing Ambient Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-600/12 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: Hero & Free Tier Value Props */}
        <div className="lg:col-span-7 flex flex-col justify-center gap-6 pr-0 lg:pr-6 animate-float">
          
          {/* Free Tier Highlight Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-cyan-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold w-fit backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>✨ 100% FREE FOREVER TIER • NO CREDIT CARD REQUIRED</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Automate Your Career Search with <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">17 Autonomous AI Agents</span>
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Carrier OS scans global job portals, tailors JD-specific resumes, computes ATS match fit scores, and correlates recruiter email screeners.
            </p>
          </div>

          {/* Factual System Capabilities & Architecture Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#0e1017]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white flex items-center gap-1">
                17 <Zap className="w-4 h-4 text-indigo-400" />
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">Autonomous Agents</span>
            </div>
            <div className="flex flex-col border-l border-white/10 pl-3">
              <span className="text-xl font-bold text-emerald-400">100%</span>
              <span className="text-[11px] text-zinc-400 font-medium">Truthful Evidence Mapping</span>
            </div>
            <div className="flex flex-col border-l border-white/10 pl-3">
              <span className="text-xl font-bold text-cyan-400">$0</span>
              <span className="text-[11px] text-zinc-400 font-medium">Open Source Free Tier</span>
            </div>
          </div>

          {/* Key Free Features Bullet List */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-xs text-zinc-200">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span><strong>Multi-Portal Job Discovery</strong> across Greenhouse, Lever, Workday, Naukri & Remote platforms.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-200">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span><strong>Evidence-Backed Resume Tailoring</strong> with zero hallucinated metrics or unverified skills.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-200">
              <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span><strong>Live Gmail Recruiter Sync</strong> to capture interview screeners and application updates automatically.</span>
            </div>
          </div>

          {/* Factual Architectural Guarantee */}
          <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-zinc-300">
              <strong>Architectural Guarantee:</strong> Zero-hallucination evidence mapping, immutable multi-tenant security isolation, and candidate human approval sign-off.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Sign In / Sign Up Card */}
        <div className="lg:col-span-5">
          <div className="relative z-10 w-full bg-[#0e1017]/85 backdrop-blur-2xl border border-white/10 p-7 lg:p-8 rounded-2xl shadow-[0_0_60px_rgba(79,70,229,0.22)] transition-all duration-300">
            
            {/* Server Cold-Start Free Tier Information Banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-amber-300 text-xs">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold text-amber-200">Free Cloud Instance Notice:</span>
                <span className="text-amber-300/90 ml-1">If idle, the free cloud server takes ~5s to wake up on first click. Thanks for your patience!</span>
              </div>
            </div>

            {/* Free Tier Callout Banner */}
            <div className="bg-gradient-to-r from-emerald-500/15 via-indigo-500/10 to-cyan-500/15 border border-emerald-500/20 rounded-xl p-3 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-white">Free Starter Plan Active</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                $0 / mo
              </span>
            </div>

            {/* Brand Header */}
            <div className="flex flex-col items-center mb-5 text-center">
              <h2 className="text-xl font-bold tracking-tight text-white">{isLogin ? 'Welcome Back' : 'Create Free Account'}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isLogin ? 'Sign in to access your autonomous career engine' : 'Get instant access to all 17 AI agents for free'}
              </p>
            </div>

            {/* Tab Selector Toggle */}
            <div className="grid grid-cols-2 p-1 bg-[#161824]/80 border border-white/5 rounded-xl mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`py-2 rounded-lg transition-all duration-200 ${
                  isLogin ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`py-2 rounded-lg transition-all duration-200 ${
                  !isLogin ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-5 text-xs flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                      placeholder="Dinesh Kumar"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-300">Password</label>
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
                
                {isLogin && (
                  <div className="flex justify-end mt-1">
                    <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              {/* Animated Server Wake-Up Loading State */}
              {loading && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex flex-col gap-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      {loadingSteps[loadingStep]}
                    </span>
                  </div>
                  <div className="w-full bg-indigo-950/60 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full animate-progress-pulse" />
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Waking Up Server...</span>
                  </div>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Carrier OS' : 'Get Started Free'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Status & Security Badges */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-Tenant
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>Free Server Online</span>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
