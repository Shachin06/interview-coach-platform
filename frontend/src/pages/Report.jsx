import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import RadarChartComponent from '../components/RadarChartComponent';
import { Award, Check, AlertTriangle, ArrowLeft, Video, Download } from 'lucide-react';

export default function Report() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await interviewAPI.getSession(sessionId);
        setSession(data);
      } catch (err) {
        console.error('Failed to load session report:', err);
        setError('Failed to retrieve interview metrics. Verify connection.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-slate-400 bg-dark-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-cyan border-t-transparent" />
        <span className="ml-3 text-sm">Processing score diagnostics...</span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-slate-400">
        <AlertTriangle className="mx-auto h-12 w-12 text-accent-rose mb-3 animate-pulse" />
        <p className="font-bold text-white mb-2">Error Loading Report</p>
        <p className="text-xs mb-6">{error || 'Session session not found.'}</p>
        <Link to="/dashboard" className="glow-btn-violet">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Parse the transcript JSON saved by AI service
  let reportData = { feedback: '', answers: [] };
  try {
    if (session.transcriptJson) {
      reportData = JSON.parse(session.transcriptJson);
    }
  } catch (e) {
    console.error('Failed to parse transcript JSON:', e);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Interview Analysis Report
        </h1>
        <p className="text-sm text-slate-400">
          Session ID: #{session.id} | Domain: {session.category} ({session.difficulty})
        </p>
      </div>

      {/* Grid Dashboard */}
      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        
        {/* Left Column: Overall score & Radar Chart (2/5 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 text-center border-accent-cyan/20 bg-gradient-to-tr from-dark-900 to-accent-cyan/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Overall Score
            </h3>
            <div className="inline-flex items-baseline gap-1">
              <span className="text-6xl font-extrabold text-white tracking-tight">
                {Math.round(session.overallScore)}
              </span>
              <span className="text-xl font-bold text-accent-cyan">%</span>
            </div>
            <p className="mt-3.5 text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {reportData.feedback || 'Your report shows solid structural foundations. Look at details below to polish weak key concepts.'}
            </p>
          </div>

          {/* Radar Chart */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 self-start">
              Performance Breakdown
            </h4>
            <RadarChartComponent scores={session} />
          </div>

          {/* Performance Trajectory - Percentage Scores */}
          <div className="glass-panel rounded-2xl p-6 border border-dark-700/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Performance Trajectory
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Technical Knowledge', value: Math.round(session.technicalScore), color: 'bg-accent-cyan' },
                { label: 'Communication Clarity', value: Math.round(session.clarityScore), color: 'bg-accent-violet' },
                { label: 'Confidence Level', value: Math.round(session.confidenceScore), color: 'bg-accent-emerald' },
                { label: 'Behavioral Skills', value: Math.round(session.behaviorScore), color: 'bg-accent-rose' },
              ].map((metric, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300 font-medium">{metric.label}</span>
                    <span className="text-sm font-bold text-white">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-dark-800/40 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`${metric.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recorded Webcam Playback */}
          {session.videoPath && (
            <div className="glass-panel rounded-2xl p-5 border border-dark-700/60 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="h-4 w-4 text-accent-rose" />
                Session Video Review
              </h4>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-dark-950 border border-dark-950 shadow-md">
                <video
                  src={session.videoPath}
                  controls
                  className="h-full w-full object-cover scale-x-[-1]" // mirror replay to match record view
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Q&A evaluation timeline (3/5 width) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 text-left border border-dark-700/60">
            <h3 className="text-lg font-bold text-white">Transcript Critique</h3>
            
            {reportData.answers.length === 0 ? (
              <div className="text-xs text-slate-500 italic">No Q&A details captured in this run.</div>
            ) : (
              <div className="flex flex-col gap-8">
                {reportData.answers.map((ans, idx) => (
                  <div key={idx} className="relative flex flex-col gap-4 pl-4 border-l-2 border-dark-700/80">
                    <div className="absolute -left-1.5 top-0 flex h-3 w-3 items-center justify-center rounded-full bg-accent-violet border border-dark-950" />
                    
                    {/* Question Header */}
                    <div>
                      <span className="text-[10px] font-bold text-accent-violet uppercase tracking-wider">
                        Question {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-normal mt-0.5">
                        {ans.questionText}
                      </h4>
                    </div>

                    {/* Spoken Answer */}
                    <div className="rounded-lg bg-dark-950/45 p-3.5 border border-dark-800/40">
                      <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Spoken Response
                      </h5>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans">
                        {ans.userAnswer || 'No answer provided'}
                      </p>
                    </div>

                    {/* Improvement critique */}
                    <div className="rounded-lg bg-accent-violet/5 p-3.5 border border-accent-violet/10">
                      <h5 className="text-[10px] font-semibold text-accent-violet uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Critique & Suggestions
                      </h5>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans">
                        {ans.critique}
                      </p>
                    </div>

                    {/* Model guide Answer */}
                    <div className="rounded-lg bg-accent-emerald/5 p-3.5 border border-accent-emerald/10">
                      <h5 className="text-[10px] font-semibold text-accent-emerald uppercase tracking-wider flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Ideal Answer Guide
                      </h5>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans font-medium">
                        {ans.idealAnswer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
