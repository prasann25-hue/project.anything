import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

/**
 * Get dashboard stats for the authenticated user
 */
export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    // 1. Fetch completed sessions info (count, average score)
    const { data: completedSessions, error: sessionsErr } = await supabaseAdmin
      .from('interview_sessions')
      .select('id, overall_score, topic, started_at, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (sessionsErr) {
      console.error('Error fetching dashboard sessions:', sessionsErr);
      return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }

    // 2. Fetch progress statistics by topic
    const { data: topicProgress, error: progressErr } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('best_score', { ascending: false });

    if (progressErr) {
      console.error('Error fetching topic progress:', progressErr);
      return res.status(500).json({ error: 'Failed to fetch topic progress' });
    }

    // 3. Fetch recent interviews (any status)
    const { data: recentSessions, error: recentErr } = await supabaseAdmin
      .from('interview_sessions')
      .select('id, target_role, interview_type, topic, difficulty, total_questions, current_question_number, status, overall_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentErr) {
      console.error('Error fetching recent sessions:', recentErr);
      return res.status(500).json({ error: 'Failed to fetch recent sessions' });
    }

    // Calculate aggregated metrics
    const totalCompleted = completedSessions?.length || 0;
    let averageScore = 0;
    if (totalCompleted > 0 && completedSessions) {
      const sum = completedSessions.reduce((acc, s) => acc + Number(s.overall_score || 0), 0);
      averageScore = Math.round((sum / totalCompleted) * 10) / 10;
    }

    res.json({
      totalCompleted,
      averageScore,
      topicProgress: topicProgress || [],
      recentSessions: recentSessions || []
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
