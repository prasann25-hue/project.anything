import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, CalendarDays, BarChart4 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: "Gemini AI Coach",
      desc: "Get real-time, context-specific technical and behavioral questions derived directly from your experience level."
    },
    {
      icon: ShieldCheck,
      title: "Honest Evaluations",
      desc: "We analyze answers based on correctness, completeness, and communication quality, highlighting correct & missing points."
    },
    {
      icon: CalendarDays,
      title: "7-Day AI Study Plans",
      desc: "If you struggle in specific areas, generate an instant day-by-day learning layout to patch your knowledge gaps."
    },
    {
      icon: BarChart4,
      title: "Topic Mastery Metrics",
      desc: "Monitor your average scores, total sessions completed, and topic-by-topic analytics on your profile."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="max-w-7xl mx-auto w-full px-8 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-500 animate-pulse" />
          <span className="font-extrabold text-xl bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
            CareerPilot AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl border border-brand-500/30 transition-all duration-200 shadow-md shadow-brand-500/10 flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-all">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl border border-brand-500/30 transition-all duration-200 shadow-md shadow-brand-500/10"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto w-full px-8 py-20 text-center z-10 flex-grow flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-4 py-2 rounded-full text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Real-Time AI Technical Interview Coach</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight max-w-4xl mx-auto">
          Master Your Tech Interviews with{" "}
          <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient">
            CareerPilot AI
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
          Prepare for frontend, backend, or full-stack software development roles. Get evaluated instantly by Gemini on your code, logic, and communication.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link 
            to={user ? "/dashboard" : "/register"} 
            className="bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-bold text-base px-8 py-4 rounded-2xl border border-brand-400/20 transition-all duration-300 transform hover:scale-[1.02] shadow-xl shadow-brand-500/10 flex items-center justify-center gap-2"
          >
            Start Preparing Now <ArrowRight className="w-5 h-5" />
          </Link>
          {!user && (
            <Link 
              to="/login" 
              className="bg-gray-900/60 hover:bg-gray-800/80 text-gray-300 font-semibold text-base px-8 py-4 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 flex items-center justify-center"
            >
              Demo Login
            </Link>
          )}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-32 text-left">
          {features.map((f, i) => (
            <div key={i} className="p-8 bg-[#0d1222]/40 backdrop-blur-md border border-gray-800 rounded-3xl hover:border-brand-500/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-gray-900 bg-gray-950/20 py-8 z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} CareerPilot AI. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Supabase + Gemini Demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
