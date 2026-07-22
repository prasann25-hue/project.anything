import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

export const StudyPlanPage = () => {
  const [searchParams] = useSearchParams();
  const activePlanId = searchParams.get('activePlanId');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [completedDays, setCompletedDays] = useState({});

  const loadPlans = async (selectId) => {
    try {
      setLoading(true);
      const list = await api.getStudyPlans();
      setPlans(list);

      const targetId = selectId || activePlanId || (list.length > 0 ? list[0].id : null);
      if (targetId) {
        const fullPlan = await api.getStudyPlanById(targetId);
        setActivePlan(fullPlan);
        setSelectedDayIdx(0);
        
        const stored = localStorage.getItem(`completed-days-${targetId}`);
        if (stored) {
          setCompletedDays(JSON.parse(stored));
        } else {
          setCompletedDays({});
        }
      } else {
        setActivePlan(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load study plan schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [activePlanId]);

  const handleCreateNewPlan = async () => {
    try {
      setGenerating(true);
      setErrorMsg(null);
      const newPlan = await api.createStudyPlan();
      await loadPlans(newPlan.id);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate study plan.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleDayComplete = (dayNum) => {
    if (!activePlan) return;
    const planId = activePlan.id;
    const key = `${dayNum}`;
    const nextCompleted = {
      ...completedDays,
      [key]: !completedDays[key]
    };
    setCompletedDays(nextCompleted);
    localStorage.setItem(`completed-days-${planId}`, JSON.stringify(nextCompleted));
  };

  const handleSelectPlan = async (id) => {
    try {
      setLoading(true);
      const fullPlan = await api.getStudyPlanById(id);
      setActivePlan(fullPlan);
      setSelectedDayIdx(0);
      const stored = localStorage.getItem(`completed-days-${id}`);
      if (stored) {
        setCompletedDays(JSON.parse(stored));
      } else {
        setCompletedDays({});
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load selected plan.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !generating) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 text-sm">Loading study guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-brand-500" />
            <span>AI Preparation Plans</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Follow customized 7-day study paths compiled by Gemini based on your targets & weak areas.
          </p>
        </div>

        <button
          onClick={handleCreateNewPlan}
          disabled={generating}
          className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm px-5 py-3 rounded-xl border border-brand-500/30 transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate New Plan</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!activePlan ? (
        <div className="bg-[#0d1222]/30 border border-gray-800 rounded-3xl p-16 text-center space-y-6">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400 border border-brand-500/20 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">No active study plans</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Complete a mock interview and compile a report first, or trigger an on-demand plan based on your onboarding profile preferences.
            </p>
          </div>
          <button
            onClick={handleCreateNewPlan}
            disabled={generating}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition cursor-pointer"
          >
            Generate Day-by-Day Guide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-4 lg:col-span-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Your Study Guides</h3>
            <div className="bg-[#0d1222]/30 border border-gray-800 rounded-2xl p-4 space-y-3">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlan(p.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                    p.id === activePlan.id 
                      ? 'bg-brand-600/15 border-brand-500/30 text-brand-400' 
                      : 'bg-transparent border-transparent hover:bg-gray-800/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{p.plan_title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Created: {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex border border-gray-800 bg-[#0d1222]/30 p-1.5 rounded-2xl overflow-x-auto gap-2">
              {activePlan.plan_content.days.map((d, idx) => {
                const selected = idx === selectedDayIdx;
                const done = !!completedDays[`${d.day}`];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`flex-1 text-center py-3.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer flex-shrink-0 flex items-center justify-center gap-1.5 ${
                      selected 
                        ? 'bg-brand-600 border-brand-500 text-white font-bold' 
                        : done
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                    }`}
                  >
                    {done && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span>Day {d.day}</span>
                  </button>
                );
              })}
            </div>

            {activePlan.plan_content.days[selectedDayIdx] && (
              <div className="bg-[#0d1222]/40 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-900 pb-5 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase bg-brand-500/15 text-brand-400 border border-brand-500/20 px-2.5 py-1 rounded-md">
                      Day {activePlan.plan_content.days[selectedDayIdx].day} Challenge
                    </span>
                    <h2 className="text-xl font-bold text-white mt-2">
                      {activePlan.plan_content.days[selectedDayIdx].topic}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-4 h-4 text-brand-400" />
                      <span>{activePlan.plan_content.days[selectedDayIdx].duration_minutes} Mins</span>
                    </div>

                    <button
                      onClick={() => handleToggleDayComplete(activePlan.plan_content.days[selectedDayIdx].day)}
                      className={`text-xs font-semibold px-4 py-2 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                        completedDays[`${activePlan.plan_content.days[selectedDayIdx].day}`]
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-brand-600 border-brand-500 text-white hover:bg-brand-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {completedDays[`${activePlan.plan_content.days[selectedDayIdx].day}`]
                          ? 'Completed (Click to Reopen)'
                          : 'Mark Completed'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-400" /> Objective
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed font-semibold">
                      {activePlan.plan_content.days[selectedDayIdx].objective}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-gray-900">
                    <div className="space-y-2 bg-[#080b13] border border-gray-900 p-5 rounded-2xl">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <PlayCircle className="w-4 h-4 text-brand-400" /> Learning Activities
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {activePlan.plan_content.days[selectedDayIdx].learning_activity}
                      </p>
                    </div>

                    <div className="space-y-2 bg-[#080b13] border border-gray-900 p-5 rounded-2xl">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-400" /> Practice Challenges
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {activePlan.plan_content.days[selectedDayIdx].practice_activity}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
