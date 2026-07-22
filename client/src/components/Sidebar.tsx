import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BookOpen, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { signOut, profile } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/interview/new', label: 'New Interview', icon: PlusCircle },
    { to: '/history', label: 'Interview History', icon: History },
    { to: '/study-plan', label: 'Study Plans', icon: BookOpen },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#0d1222]/80 backdrop-blur-md border-r border-gray-800 flex flex-col min-h-screen text-gray-300">
      {/* Brand logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 gap-2">
        <Sparkles className="w-6 h-6 text-brand-500 animate-pulse" />
        <span className="font-extrabold text-xl bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
          CareerPilot AI
        </span>
      </div>

      {/* User Info Quick Card */}
      {profile && (
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center font-bold text-brand-400 text-lg">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-200 truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{profile.experience_level || 'Student'}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
              ${isActive 
                ? 'bg-brand-600/15 border border-brand-500/30 text-brand-400 shadow-sm shadow-brand-500/5' 
                : 'hover:bg-gray-800/50 hover:text-gray-100 border border-transparent'
              }
            `}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
