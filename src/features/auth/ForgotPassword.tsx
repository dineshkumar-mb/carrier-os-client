import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import api from '../../services/api';

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
      setSuccess(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-zinc-100 flex items-center justify-center p-6">
      <div className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded mb-4 text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#242424] border border-zinc-700 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
              required
              placeholder="Enter your email"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !!success}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg mt-2 flex justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-zinc-500 text-sm">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
