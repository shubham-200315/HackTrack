import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthView() {
  const { login, registerWithPassword } = useAuth();
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password || (!isLoginMode && !name)) {
      setErrorMessage('Please fill in all required inputs.');
      return;
    }

    setSubmitting(true);
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await registerWithPassword(name, email, password);
      }
      // Redirect to dashboard root on successful login/register
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please review your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans antialiased text-neutral-800 p-6 relative overflow-hidden">
      {/* Decorative Pastel Glow Background Circles */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-brand-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-neutral-200/60 rounded-3xl shadow-premium p-8 md:p-10 relative z-10 transition-all duration-300">
        
        {/* Header/Brand Section */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex h-11 w-11 bg-brand-600 rounded-2xl items-center justify-center text-white font-black text-lg tracking-tighter shadow-sm mb-1">
            HT
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight leading-none">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            {isLoginMode
              ? 'Login to access your internal campaign tracker'
              : 'Sign up to build your developer chronicle portfolio'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-md shrink-0">⚠️</span>
            <div>
              <h4 className="text-[11px] font-extrabold text-rose-950 uppercase tracking-wider">Authentication Error</h4>
              <p className="text-xs text-rose-600 font-medium mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLoginMode && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-neutral-50/50 border border-neutral-200 text-xs px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium placeholder-neutral-400"
                disabled={submitting}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hacker@hacktrack.io"
              className="w-full bg-neutral-50/50 border border-neutral-200 text-xs px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium placeholder-neutral-400"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-50/50 border border-neutral-200 text-xs px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium placeholder-neutral-400"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-750 text-white font-bold text-xs py-4 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing keys...</span>
              </>
            ) : (
              <span>{isLoginMode ? 'Login to Dashboard' : 'Create Developer Profile'}</span>
            )}
          </button>
        </form>

        {/* Toggler Toggle Mode Link */}
        <div className="text-center mt-6 pt-6 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setErrorMessage(null);
            }}
            className="text-xs text-brand-600 hover:text-brand-850 font-bold hover:underline"
            disabled={submitting}
          >
            {isLoginMode
              ? "Don't have an account? Sign up ↗"
              : 'Already registered? Login to your account ↗'}
          </button>
        </div>


      </div>
    </div>
  );
}
