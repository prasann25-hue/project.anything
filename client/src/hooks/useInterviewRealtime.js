import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export function useInterviewRealtime(sessionId) {
  const [processingStatus, setProcessingStatus] = useState('waiting');
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-status-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interview_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new) {
            setProcessingStatus(payload.new.processing_status || 'waiting');
            setSession(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { processingStatus, setProcessingStatus, session, setSession };
}
