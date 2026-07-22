import { supabase } from './supabaseClient';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function getHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function request(endpoint: string, options: RequestInit = {}) {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Profile API
export const api = {
  getProfile: () => request('/api/profile'),
  updateProfile: (profile: any) => request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profile)
  }),

  // Dashboard API
  getDashboardStats: () => request('/api/dashboard'),

  // Interview API
  startInterview: (setup: {
    target_role: string;
    interview_type: 'Technical' | 'HR' | 'Mixed';
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    total_questions: 3 | 5 | 10;
  }) => request('/api/interviews/start', {
    method: 'POST',
    body: JSON.stringify(setup)
  }),
  getInterviews: () => request('/api/interviews'),
  getInterviewById: (id: string) => request(`/api/interviews/${id}`),
  generateQuestion: (id: string) => request(`/api/interviews/${id}/question`, {
    method: 'POST'
  }),
  submitAnswer: (id: string, answer: string) => request(`/api/interviews/${id}/answer`, {
    method: 'POST',
    body: JSON.stringify({ student_answer: answer })
  }),
  completeInterview: (id: string) => request(`/api/interviews/${id}/complete`, {
    method: 'POST'
  }),

  // Study Plan API
  createStudyPlan: (sessionId?: string) => request('/api/study-plans', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId })
  }),
  getStudyPlans: () => request('/api/study-plans'),
  getStudyPlanById: (id: string) => request(`/api/study-plans/${id}`),

  // Progress API
  getProgress: () => request('/api/progress')
};
