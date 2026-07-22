import { supabase } from './supabaseClient.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function request(endpoint, options = {}) {
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
  updateProfile: (profile) => request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profile)
  }),

  // Dashboard API
  getDashboardStats: () => request('/api/dashboard'),

  // Interview API
  startInterview: (setup) => request('/api/interviews/start', {
    method: 'POST',
    body: JSON.stringify(setup)
  }),
  getInterviews: () => request('/api/interviews'),
  getInterviewById: (id) => request(`/api/interviews/${id}`),
  generateQuestion: (id) => request(`/api/interviews/${id}/question`, {
    method: 'POST'
  }),
  submitAnswer: (id, answer) => request(`/api/interviews/${id}/answer`, {
    method: 'POST',
    body: JSON.stringify({ student_answer: answer })
  }),
  completeInterview: (id) => request(`/api/interviews/${id}/complete`, {
    method: 'POST'
  }),

  // Study Plan API
  createStudyPlan: (sessionId) => request('/api/study-plans', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId })
  }),
  getStudyPlans: () => request('/api/study-plans'),
  getStudyPlanById: (id) => request(`/api/study-plans/${id}`),

  // Progress API
  getProgress: () => request('/api/progress')
};
