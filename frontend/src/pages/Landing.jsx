import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Cpu, Mail, Lock, User, ArrowRight, CheckCircle, Shield, Users } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'user');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      localStorage.setItem('userRole', role);
      localStorage.setItem('isAdmin', (role === 'admin') ? 'true' : 'false');
      
      if (isLogin) {
        await authAPI.login(username, password);
        navigate('/dashboard');
      } else {
        await authAPI.register(username, password, email, role);
        // Auto-login after successful registration
        await authAPI.login(username, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-950 to-dark-950">
      <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
        {/* Left Column: Marketing Info */}
        <div className="flex flex-col gap-6 text-left">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-violet/15 border border-accent-violet/30 text-accent-violet">
            <Cpu className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-sans">
            Elevate Your <br />
            <span className="bg-gradient-to-r from-accent-violet via-accent-cyan to-accent-emerald bg-clip-text text-transparent">
              Interview Game
            </span>
          </h1>
          <p className="text-base text-slate-400 max-w-md">
            Practice mock interviews in real-time. Antigravity AI evaluates your speech speed, eye contact, and content to provide instant, detailed feedback.
          </p>

          <div className="mt-4 flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle className="h-5 w-5 text-accent-cyan" />
              <span>Real-time speech-to-text teleprompter</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle className="h-5 w-5 text-accent-emerald" />
              <span>Eye contact & body language monitoring</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle className="h-5 w-5 text-accent-violet" />
              <span>Deep OpenAI GPT metrics and model answers</span>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Login/Register Card */}
        <div className="mx-auto w-full max-w-md">
          <div className="glass-panel rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-dark-700/40">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="mt-1.5 text-xs text-slate-400">
                {isLogin ? 'Sign in to access your coach dashboard' : 'Join and unlock live AI feedback'}
              </p>
            </div>

            {/* Role Selection Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all border ${
                  role === 'user'
                    ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                    : 'bg-dark-900/40 border-dark-700/60 text-slate-400 hover:border-accent-cyan/50 hover:text-slate-300'
                }`}
              >
                <Users className="h-4 w-4" />
                User
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all border ${
                  role === 'admin'
                    ? 'bg-accent-rose/20 border-accent-rose text-accent-rose shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-dark-900/40 border-dark-700/60 text-slate-400 hover:border-accent-rose/50 hover:text-slate-300'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-accent-rose/10 border border-accent-rose/20 p-3 text-xs text-accent-rose text-center">
                {error}
              </div>
            )}

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pr-10 glass-input"
                  />
                  <User className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pr-10 glass-input"
                    />
                    <Mail className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 glass-input"
                  />
                  <Lock className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full glow-btn-violet flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-slate-400 hover:text-accent-cyan underline transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
