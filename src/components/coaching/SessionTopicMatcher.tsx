import React, { useState } from 'react';
import {
  Code2,
  FileText,
  MessageSquare,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { CoachCard as CoachCardType, CoachDetail } from '../../types/api';
import { useCoaches } from '../../services/queries';

interface SessionTopicMatcherProps {
  onBookCoach: (coach: CoachCardType | CoachDetail) => void;
  navigate?: (path: string) => void;
}

export const SessionTopicMatcher: React.FC<SessionTopicMatcherProps> = ({
  onBookCoach,
  navigate,
}) => {
  const { data } = useCoaches();
  const coaches = data?.items || [];
  const [activeTopic, setActiveTopic] = useState<string>('technical');

  const topics = [
    {
      id: 'technical',
      label: 'Technical Mock Coding',
      badge: 'Live Coding & Algorithms',
      icon: Code2,
      headline: 'Simulate Real Technical Screening Under Pressure',
      description:
        'Live 60-minute coding simulation on data structures, frontend frameworks (React/TypeScript), or backend system architecture with senior engineers from top Philippine tech companies.',
      agenda: [
        { time: '00–10m', title: 'Problem statement breakdown & constraints analysis' },
        { time: '10–40m', title: 'Live coding implementation & edge-case debugging' },
        { time: '40–50m', title: 'Code complexity optimization (Time & Space O(N))' },
        { time: '50–60m', title: 'Rubric score assessment & written action items' },
      ],
      filterTag: 'Frontend & UI',
    },
    {
      id: 'resume',
      label: 'ATS Resume & Portfolio Audit',
      badge: 'Recruiter Screening',
      icon: FileText,
      headline: 'Transform Your Resume into an Interview Magnet',
      description:
        'Line-by-line inspection of your project bullet points, quantified impact metrics, GitHub repos, and Figma design case studies to pass automated ATS filters and recruiter screenings.',
      agenda: [
        { time: '00–15m', title: 'ATS keyword parser audit & formatting diagnostic' },
        { time: '15–35m', title: 'Bullet point rewrite with STAR metrics (X achieved by Y)' },
        { time: '35–50m', title: 'GitHub & portfolio project presentation polish' },
        { time: '50–60m', title: 'Final customized PDF export recommendations' },
      ],
      filterTag: 'Resume Review',
    },
    {
      id: 'behavioral',
      label: 'STAR Behavioral & OJT Readiness',
      badge: 'HR & Culture Fit',
      icon: MessageSquare,
      headline: 'Master Behavioral Questions & Workplace Etiquette',
      description:
        'Structured practice answering "Tell me about a time when...", situational conflict questions, and university practicum readiness with senior talent leaders and tech hiring managers.',
      agenda: [
        { time: '00–10m', title: 'Personal pitch & narrative storytelling alignment' },
        { time: '10–35m', title: 'Simulation of top 5 behavioral & situational prompts' },
        { time: '35–50m', title: 'STAR structure correction (Situation, Task, Action, Result)' },
        { time: '50–60m', title: 'Confidence coaching & questions to ask the interviewer' },
      ],
      filterTag: 'STAR Behavioral',
    },
  ];

  const currentTopic = topics.find((t) => t.id === activeTopic) || topics[0];

  // Find matching coaches for this topic
  const matchingCoaches = coaches
    .filter((c) =>
      (c.expertise || []).some((exp: string) =>
        exp.toLowerCase().includes(currentTopic.filterTag.toLowerCase())
      )
    )
    .slice(0, 3);

  const displayCoaches = matchingCoaches.length > 0 ? matchingCoaches : coaches.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7ff] text-[#3f58b2] text-xs font-bold uppercase tracking-wider font-accent border border-[#3f58b2]/20">
            <Compass className="w-3.5 h-3.5 text-[#3f58b2]" />
            <span>Coaching Focus Tracks</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-[#021F53]">
            What Interview Round Are You Preparing For?
          </h3>
        </div>

        {/* Topic Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto">
          {topics.map((topic) => {
            const Icon = topic.icon;
            const isSelected = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setActiveTopic(topic.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#021F53] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ff9b00]' : 'text-slate-400'}`} />
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Topic Syllabus & 60-min Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="stamp-badge bg-amber-50 text-amber-950 border border-amber-300">
              {currentTopic.badge}
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-[#021F53] font-headline">
              {currentTopic.headline}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {currentTopic.description}
            </p>
          </div>

          {/* 60-Minute Session Timeline */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Typical 60-Minute Live Agenda:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentTopic.agenda.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
                >
                  <span className="text-[11px] font-bold text-[#3f58b2] bg-white px-2 py-0.5 rounded-md border border-[#3f58b2]/20 font-mono flex-shrink-0">
                    {item.time}
                  </span>
                  <span className="text-xs text-slate-700 font-medium leading-snug">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Matched Verified Coaches */}
        <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <span className="text-xs font-bold text-[#021F53] uppercase tracking-wider font-headline">
              Specialized Coaches for this Track
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">Live Slots Available</span>
          </div>

          <div className="space-y-3">
            {displayCoaches.map((coach) => (
              <div
                key={coach.slug}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#3f58b2]/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={coach.avatar_url || undefined}
                    alt={coach.display_name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#021F53] truncate block">{coach.display_name}</span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {coach.headline}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBookCoach(coach)}
                  className="px-3 py-1.5 bg-[#021F53] hover:bg-[#3f58b2] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex-shrink-0 cursor-pointer"
                >
                  Book 1-on-1
                </button>
              </div>
            ))}
          </div>

          {navigate && (
            <button
              type="button"
              onClick={() => navigate('/coaches')}
              className="w-full py-2.5 text-center text-xs font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore All {coaches.length || 6}+ Industry Coaches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
