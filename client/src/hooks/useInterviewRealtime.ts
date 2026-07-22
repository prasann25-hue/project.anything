import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useInterviewRealtime(sessionId: string | undefined) {
  const [processingStatus, setProcessingStatus] = useState<string>('waiting');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Listen only to updates on the specific interview session to enforce privacy
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
