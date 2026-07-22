-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  university text,
  current_year text,
  target_role text,
  experience_level text,
  preferred_difficulty text,
  known_technologies text[],
  weak_technologies text[],
  daily_preparation_minutes integer default 60,
  role text default 'student',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create interview_sessions table
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_role text not null,
  interview_type text not null,
  topic text not null,
  difficulty text not null,
  total_questions integer not null,
  current_question_number integer default 0,
  status text not null default 'in_progress',
  processing_status text default 'waiting',
  overall_score numeric,
  performance_level text,
  technical_summary text,
  communication_summary text,
  strong_areas jsonb,
  weak_areas jsonb,
  topics_to_revise jsonb,
  next_difficulty text,
  final_message text,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create interview_questions table
create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  topic text not null,
  difficulty text not null,
  skill_tested text,
  expected_points jsonb not null,
  question_order integer not null,
  created_at timestamptz default now()
);

-- Create interview_answers table
create table public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.interview_questions(id) on delete cascade,
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_answer text not null,
  score numeric not null,
  result text,
  correct_points jsonb,
  missing_points jsonb,
  incorrect_points jsonb,
  technical_feedback text,
  communication_feedback text,
  improved_answer text,
  follow_up_question text,
  recommended_topic text,
  created_at timestamptz default now()
);

-- Create study_plans table
create table public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.interview_sessions(id) on delete set null,
  plan_title text not null,
  plan_content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create progress table
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  attempts integer default 0,
  average_score numeric default 0,
  best_score numeric default 0,
  last_attempted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, topic)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_answers enable row level security;
alter table public.study_plans enable row level security;
alter table public.progress enable row level security;

-- Create RLS Policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can manage own sessions"
  on public.interview_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own questions"
  on public.interview_questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own answers"
  on public.interview_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own study plans"
  on public.study_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own progress"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create automatic profile triggers for user registration (Optional but highly recommended)
-- This creates a profile with empty name/details when a new user registers so their GET doesn't fail
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Student'), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger helper function to update updated_at timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to relevant tables
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_interview_sessions_updated_at before update on public.interview_sessions
  for each row execute procedure public.update_updated_at_column();

create trigger update_study_plans_updated_at before update on public.study_plans
  for each row execute procedure public.update_updated_at_column();

create trigger update_progress_updated_at before update on public.progress
  for each row execute procedure public.update_updated_at_column();
