import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters')
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const ProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  university: z.string().min(1, 'University name is required'),
  current_year: z.string().min(1, 'Current year of study is required'),
  target_role: z.string().min(1, 'Target role is required'),
  experience_level: z.string().min(1, 'Experience level is required'),
  preferred_difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  known_technologies: z.array(z.string()).min(1, 'Select at least one known technology'),
  weak_technologies: z.array(z.string()).min(1, 'Select at least one weak technology'),
  daily_preparation_minutes: z.number().int().min(15).max(480)
});

export const InterviewSetupSchema = z.object({
  target_role: z.string().min(1, 'Target role is required'),
  interview_type: z.enum(['Technical', 'HR', 'Mixed']),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  total_questions: z.union([z.literal(3), z.literal(5), z.literal(10)])
});

export const StudentAnswerSchema = z.object({
  student_answer: z.string().min(10, 'Your answer must be at least 10 characters long').max(5000, 'Your answer is too long (max 5000 characters)')
});
