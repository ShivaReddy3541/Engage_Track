import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, GraduationCap, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useBranding } from '../hooks/useBranding';

export default function Login() {
  const { login } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();

  // Slideshow config
  const baseSlides = [
    { image: '/assets/slide5.jpg', label: 'Beautiful Campus Pathways', desc: 'Lush green pathways and open amphitheaters define our campus.' },
    { image: '/assets/slide6.jpg', label: 'Academic Infrastructure', desc: 'State-of-the-art department blocks and modern classroom buildings.' },
    { image: '/assets/slide7.jpg', label: 'Connected Transit Fleet', desc: 'Reliable daily transport routes servicing students and staff securely.' },
    { image: '/assets/slide8.jpg', label: 'Interactive Computing Labs', desc: 'Equipped with individual desktop workstations for modern engineering education.' },
    { image: '/assets/slide1.jpg', label: 'SSV Seminar Hall', desc: 'Modern auditorium with high-definition audio-visual and premium seating.' },
    { image: '/assets/slide2.jpg', label: 'Safe Bus Services', desc: 'Connected lines servicing students and staff members securely.' },
    { image: '/assets/slide3.jpg', label: 'Advanced Engineering Lab', desc: 'Supporting academic experimentation and computing research.' },
    { image: '/assets/slide4.jpg', label: 'Scientific Laboratory', desc: 'Equipped with specialized lab instruments and microscopes.' }
  ];
  const slides = [...baseSlides, baseSlides[0]];
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setActiveSlide((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  const handleTransitionEnd = () => {
    if (activeSlide >= baseSlides.length) {
      setIsTransitioning(false);
      setActiveSlide(0);
    }
  };

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password states
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resetDebugLink, setResetDebugLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin');
      } else if (result.role === 'dept_admin') {
        navigate('/dept-admin');
      } else if (result.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } else {
      setError(result.error);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setForgotSuccess('');
    setResetDebugLink('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setIsLoading(false);
      setForgotSuccess(response.data.message || 'Password reset link generated successfully.');
      if (response.data.reset_link) {
        setResetDebugLink(response.data.reset_link);
      }
      setForgotEmail('');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.detail || 'Failed to request password reset link.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative font-sans">
      <div className="w-[90vw] max-w-6xl min-h-[85vh] h-fit bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100 animate-fadeIn">
        
        {/* Left Side: Scrolling Image Slideshow */}
        <div className="hidden md:block md:w-1/2 relative bg-slate-900 overflow-hidden self-stretch min-h-[600px]">
          <div 
            className="absolute inset-0 flex" 
            style={{ 
              width: `${slides.length * 100}%`, 
              transform: `translateX(-${activeSlide * (100 / slides.length)}%)`,
              transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((s, idx) => (
              <div key={idx} className="h-full relative flex-shrink-0" style={{ width: `${100 / slides.length}%` }}>
                <img 
                  src={s.image} 
                  className="w-full h-full object-cover opacity-60" 
                  alt={s.label} 
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/10" />
                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center pb-14">
                  <h3 className="text-lg font-black text-white leading-tight drop-shadow-md tracking-tight">{s.label}</h3>
                  <p className="text-slate-200 text-[11px] mt-2 max-w-[260px] drop-shadow-sm font-semibold tracking-wide">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Badge Overlay - Top Right of Left Panel */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-3 bg-slate-950/50 backdrop-blur-md px-4.5 py-2.5 rounded-2xl border border-white/10 shadow-lg animate-fadeIn">
            <img 
              src={branding.logo_url} 
              className="h-10 md:h-12 w-auto object-contain" 
              onError={(e) => { e.target.style.display = 'none'; }} 
              alt="Logo" 
            />
            <span className="font-black text-xs text-white uppercase tracking-wider">{branding.institution_name}</span>
          </div>

          {/* Dots Indicator Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {baseSlides.map((_, idx) => {
              const activeDot = activeSlide % baseSlides.length;
              return (
                <button 
                  key={idx} 
                  onClick={() => { setIsTransitioning(true); setActiveSlide(idx); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeDot === idx ? 'w-4 bg-brand-500' : 'w-1.5 bg-white/40'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Right Side: Clean form container */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white border-l border-slate-50 py-10 md:py-14">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 text-center">
              {branding.institution_name}
            </h2>
            <div className="my-4 flex justify-center">
              <img 
                src={branding.logo_url} 
                className="h-20 w-auto object-contain max-h-[90px] transition-all hover:scale-105" 
                onError={(e) => { e.target.style.display = 'none'; }} 
                alt="Logo" 
              />
            </div>
            <p className="text-slate-500 text-xs text-center font-semibold">
              {isForgot ? 'Enter email to receive reset link' : 'Sign in to your account to continue'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-3.5 mb-4 text-xs font-semibold">
              {error}
            </div>
          )}

          {forgotSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-3.5 mb-4 text-xs space-y-1.5">
              <p className="font-semibold">{forgotSuccess}</p>
              {resetDebugLink && (
                <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-[11px] space-y-1 shadow-sm text-left">
                  <span className="font-bold text-[9px] text-emerald-600 uppercase tracking-wider block">Password Reset Link:</span>
                  <a 
                    href={resetDebugLink} 
                    className="text-brand-600 hover:underline break-all font-mono block text-[10px]"
                  >
                    {resetDebugLink}
                  </a>
                </div>
              )}
            </div>
          )}

          {!isForgot ? (
            /* LOGIN VIEW */
            <div className="space-y-4 animate-fadeIn">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="flex flex-col">
                  <label className="text-slate-600 text-xs font-bold mb-1.5 uppercase tracking-wider" htmlFor="email">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@school.edu"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 pl-12 text-slate-900 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-600 text-xs font-bold uppercase tracking-wider" htmlFor="password">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 pl-12 text-slate-900 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button 
                    type="button"
                    onClick={() => { setIsForgot(true); setError(''); setForgotSuccess(''); }}
                    className="text-xs text-brand-600 hover:underline font-bold transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg hover:shadow-brand-600/20 flex items-center justify-center gap-2 mt-2 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-600 pt-3 border-t border-slate-100 font-semibold">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-600 hover:underline font-bold transition-colors">
                  Register
                </Link>
              </div>
            </div>
          ) : (
            /* FORGOT PASSWORD VIEW */
            <div className="space-y-4 animate-fadeIn">
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div className="flex flex-col">
                  <label className="text-slate-600 text-xs font-bold mb-1.5 uppercase tracking-wider" htmlFor="forgotEmail">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      id="forgotEmail"
                      type="email"
                      placeholder="you@school.edu"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 pl-12 text-slate-900 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg hover:shadow-brand-600/20 flex items-center justify-center gap-2 mt-2 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Show Password Reset Link'
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => { setIsForgot(false); setError(''); setForgotSuccess(''); }}
                  className="text-brand-600 hover:underline font-bold transition-all"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
