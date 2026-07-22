import { z } from 'zod';

// Register schema
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters')
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Profile / Onboarding schema
export const ProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional(),
  university: z.string().min(1, 'University name is required'),
  current_year: z.string().min(1, 'Current year of study is required'),
  target_role: z.string().min(1, 'Target role is required'),
  experience_level: z.string().min(1, 'Experience level is required'),
  preferred_difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  known_technologies: z.array(z.string()).min(1, 'Select at least one known technology'),
  weak_technologies: z.array(z.string()).min(1, 'Select at least one weak technology'),
  daily_preparation_minutes: z.number().int().min(15).max(480)
});

// Interview setup schema
export const InterviewSetupSchema = z.object({
  target_role: z.string().min(1, 'Target role is required'),
  interview_type: z.enum(['Technical', 'HR', 'Mixed']),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  total_questions: z.union([z.literal(3), z.literal(5), z.literal(10)])
});

// Student answer submission schema
export const StudentAnswerSchema = z.object({
  student_answer: z.string().min(10, 'Your answer must be at least 10 characters long').max(5000, 'Your answer is too long (max 5000 characters)')
});

// Zod validation schemas for Gemini JSON responses

export const GeminiQuestionResponseSchema = z.object({
  question: z.string(),
  topic: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  skill_tested: z.string(),
  expected_points: z.array(z.string()).min(1)
});

export const GeminiEvaluationResponseSchema = z.object({
  score: z.number().min(0).max(10),
  result: z.string(),
  correct_points: z.array(z.string()),
  missing_points: z.array(z.string()),
  incorrect_points: z.array(z.string()),
  technical_feedback: z.string(),
  communication_feedback: z.string(),
  improved_answer: z.string(),
  follow_up_question: z.string().optional(),
  recommended_topic: z.string()
});

export const GeminiFinalReportSchema = z.object({
  overall_score: z.number().min(0).max(100),
  performance_level: z.string(),
  strong_areas: z.array(z.string()),
  weak_areas: z.array(z.string()),
  technical_summary: z.string(),
  communication_summary: z.string(),
  topics_to_revise: z.array(z.string()).length(3),
  next_difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  final_message: z.string()
});

export const GeminiStudyPlanDaySchema = z.object({
  day: z.number().int().min(1).max(7),
  topic: z.string(),
  objective: z.string(),
  learning_activity: z.string(),
  practice_activity: z.string(),
  duration_minutes: z.number().int().min(15)
});

export const GeminiStudyPlanSchema = z.object({
  plan_title: z.string(),
  days: z.array(GeminiStudyPlanDaySchema).length(7)
});
