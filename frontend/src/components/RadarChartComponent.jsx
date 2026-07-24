import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export default function RadarChartComponent({ scores }) {
  const data = [
    { subject: 'Technical', A: scores.technicalScore || 0, fullMark: 100 },
    { subject: 'Clarity', A: scores.clarityScore || 0, fullMark: 100 },
    { subject: 'Confidence', A: scores.confidenceScore || 0, fullMark: 100 },
    { subject: 'Behavioral', A: scores.behaviorScore || 0, fullMark: 100 },
    { subject: 'Overall', A: scores.overallScore || 0, fullMark: 100 },
  ];

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" radius="75%" data={data}>
          <PolarGrid stroke="#2c3358" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Outfit' }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#475569', fontSize: 10 }}
            stroke="transparent"
          />
          <Radar
            name="Scores"
            dataKey="A"
            stroke="#8b5cf6"
            fill="url(#radarGradient)"
            fillOpacity={0.65}
          />
          {/* Custom Gradient definitions */}
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
