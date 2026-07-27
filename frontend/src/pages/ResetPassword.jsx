import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, GraduationCap, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useBranding } from '../hooks/useBranding';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { branding } = useBranding();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Password reset token is missing. Please request a new link.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await axios.post('/api/auth/reset-password', {
        token: token,
        new_password: password
      });
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.detail || 'Failed to reset password. Token might be invalid or expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative font-sans">
      {/* Light card container */}
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-slate-100 p-8 md:p-10 animate-fadeIn">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <img 
              src={branding.logo_url} 
              className="h-16 w-auto object-contain max-w-[120px]" 
              onError={(e) => { e.target.style.display = 'none'; }} 
              alt="Logo" 
            />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-955">
            Reset Password
          </h2>
          <p className="text-slate-500 text-xs text-center mt-1">
            Choose a strong new password for your {branding.institution_name} account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 mb-6 text-sm text-center flex flex-col items-center gap-1.5 animate-pulse">
            <span className="font-bold">Password Reset Successful!</span>
            <span className="text-[11px] text-slate-500">Redirecting to login screen...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col">
              <label className="text-slate-600 text-xs font-bold mb-2 uppercase tracking-wider animate-fadeIn" htmlFor="password">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-12 text-slate-900 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-slate-600 text-xs font-bold mb-2 uppercase tracking-wider animate-fadeIn" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-12 text-slate-900 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg hover:shadow-brand-600/20 flex items-center justify-center gap-2 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Save Password'
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-6 border-t border-slate-100 mt-6">
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="text-brand-600 hover:underline font-bold transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
