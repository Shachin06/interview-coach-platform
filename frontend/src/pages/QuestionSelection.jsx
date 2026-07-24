import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { Code, Users, Network, Compass, Sparkles, AlertCircle, Shield, Terminal, Zap, BarChart3 } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'Software Engineering',
    title: 'Software Engineering',
    desc: 'Coding practices, abstract classes, HashMap indexing, default interfaces, and algorithms.',
    icon: Code,
    color: 'text-accent-cyan bg-accent-cyan/15 border-accent-cyan/20',
  },
  {
    id: 'Behavioral',
    title: 'Behavioral Prep',
    desc: 'Resolve conflicts, teamwork, structured responses using STAR methodology, and soft skills.',
    icon: Users,
    color: 'text-accent-emerald bg-accent-emerald/15 border-accent-emerald/20',
  },
  {
    id: 'System Design',
    title: 'System Design',
    desc: 'Scalability setups, caching, pub-sub architectures, CDN proxies, and database replicas.',
    icon: Network,
    color: 'text-accent-violet bg-accent-violet/15 border-accent-violet/20',
  },
  {
    id: 'Product Management',
    title: 'Product Strategy',
    desc: 'Success metrics formulation, story conversions, growth loops, and launch priorities.',
    icon: Compass,
    color: 'text-accent-rose bg-accent-rose/15 border-accent-rose/20',
  },
  {
    id: 'DevOps',
    title: 'DevOps Engineer',
    desc: 'Infrastructure as code, CI/CD pipelines, monitoring, disaster recovery, and cloud architecture.',
    icon: Terminal,
    color: 'text-accent-orange bg-accent-orange/15 border-accent-orange/20',
  },
  {
    id: 'Security',
    title: 'Security Engineer',
    desc: 'Authentication, encryption, vulnerability assessment, compliance, and threat modeling.',
    icon: Shield,
    color: 'text-accent-pink bg-accent-pink/15 border-accent-pink/20',
  },
  {
    id: 'Frontend',
    title: 'Frontend Engineer',
    desc: 'React, Angular, Vue.js, responsive design, performance optimization, and state management.',
    icon: Zap,
    color: 'text-accent-yellow bg-accent-yellow/15 border-accent-yellow/20',
  },
  {
    id: 'Data Science',
    title: 'Data Science & ML',
    desc: 'Machine learning, statistics, Python, data analysis, feature engineering, and model evaluation.',
    icon: BarChart3,
    color: 'text-accent-indigo bg-accent-indigo/15 border-accent-indigo/20',
  },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function QuestionSelection() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Software Engineering');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartSession = async () => {
    setLoading(true);
    setError('');
    try {
      // Setup the session in the backend DB
      const result = await interviewAPI.startSession(selectedCategory, selectedDifficulty);
      if (result.sessionId) {
        navigate(`/interview/${result.sessionId}`, { 
          state: { category: selectedCategory, difficulty: selectedDifficulty } 
        });
      }
    } catch (err) {
      console.error(err);
      setError('Could not initialize session. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-sans">
          Select Interview Domain
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Customize your category and difficulty. The AI coach will compile questions and analyze metrics.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-accent-rose/15 border border-accent-rose/30 p-4 text-xs text-accent-rose flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`glass-card rounded-2xl p-6 cursor-pointer text-left flex flex-col gap-4 border transition-all duration-300 ${
                isSelected 
                  ? 'border-accent-cyan shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-dark-900/95 scale-[1.02]' 
                  : 'border-dark-700/30 hover:border-dark-700/80 bg-dark-900/40'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${cat.color}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg font-sans">{cat.title}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Difficulty Level Bar */}
      <div className="mt-8 glass-panel rounded-2xl p-6 border border-dark-700/40">
        <h3 className="text-sm font-semibold text-slate-300 text-left mb-4 uppercase tracking-wider">
          Difficulty Setting
        </h3>
        <div className="flex gap-4">
          {DIFFICULTIES.map((diff) => {
            const isSelected = selectedDifficulty === diff;

            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all border ${
                  isSelected
                    ? 'bg-accent-violet border-accent-violet text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'bg-dark-950/50 border-dark-700/60 text-slate-400 hover:border-dark-700 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleStartSession}
        disabled={loading}
        className="mt-8 w-full glow-btn-cyan flex items-center justify-center gap-2 font-bold py-3.5"
      >
        <Sparkles className="h-5 w-5 fill-dark-950 text-dark-950" />
        {loading ? 'Assembling Room...' : 'Confirm and Enter Interview Room'}
      </button>
    </div>
  );
}
