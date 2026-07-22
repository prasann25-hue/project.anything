import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { 
  Award, 
  PlusCircle, 
  ArrowRight, 
  History, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load dashboard statistics. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 text-sm">Aggregating stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 max-w-2xl mx-auto">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  const { totalCompleted, averageScore, topicProgress, recentSessions } = stats;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome header & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-brand-900/15 via-[#0d1222]/40 to-transparent border border-gray-800 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-2 max-w-xl">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Practice technical concepts with <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">AI Coaches</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Select a target framework/language and challenge yourself in real-time. Review missing points and generate a custom AI study plan.
          </p>
        </div>
        <Link 
          to="/interview/new"
          className="flex-shrink-0 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm px-6 py-4 rounded-xl border border-brand-500/30 transition shadow-lg shadow-brand-600/10 flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Start New Interview</span>
        </Link>
      </div>

      {/* Numerical Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Interviews completed */}
        <div className="bg-[#0d1222]/40 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-gray-700 transition">
          <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400 border border-brand-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Interviews Completed</p>
            <p className="text-2xl font-black text-white mt-1">{totalCompleted}</p>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-[#0d1222]/40 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-gray-700 transition">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Average Session Score</p>
            <p className="text-2xl font-black text-white mt-1">
              {totalCompleted > 0 ? `${averageScore}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Active Study Guide status */}
        <div className="bg-[#0d1222]/40 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-gray-700 transition">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Topics Mastered</p>
            <p className="text-2xl font-black text-white mt-1">
              {topicProgress.filter((t: any) => t.best_score >= 80).length} / {topicProgress.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Recent Interviews list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              <span>Recent Sessions</span>
            </h2>
            {recentSessions.length > 0 && (
              <Link to="/history" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="bg-[#0d1222]/30 border border-gray-800 rounded-3xl overflow-hidden">
            {recentSessions.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <p className="text-gray-400 text-sm">No interview sessions found. Start a new one to begin!</p>
                <Link 
                  to="/interview/new"
                  className="inline-flex items-center gap-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
                >
                  Configure Mock Session
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-900">
                {recentSessions.map((session: any) => (
                  <div key={session.id} className="p-6 flex items-center justify-between hover:bg-[#0d1222]/50 transition group">
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-brand-400 transition">{session.topic}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          session.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
                          session.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                          'bg-red-500/10 text-red-400 border border-red-500/10'
                        }`}>
                          {session.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {session.target_role} • {session.interview_type} • {session.total_questions} Questions
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {session.status === 'completed' ? (
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-emerald-400">{session.overall_score}%</p>
                          <Link 
                            to={`/interview/${session.id}/result`} 
                            className="text-xs font-semibold text-gray-400 hover:text-white transition flex items-center gap-0.5 mt-0.5"
                          >
                            Report <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] font-semibold bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2 py-1 rounded-md">
                            Active
                          </span>
                          <Link 
                            to={`/interview/${session.id}`} 
                            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition flex items-center gap-0.5 mt-1.5"
                          >
                            Resume <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Topic progress list */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span>Topic Mastery</span>
          </h2>

          <div className="bg-[#0d1222]/30 border border-gray-800 rounded-3xl p-6 space-y-5">
            {topicProgress.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Topics and progress bars will show up as you complete evaluations.</p>
            ) : (
              topicProgress.map((topic: any) => (
                <div key={topic.id} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-300">{topic.topic}</span>
                    <span className="text-gray-400">Best: <span className="font-bold text-white">{topic.best_score}%</span></span>
                  </div>
                  <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        topic.best_score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                        topic.best_score >= 50 ? 'bg-gradient-to-r from-brand-500 to-violet-400' :
                        'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${topic.best_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>{topic.attempts} attempts</span>
                    <span>Avg: {topic.average_score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
