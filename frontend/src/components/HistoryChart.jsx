import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function HistoryChart({ sessions }) {
  // Sort sessions oldest to newest for chronological chart display
  const sortedSessions = [...sessions]
    .filter(s => s.completed)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const data = sortedSessions.map((session, index) => {
    const dateObj = new Date(session.createdAt);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      name: `Session ${index + 1}`,
      date: formattedDate,
      Score: Math.round(session.overallScore),
      Technical: Math.round(session.technicalScore),
      Clarity: Math.round(session.clarityScore),
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-dark-700/80 bg-dark-900/90 p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400">{payload[0].payload.date}</p>
          <div className="mt-1.5 flex flex-col gap-1">
            <p className="text-sm font-bold text-accent-cyan">
              Overall: <span className="text-white">{payload[0].value}%</span>
            </p>
            <p className="text-[11px] text-accent-violet">
              Tech: <span className="text-slate-300">{payload[0].payload.Technical}%</span>
            </p>
            <p className="text-[11px] text-accent-emerald">
              Clarity: <span className="text-slate-300">{payload[0].payload.Clarity}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-60 w-full">
      {data.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500 font-medium italic">
          No practice history available. Complete your first mock interview to view trends!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1d223a" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Outfit' }}
              stroke="#1d223a"
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              stroke="#1d223a"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Score"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
