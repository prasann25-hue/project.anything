import { supabaseAdmin } from '../services/supabase.js';
import { ProfileSchema } from '../validation/schemas.js';

export async function getProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (!profile) {
      const fallbackProfile = {
        id: userId,
        full_name: 'Student',
        email: req.user?.email || '',
        onboarding_completed: false
      };
      return res.json(fallbackProfile);
    }

    res.json(profile);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const validatedBody = ProfileSchema.parse(req.body);

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: req.user?.email || '',
        full_name: validatedBody.full_name,
        university: validatedBody.university,
        current_year: validatedBody.current_year,
        target_role: validatedBody.target_role,
        experience_level: validatedBody.experience_level,
        preferred_difficulty: validatedBody.preferred_difficulty,
        known_technologies: validatedBody.known_technologies,
        weak_technologies: validatedBody.weak_technologies,
        daily_preparation_minutes: validatedBody.daily_preparation_minutes,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json(profile);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
