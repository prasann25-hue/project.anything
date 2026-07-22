import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';
import { generateStudyPlan } from '../services/gemini';

/**
 * Generate a new 7-day study plan
 */
export async function createStudyPlan(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const { session_id } = req.body;

    // 1. Get profile preferences
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return res.status(400).json({ error: 'Please complete your onboarding profile first' });
    }

    // 2. Determine weak areas
    let weakAreas: string[] = profile.weak_technologies || [];
    
    // If a session ID is provided, read the specific weak areas or revision topics from the mock report
    if (session_id) {
      const { data: session } = await supabaseAdmin
        .from('interview_sessions')
        .select('*')
        .eq('id', session_id)
        .single();

      if (session && session.user_id === userId && session.topics_to_revise) {
        // Use revision topics recommended in the final report
        weakAreas = session.topics_to_revise as string[];
      }
    }

    // 3. Call Gemini to generate a tailored 7-day study plan
    const generatedPlan = await generateStudyPlan({
      target_role: profile.target_role || 'Developer',
      experience_level: profile.experience_level || 'Entry Level',
      weak_areas: weakAreas,
      daily_time: profile.daily_preparation_minutes || 60
    });

    // 4. Save to database
    const { data: studyPlan, error: insertErr } = await supabaseAdmin
      .from('study_plans')
      .insert({
        user_id: userId,
        session_id: session_id || null,
        plan_title: generatedPlan.plan_title,
        plan_content: generatedPlan
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Error inserting study plan:', insertErr);
      return res.status(500).json({ error: 'Failed to save generated study plan' });
    }

    res.json(studyPlan);
  } catch (error) {
    console.error('createStudyPlan error:', error);
    res.status(500).json({ error: 'Failed to generate study plan. Please try again.' });
  }
}

/**
 * Get all study plans for the user
 */
export async function getStudyPlans(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const { data: plans, error } = await supabaseAdmin
      .from('study_plans')
      .select('id, plan_title, session_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study plans:', error);
      return res.status(500).json({ error: 'Failed to fetch study plans' });
    }

    res.json(plans);
  } catch (error) {
    console.error('getStudyPlans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get details of a single study plan
 */
export async function getStudyPlanById(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const planId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const { data: plan, error } = await supabaseAdmin
      .from('study_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error || !plan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    if (plan.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(plan);
  } catch (error) {
    console.error('getStudyPlanById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
