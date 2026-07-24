import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { Users, TrendingUp, Calendar, Award, Search, Filter } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    async function loadAllSessions() {
      try {
        // In a real app, this would fetch from an admin endpoint
        const data = await interviewAPI.getHistory();
        setAllSessions(data);
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllSessions();
  }, []);

  const completedSessions = allSessions.filter((s) => s.completed);
  const categories = ['All', ...new Set(allSessions.map(s => s.category))];

  const filteredSessions = completedSessions.filter(session => {
    const matchesSearch = session.id.toString().includes(searchTerm) || 
                          (session.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || session.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const avgScores = {
    overall: completedSessions.length 
      ? Math.round(completedSessions.reduce((acc, s) => acc + s.overallScore, 0) / completedSessions.length)
      : 0,
    technical: completedSessions.length
      ? Math.round(completedSessions.reduce((acc, s) => acc + s.technicalScore, 0) / completedSessions.length)
      : 0,
    clarity: completedSessions.length
      ? Math.round(completedSessions.reduce((acc, s) => acc + s.clarityScore, 0) / completedSessions.length)
      : 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor all candidate interviews and performance metrics
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <div className="glass-card rounded-xl p-5 border border-dark-700/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Candidates</div>
              <div className="text-2xl font-bold text-white">{new Set(completedSessions.map(s => s.user?.id)).size}</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-dark-700/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-violet/15 text-accent-violet">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Completed Interviews</div>
              <div className="text-2xl font-bold text-white">{completedSessions.length}</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-dark-700/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-emerald/15 text-accent-emerald">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Avg Overall Score</div>
              <div className="text-2xl font-bold text-white">{avgScores.overall}%</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-dark-700/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-rose/15 text-accent-rose">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Avg Technical Score</div>
              <div className="text-2xl font-bold text-white">{avgScores.technical}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glass-panel rounded-2xl p-4 border border-dark-700/40 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Session ID or Username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 glass-input"
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
        </div>
        <div className="flex gap-2">
          <Filter className="h-5 w-5 text-slate-500 self-center" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="glass-input bg-dark-950/50 border border-dark-700/60 text-slate-200"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-dark-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-cyan border-t-transparent" />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 border border-dark-700/40 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/40">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Session ID</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Candidate</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Category</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Overall %</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Technical %</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Clarity %</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Confidence %</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Behavior %</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-slate-400">
                    No interviews found
                  </td>
                </tr>
              ) : (
                filteredSessions.map(session => (
                  <tr key={session.id} className="border-b border-dark-700/20 hover:bg-dark-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-300">#{session.id}</td>
                    <td className="py-3 px-4 text-slate-300">{session.user?.username || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 rounded bg-dark-800 text-xs text-slate-300 border border-dark-700/40">
                        {session.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-dark-800/40 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-accent-cyan h-full rounded-full"
                            style={{ width: `${Math.round(session.overallScore)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-8">{Math.round(session.overallScore)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-dark-800/40 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-accent-violet h-full rounded-full"
                            style={{ width: `${Math.round(session.technicalScore)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-8">{Math.round(session.technicalScore)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-dark-800/40 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-accent-emerald h-full rounded-full"
                            style={{ width: `${Math.round(session.clarityScore)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-8">{Math.round(session.clarityScore)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-dark-800/40 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-accent-rose h-full rounded-full"
                            style={{ width: `${Math.round(session.confidenceScore)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-8">{Math.round(session.confidenceScore)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-dark-800/40 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-accent-orange h-full rounded-full"
                            style={{ width: `${Math.round(session.behaviorScore)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-8">{Math.round(session.behaviorScore)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/report/${session.id}`)}
                        className="text-xs font-semibold text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
