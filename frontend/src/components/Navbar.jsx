import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { LogOut, LayoutDashboard, Cpu, User, Shield } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Guest';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dark-700/60 bg-dark-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-accent-violet to-accent-cyan shadow-[0_0_10px_rgba(139,92,246,0.3)]">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-white">
            Smart<span className="bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent">Coach</span>
          </span>
        </Link>

        {localStorage.getItem('token') && (
          <nav className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-accent-cyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin-dashboard"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/admin-dashboard') ? 'text-accent-rose' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </>
            )}

            <div className="h-4 w-px bg-dark-700/60" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-dark-900 px-3 py-1 text-xs border border-dark-700/40 text-slate-300">
                <User className="h-3.5 w-3.5 text-accent-violet" />
                <span>{username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-dark-700/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-dark-900 hover:text-accent-rose transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
