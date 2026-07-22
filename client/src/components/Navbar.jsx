import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Award, GraduationCap } from 'lucide-react';

export const Navbar = () => {
  const { profile } = useAuth();

  return (
    <header className="h-16 bg-[#0d1222]/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {profile?.university && (
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{profile.university}</span>
          </div>
        )}
        {profile?.target_role && (
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Award className="w-3.5 h-3.5" />
            <span>Targeting: {profile.target_role}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-200">{profile?.full_name || 'Student'}</p>
          <p className="text-xs text-gray-500">{profile?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-brand-500/10">
          {profile?.full_name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
