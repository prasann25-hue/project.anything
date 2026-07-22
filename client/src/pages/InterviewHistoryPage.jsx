import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { 
  History, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

export const InterviewHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const list = await api.getInterviews();
        setSessions(list);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to retrieve your mock history list.');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 text-sm">Retrieving archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <History className="w-8 h-8 text-brand-500" />
          <span>Interview History</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Review all your past practice sessions and technical reviews.</p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-[#0d1222]/30 border border-gray-800 rounded-3xl overflow-hidden shadow-xl shadow-black/10">
        {sessions.length === 0 ? (
          <div className="p-16 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-700 mx-auto">
              <History className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white">No history records</h3>
              <p className="text-sm text-gray-500">You haven't completed any mock interviews yet. Spawn a session to begin.</p>
            </div>
            <Link 
              to="/interview/new"
              className="inline-flex bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition cursor-pointer"
            >
              Configure Session
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-500 bg-[#0d1222]/60">
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Target Role</th>
                  <th className="px-6 py-4">Date Started</th>
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 text-sm text-gray-300">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-[#0d1222]/40 transition group">
                    <td className="px-6 py-4 font-bold text-white group-hover:text-brand-400 transition">
                      {session.topic}
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-400">
                      {session.target_role} <span className="text-[10px] text-gray-600">• {session.interview_type}</span>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {session.total_questions} Questions
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        session.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
                        session.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                        'bg-red-500/10 text-red-400 border border-red-500/10'
                      }`}>
                        {session.difficulty}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {session.status === 'completed' ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-brand-400 font-medium animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-black">
                      {session.status === 'completed' ? (
                        <span className="text-emerald-400">{session.overall_score}%</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {session.status === 'completed' ? (
                        <Link 
                          to={`/interview/${session.id}/result`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
                        >
                          <span>View Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link 
                          to={`/interview/${session.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
                        >
                          <span>Resume Room</span>
                          <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
