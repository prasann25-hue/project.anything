import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { RegisterSchema } from '../validation/schemas.js';

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authError, setAuthError] = useState(null);

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(RegisterSchema)
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setAuthError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName
          }
        }
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setAuthError('An unexpected error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 flex flex-col justify-center items-center px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
            <span className="font-extrabold text-2xl bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
              CareerPilot AI
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-gray-400 mt-2 text-sm">Join to practice coding and communication mock interviews</p>
        </div>

        <div className="bg-[#0d1222]/60 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-xl shadow-black/40">
          
          {authError && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/25 rounded-2xl text-green-400 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account created successfully!</p>
                <p className="mt-1 text-xs text-green-500/80">Redirecting you to the sign-in screen...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                disabled={loading || success}
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition disabled:opacity-50"
                placeholder="Jane Doe"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                disabled={loading || success}
                className="w-full bg-[#080b13] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition disabled:opacity-50"
                placeholder="name@university.edu"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading || success}
                  className="w-full bg-[#080b13] border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-brand-500 focus:outline-none transition disabled:opacity-50"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  disabled={loading || success}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm py-3.5 rounded-xl border border-brand-500/30 transition shadow-lg shadow-brand-600/10 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-900 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
