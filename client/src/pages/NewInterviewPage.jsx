import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { InterviewSetupSchema } from '../validation/schemas.js';
import { api } from '../lib/api.js';

const TOPICS_BY_ROLE = {
  'Frontend Developer': [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 
    'API integration', 'Browser concepts', 'Web performance', 'Accessibility'
  ],
  'Backend Developer': [
    'Node.js', 'Express.js', 'REST APIs', 'Authentication', 'Authorization', 
    'SQL', 'PostgreSQL', 'Database design', 'Security', 'Error handling'
  ],
  'Full-Stack Developer': [
    'React', 'Node.js', 'Express.js', 'APIs', 'Supabase', 
    'Authentication', 'Authorization', 'Database relationships', 'Deployment', 'Git'
  ]
};

export const NewInterviewPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(InterviewSetupSchema),
    defaultValues: {
      target_role: profile?.target_role || 'Frontend Developer',
      interview_type: 'Technical',
      difficulty: profile?.preferred_difficulty || 'Medium',
      total_questions: 5
    }
  });

  const selectedRole = watch('target_role');
  const topics = TOPICS_BY_ROLE[selectedRole] || [];

  useEffect(() => {
    if (topics.length > 0) {
      setValue('topic', topics[0]);
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (values) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const session = await api.startInterview(values);
      navigate(`/interview/${session.id}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start interview session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Practice Engine Configurator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Configure Your Mock Session</h1>
        <p className="text-gray-400 text-sm">Choose target parameters to spawn customized questions from Gemini AI.</p>
      </div>

      <div className="bg-[#0d1222]/40 border border-gray-800 rounded-3xl p-8 shadow-xl shadow-black/30">
        
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="target_role" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Target Role
            </label>
            <select
              id="target_role"
              className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
              {...register('target_role')}
            >
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
            </select>
            {errors.target_role && <p className="text-xs text-red-400 mt-1.5">{errors.target_role.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="interview_type" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Interview Type
              </label>
              <select
                id="interview_type"
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                {...register('interview_type')}
              >
                <option value="Technical">Technical (Focus on Code/Concepts)</option>
                <option value="HR">HR / Behavioral (Focus on Culture)</option>
                <option value="Mixed">Mixed (Core Tech + Behavioral)</option>
              </select>
              {errors.interview_type && <p className="text-xs text-red-400 mt-1.5">{errors.interview_type.message}</p>}
            </div>

            <div>
              <label htmlFor="topic" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Interview Topic
              </label>
              <select
                id="topic"
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                {...register('topic')}
              >
                {topics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.topic && <p className="text-xs text-red-400 mt-1.5">{errors.topic.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="difficulty" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                {...register('difficulty')}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {errors.difficulty && <p className="text-xs text-red-400 mt-1.5">{errors.difficulty.message}</p>}
            </div>

            <div>
              <label htmlFor="total_questions" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <select
                id="total_questions"
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                {...register('total_questions', { valueAsNumber: true })}
              >
                <option value="3">3 Questions (Short Session)</option>
                <option value="5">5 Questions (Standard Session)</option>
                <option value="10">10 Questions (Complete Mock)</option>
              </select>
              {errors.total_questions && <p className="text-xs text-red-400 mt-1.5">{errors.total_questions.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-base py-4 rounded-xl border border-brand-500/30 transition shadow-lg shadow-brand-600/10 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Launching Engine...</span>
              </>
            ) : (
              <>
                <span>Start Mock Interview</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
