import { supabaseAdmin } from '../services/supabase.js';

export async function getProgress(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const { data: progressList, error } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('topic', { ascending: true });

    if (error) {
      console.error('Error fetching progress:', error);
      return res.status(500).json({ error: 'Failed to fetch progress metrics' });
    }

    res.json(progressList || []);
  } catch (error) {
    console.error('getProgress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
