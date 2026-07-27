import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, GraduationCap, Loader2 } from 'lucide-react';
import { useBranding } from '../hooks/useBranding';

export default function Register() {
  const { register } = useAuth();
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

  // Registration form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all the required fields.');
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

    setError('');
    setIsLoading(true);

    const result = await register(email, password, fullName, role);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative font-sans">
      {/* Light card container */}
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

        {/* Right Side: Clean white signup form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white border-l border-slate-50 py-10 md:py-14">
          <div className="flex flex-col items-center mb-3">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 text-center">{branding.institution_name}</h2>
            <div className="my-2.5 flex justify-center">
              <img 
                src={branding.logo_url} 
                className="h-12 w-auto object-contain max-h-[55px] transition-all hover:scale-105" 
                onError={(e) => { e.target.style.display = 'none'; }} 
                alt="Logo" 
              />
            </div>
            <p className="text-slate-500 text-[10px] text-center font-semibold text-center">Get started with our intelligent classroom ecosystem.</p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-2.5 mb-3 text-[11px] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              Registration successful! Redirecting to login...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-2.5 mb-3 text-[11px] font-semibold">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="flex flex-col">
              <label className="text-slate-600 text-[11px] font-bold mb-1 uppercase tracking-wider" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Shiva Shankar Reddy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-9 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading || success}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-slate-600 text-[11px] font-bold mb-1 uppercase tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. 26cs001@ssvuniversity.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-9 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || success}
                  autoComplete="off"
                />
              </div>
              <p className="text-[9px] text-slate-400 font-semibold mt-1">Must use your official college-issued @ssvuniversity.in email.</p>
            </div>

            <div className="flex flex-col">
              <label className="text-slate-600 text-[11px] font-bold mb-1 uppercase tracking-wider" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-9 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || success}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-slate-600 text-[11px] font-bold mb-1 uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-9 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || success}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-slate-600 text-[11px] font-bold mb-1 uppercase tracking-wider" htmlFor="role">Register As (Role)</label>
              <select
                id="role"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-semibold"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading || success}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-3 rounded-xl transition-all shadow-lg hover:shadow-brand-600/20 flex items-center justify-center gap-2 mt-2 text-xs uppercase tracking-wider"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-600 pt-3 border-t border-slate-100 mt-4 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-bold transition-colors">
              Log in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
