import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileSchema } from '../validation/schemas';
import { api } from '../lib/api';
import { z } from 'zod';

type ProfileFormValues = z.infer<typeof ProfileSchema>;

const TECHNOLOGY_POOL = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 
  'Node.js', 'Express.js', 'Next.js', 'Vite', 'Tailwind CSS', 'Redux',
  'Python', 'Django', 'FastAPI', 'Go', 'Java', 'Spring Boot', 'SQL', 
  'PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'Docker', 'Git'
];

export const OnboardingPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      daily_preparation_minutes: 60,
      known_technologies: [],
      weak_technologies: []
    }
  });

  const knownTechs = watch('known_technologies') || [];
  const weakTechs = watch('weak_technologies') || [];

  const handleToggleKnownTech = (tech: string) => {
    const next = knownTechs.includes(tech)
      ? knownTechs.filter(t => t !== tech)
      : [...knownTechs, tech];
    
    setValue('known_technologies', next, { shouldValidate: true });
    // Remove from weak if added to known
    if (next.includes(tech) && weakTechs.includes(tech)) {
      setValue('weak_technologies', weakTechs.filter(t => t !== tech), { shouldValidate: true });
    }
  };

  const handleToggleWeakTech = (tech: string) => {
    const next = weakTechs.includes(tech)
      ? weakTechs.filter(t => t !== tech)
      : [...weakTechs, tech];
    
    setValue('weak_technologies', next, { shouldValidate: true });
    // Remove from known if added to weak
    if (next.includes(tech) && knownTechs.includes(tech)) {
      setValue('known_technologies', knownTechs.filter(t => t !== tech), { shouldValidate: true });
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      await api.updateProfile(values);
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete profile onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 py-16 px-6 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-3xl z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-brand-500" />
            <span className="font-extrabold text-lg text-gray-300">Set Up Your Profile</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Let's personalize your prep engine</h1>
          <p className="text-gray-400 mt-2">This configures Gemini to ask questions tailored exactly to your level and target tech stack.</p>
        </div>

        <div className="bg-[#0d1222]/50 backdrop-blur-md border border-gray-800 rounded-3xl p-8 md:p-10 shadow-xl shadow-black/30">
          
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Step 1: Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">1. Student Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="full_name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                    {...register('full_name')}
                  />
                  {errors.full_name && <p className="text-xs text-red-400 mt-1.5">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label htmlFor="university" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    University / College Name
                  </label>
                  <input
                    id="university"
                    type="text"
                    className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                    placeholder="Stanford University"
                    {...register('university')}
                  />
                  {errors.university && <p className="text-xs text-red-400 mt-1.5">{errors.university.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="current_year" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Current Year of Study
                  </label>
                  <select
                    id="current_year"
                    className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                    {...register('current_year')}
                  >
                    <option value="">Select your year</option>
                    <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                    <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                    <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                    <option value="4th Year (Senior)">4th Year (Senior)</option>
                    <option value="Postgraduate / Master">Postgraduate / Master</option>
                    <option value="Bootcamp Student">Bootcamp Student</option>
                    <option value="Self-Taught">Self-Taught</option>
                  </select>
                  {errors.current_year && <p className="text-xs text-red-400 mt-1.5">{errors.current_year.message}</p>}
                </div>
                <div>
                  <label htmlFor="experience_level" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Experience Level
                  </label>
                  <select
                    id="experience_level"
                    className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                    {...register('experience_level')}
                  >
                    <option value="">Select your level</option>
                    <option value="Undergraduate Student">Undergraduate Student (No work experience)</option>
                    <option value="Entry-Level Developer">Entry-Level / Junior (0-1 years experience)</option>
                    <option value="Self-Taught / Intermediate">Intermediate (1-2 years experience)</option>
                  </select>
                  {errors.experience_level && <p className="text-xs text-red-400 mt-1.5">{errors.experience_level.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Target & Difficulty */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">2. Career Direction & Mock Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="target_role" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Target Role
                  </label>
                  <select
                    id="target_role"
                    className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                    {...register('target_role')}
                  >
                    <option value="">Select role</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                  </select>
                  {errors.target_role && <p className="text-xs text-red-400 mt-1.5">{errors.target_role.message}</p>}
                </div>
                <div>
                  <label htmlFor="preferred_difficulty" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Preferred Difficulty
                  </label>
                  <select
                    id="preferred_difficulty"
                    className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                    {...register('preferred_difficulty')}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {errors.preferred_difficulty && <p className="text-xs text-red-400 mt-1.5">{errors.preferred_difficulty.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="daily_preparation_minutes" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Daily Prep Commitment (Minutes)
                </label>
                <input
                  id="daily_preparation_minutes"
                  type="number"
                  className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                  placeholder="60"
                  {...register('daily_preparation_minutes', { valueAsNumber: true })}
                />
                {errors.daily_preparation_minutes && <p className="text-xs text-red-400 mt-1.5">{errors.daily_preparation_minutes.message}</p>}
              </div>
            </div>

            {/* Step 3: Technology selection */}
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">3. Technical Skillsets</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Technologies You Feel Strong in (Known)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {TECHNOLOGY_POOL.map(tech => {
                    const selected = knownTechs.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleToggleKnownTech(tech)}
                        className={`flex items-center gap-1 text-xs font-medium px-3.5 py-2 rounded-xl transition duration-200 border cursor-pointer ${
                          selected
                            ? 'bg-brand-600 border-brand-500 text-white shadow-sm shadow-brand-500/20'
                            : 'bg-[#080b13] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {tech}
                      </button>
                    );
                  })}
                </div>
                {errors.known_technologies && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.known_technologies.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Technologies You Wish to Practice/Improve (Weak)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {TECHNOLOGY_POOL.map(tech => {
                    const selected = weakTechs.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleToggleWeakTech(tech)}
                        className={`flex items-center gap-1 text-xs font-medium px-3.5 py-2 rounded-xl transition duration-200 border cursor-pointer ${
                          selected
                            ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
                            : 'bg-[#080b13] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {tech}
                      </button>
                    );
                  })}
                </div>
                {errors.weak_technologies && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.weak_technologies.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base py-4 rounded-xl border border-brand-500/30 transition shadow-lg shadow-brand-600/10 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                'Complete Profile Setup'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
