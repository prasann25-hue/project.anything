import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ProfileSchema } from '../validation/schemas';
import { 
  User, 
  Loader2, 
  AlertCircle, 
  Check, 
  Save, 
  GraduationCap, 
  Target, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { z } from 'zod';

type ProfileFormValues = z.infer<typeof ProfileSchema>;

const TECHNOLOGY_POOL = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 
  'Node.js', 'Express.js', 'Next.js', 'Vite', 'Tailwind CSS', 'Redux',
  'Python', 'Django', 'FastAPI', 'Go', 'Java', 'Spring Boot', 'SQL', 
  'PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'Docker', 'Git'
];

export const ProfilePage: React.FC = () => {
  const { refreshProfile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema)
  });

  const knownTechs = watch('known_technologies') || [];
  const weakTechs = watch('weak_technologies') || [];

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profile = await api.getProfile();
      reset({
        full_name: profile.full_name,
        university: profile.university || '',
        current_year: profile.current_year || '',
        target_role: profile.target_role || '',
        experience_level: profile.experience_level || '',
        preferred_difficulty: profile.preferred_difficulty || 'Medium',
        known_technologies: profile.known_technologies || [],
        weak_technologies: profile.weak_technologies || [],
        daily_preparation_minutes: profile.daily_preparation_minutes || 60
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load profile settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleToggleKnownTech = (tech: string) => {
    const next = knownTechs.includes(tech)
      ? knownTechs.filter(t => t !== tech)
      : [...knownTechs, tech];
    
    setValue('known_technologies', next, { shouldValidate: true });
    if (next.includes(tech) && weakTechs.includes(tech)) {
      setValue('weak_technologies', weakTechs.filter(t => t !== tech), { shouldValidate: true });
    }
  };

  const handleToggleWeakTech = (tech: string) => {
    const next = weakTechs.includes(tech)
      ? weakTechs.filter(t => t !== tech)
      : [...weakTechs, tech];
    
    setValue('weak_technologies', next, { shouldValidate: true });
    if (next.includes(tech) && knownTechs.includes(tech)) {
      setValue('known_technologies', knownTechs.filter(t => t !== tech), { shouldValidate: true });
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.updateProfile(values);
      await refreshProfile();
      setSuccessMsg('Profile settings updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 text-sm">Loading settings profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <User className="w-8 h-8 text-brand-500" />
          <span>Profile Settings</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage your academic details, target career preferences, and technologies track.</p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/25 rounded-2xl text-green-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Core Profile Card details */}
        <div className="bg-[#0d1222]/40 border border-gray-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-gray-900 pb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-400" />
            <span>Academic & Level Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                University Name
              </label>
              <input
                id="university"
                type="text"
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                {...register('university')}
              />
              {errors.university && <p className="text-xs text-red-400 mt-1.5">{errors.university.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="current_year" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Current Year
              </label>
              <select
                id="current_year"
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                {...register('current_year')}
              >
                <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                <option value="4th Year (Senior)">4th Year (Senior)</option>
                <option value="Postgraduate / Master">Postgraduate / Master</option>
                <option value="Bootcamp Student">Bootcamp Student</option>
                <option value="Self-Taught">Self-Taught</option>
              </select>
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
                <option value="Undergraduate Student">Undergraduate Student (No work experience)</option>
                <option value="Entry-Level Developer">Entry-Level / Junior (0-1 years experience)</option>
                <option value="Self-Taught / Intermediate">Intermediate (1-2 years experience)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Career & mock targets */}
        <div className="bg-[#0d1222]/40 border border-gray-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-gray-900 pb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-400" />
            <span>Target Role & Mock Setup</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            <div>
              <label htmlFor="daily_preparation_minutes" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Daily Commitment (Mins)
              </label>
              <input
                id="daily_preparation_minutes"
                type="number"
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition"
                {...register('daily_preparation_minutes', { valueAsNumber: true })}
              />
              {errors.daily_preparation_minutes && <p className="text-xs text-red-400 mt-1.5">{errors.daily_preparation_minutes.message}</p>}
            </div>
          </div>
        </div>

        {/* Technology selectors */}
        <div className="bg-[#0d1222]/40 border border-gray-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-gray-900 pb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-400" />
            <span>Technologies Profiles</span>
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Known Technologies
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Weak Technologies
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
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-base py-4 rounded-xl border border-brand-500/30 transition shadow-lg shadow-brand-600/10 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
};
