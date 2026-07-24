import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import HistoryChart from '../components/HistoryChart';
import { Play, ClipboardList, Award, Calendar, BarChart2, ChevronRight, Shield } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    async function loadData() {
      try {
        const data = await interviewAPI.getHistory();
        setSessions(data);
      } catch (err) {
        console.error('Failed to load interview history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const completedSessions = sessions.filter((s) => s.completed);
  
  // Calculate average scores
  const avgOverall = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + s.overallScore, 0) / completedSessions.length)
    : 0;

  const avgTechnical = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + s.technicalScore, 0) / completedSessions.length)
    : 0;

  const avgClarity = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + s.clarityScore, 0) / completedSessions.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin Alert Banner */}
      {isAdmin && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-accent-rose/10 to-accent-rose/5 border border-accent-rose/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-accent-rose" />
            <div>
              <div className="text-sm font-semibold text-accent-rose">Admin Access Enabled</div>
              <div className="text-xs text-slate-400">View all users' performance metrics and scheduled interviews</div>
            </div>
          </div>
          <Link to="/admin-dashboard" className="px-4 py-2 rounded-lg bg-accent-rose/20 hover:bg-accent-rose/30 text-accent-rose text-sm font-semibold transition-colors">
            Go to Admin Dashboard →
          </Link>
        </div>
      )}

      {/* Welcome & Start Call-to-Action */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Interview Command Center
          </h1>
          <p className="text-sm text-slate-400">
            Welcome back! Monitor your metrics and start dynamic practice mock sessions.
          </p>
        </div>
        <Link to="/question-selection" className="glow-btn-cyan flex items-center gap-2 max-w-max">
          <Play className="h-4 w-4 fill-dark-950" />
          Start Mock Interview
        </Link>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-cyan border-t-transparent" />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left Column: Stats & Charts (2/3 width on wide screens) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Quick Metrics Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="glass-card rounded-xl p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{avgOverall}%</div>
                  <div className="text-xs text-slate-400 font-medium">Average Score</div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-violet/15 text-accent-violet">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{completedSessions.length}</div>
                  <div className="text-xs text-slate-400 font-medium">Completed Runs</div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-emerald/15 text-accent-emerald">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {sessions.length > 0 ? sessions[0].category.split(' ')[0] : 'N/A'}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Active Category</div>
                </div>
              </div>
            </div>

            {/* Score trends chart */}
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-accent-cyan" />
                Performance Trajectory
              </h3>
              <HistoryChart sessions={sessions} />
            </div>
          </div>

          {/* Right Column: Recent Sessions (1/3 width) */}
          <div className="flex flex-col">
            <div className="glass-panel rounded-xl p-6 flex flex-col h-full">
              <h3 className="text-lg font-bold text-white mb-4">Practice Log</h3>
              
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
                  <Calendar className="h-10 w-10 text-slate-600 mb-2" />
                  <p className="text-xs">No interviews recorded yet.</p>
                  <Link to="/question-selection" className="mt-3 text-xs text-accent-cyan underline">
                    Start a session now
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[380px] custom-scroll-y pr-1">
                  {sessions.map((session) => {
                    const dateStr = new Date(session.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          if (session.completed) {
                            navigate(`/report/${session.id}`);
                          } else {
                            // Resume if incomplete? Normally start a new one, but let's go to report or select
                            navigate(`/question-selection`);
                          }
                        }}
                        className="glass-card rounded-xl p-4 flex items-center justify-between cursor-pointer border border-dark-700/30 hover:bg-dark-900/80 transition-all"
                      >
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-xs font-semibold text-slate-300">
                            {session.category}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dateStr}
                          </span>
                          <span className={`inline-block w-max rounded px-1.5 py-0.5 text-[8px] font-bold ${
                            session.difficulty === 'Easy' ? 'bg-accent-emerald/10 text-accent-emerald' :
                            session.difficulty === 'Medium' ? 'bg-accent-cyan/10 text-accent-cyan' :
                            'bg-accent-rose/10 text-accent-rose'
                          }`}>
                            {session.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {session.completed ? (
                            <span className="text-lg font-bold text-accent-cyan">
                              {Math.round(session.overallScore)}%
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold italic">
                              Incomplete
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
