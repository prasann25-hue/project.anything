import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';
import { InterviewSetupSchema, StudentAnswerSchema } from '../validation/schemas';
import { generateQuestion, evaluateAnswer, generateFinalReport } from '../services/gemini';

/**
 * Start a new interview session
 */
export async function startInterview(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const validated = InterviewSetupSchema.parse(req.body);

    const { data: session, error } = await supabaseAdmin
      .from('interview_sessions')
      .insert({
        user_id: userId,
        target_role: validated.target_role,
        interview_type: validated.interview_type,
        topic: validated.topic,
        difficulty: validated.difficulty,
        total_questions: validated.total_questions,
        current_question_number: 0,
        status: 'in_progress',
        processing_status: 'waiting'
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting interview:', error);
      return res.status(500).json({ error: 'Failed to create interview session' });
    }

    res.json(session);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('startInterview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all interview sessions of the user
 */
export async function getInterviews(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const { data: sessions, error } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing interviews:', error);
      return res.status(500).json({ error: 'Failed to retrieve sessions' });
    }

    res.json(sessions);
  } catch (error) {
    console.error('getInterviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Fetch detailed state of a single interview session (including questions and answers)
 */
export async function getInterviewById(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    // 1. Get session details
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    // Confirm ownership
    if (session.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied: not your session' });
    }

    // 2. Fetch questions
    const { data: questions, error: qErr } = await supabaseAdmin
      .from('interview_questions')
      .select('id, question, topic, difficulty, skill_tested, question_order, created_at')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    if (qErr) {
      console.error('Error fetching interview questions:', qErr);
      return res.status(500).json({ error: 'Failed to retrieve interview questions' });
    }

    // 3. Fetch answers
    const { data: answers, error: aErr } = await supabaseAdmin
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId);

    if (aErr) {
      console.error('Error fetching interview answers:', aErr);
      return res.status(500).json({ error: 'Failed to retrieve interview answers' });
    }

    res.json({
      session,
      questions: questions || [],
      answers: answers || []
    });
  } catch (error) {
    console.error('getInterviewById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generate the next question
 */
export async function generateNextQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    // 1. Get session details & check constraints
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    if (session.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Interview is already completed' });
    }

    if (session.current_question_number >= session.total_questions) {
      return res.status(400).json({ error: 'No more questions needed. Complete the interview.' });
    }

    const nextOrder = session.current_question_number + 1;

    // 2. Set processing status to 'generating_question' (Triggers Supabase Realtime)
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'generating_question' })
      .eq('id', sessionId);

    // 3. Get user profile details
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 4. Get previous questions asked in this session
    const { data: previousQuestions } = await supabaseAdmin
      .from('interview_questions')
      .select('question')
      .eq('session_id', sessionId);

    const prevQTexts = previousQuestions?.map(q => q.question) || [];

    // 5. Call Gemini to generate the question
    let questionData;
    try {
      questionData = await generateQuestion({
        target_role: session.target_role,
        interview_type: session.interview_type,
        topic: session.topic,
        difficulty: session.difficulty,
        experience_level: profile?.experience_level || 'Entry Level',
        previous_questions: prevQTexts,
        weak_areas: profile?.weak_technologies || []
      });
    } catch (gemErr) {
      // Revert status to failed
      await supabaseAdmin
        .from('interview_sessions')
        .update({ processing_status: 'failed' })
        .eq('id', sessionId);
      throw gemErr;
    }

    // 6. Insert new question into DB
    const { data: insertedQuestion, error: qInsertErr } = await supabaseAdmin
      .from('interview_questions')
      .insert({
        session_id: sessionId,
        user_id: userId,
        question: questionData.question,
        topic: questionData.topic,
        difficulty: questionData.difficulty,
        skill_tested: questionData.skill_tested,
        expected_points: questionData.expected_points,
        question_order: nextOrder
      })
      .select('id, question, topic, difficulty, skill_tested, question_order')
      .single();

    if (qInsertErr) {
      console.error('Error inserting question:', qInsertErr);
      await supabaseAdmin
        .from('interview_sessions')
        .update({ processing_status: 'failed' })
        .eq('id', sessionId);
      return res.status(500).json({ error: 'Failed to save generated question' });
    }

    // 7. Update session counter and status to 'question_ready'
    await supabaseAdmin
      .from('interview_sessions')
      .update({
        current_question_number: nextOrder,
        processing_status: 'question_ready'
      })
      .eq('id', sessionId);

    res.json(insertedQuestion);
  } catch (error) {
    console.error('generateNextQuestion error:', error);
    res.status(500).json({ error: 'Failed to generate interview question. Please try again.' });
  }
}

/**
 * Submit student's answer & evaluate
 */
export async function submitAnswer(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    const { student_answer } = StudentAnswerSchema.parse(req.body);

    // 1. Get session details & confirm ownership
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    if (session.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 2. Fetch the active question
    const { data: activeQuestion, error: qErr } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('question_order', session.current_question_number)
      .single();

    if (qErr || !activeQuestion) {
      return res.status(400).json({ error: 'Active question not found' });
    }

    // Check if an answer already exists for this question to prevent duplicates
    const { data: existingAnswer } = await supabaseAdmin
      .from('interview_answers')
      .select('id')
      .eq('question_id', activeQuestion.id)
      .maybeSingle();

    if (existingAnswer) {
      return res.status(400).json({ error: 'An answer has already been submitted for this question' });
    }

    // 3. Set status to 'evaluating_answer'
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'evaluating_answer' })
      .eq('id', sessionId);

    // 4. Get profile experience
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('experience_level')
      .eq('id', userId)
      .single();

    // 5. Evaluate answer via Gemini
    let evaluation;
    try {
      evaluation = await evaluateAnswer({
        question: activeQuestion.question,
        expected_points: activeQuestion.expected_points as string[],
        student_answer,
        experience_level: profile?.experience_level || 'Entry Level'
      });
    } catch (gemErr) {
      // Revert processing status
      await supabaseAdmin
        .from('interview_sessions')
        .update({ processing_status: 'failed' })
        .eq('id', sessionId);
      throw gemErr;
    }

    // 6. Save answer & evaluation results in DB
    const { data: insertedAnswer, error: aInsertErr } = await supabaseAdmin
      .from('interview_answers')
      .insert({
        question_id: activeQuestion.id,
        session_id: sessionId,
        user_id: userId,
        student_answer,
        score: evaluation.score,
        result: evaluation.result,
        correct_points: evaluation.correct_points,
        missing_points: evaluation.missing_points,
        incorrect_points: evaluation.incorrect_points,
        technical_feedback: evaluation.technical_feedback,
        communication_feedback: evaluation.communication_feedback,
        improved_answer: evaluation.improved_answer,
        follow_up_question: evaluation.follow_up_question || null,
        recommended_topic: evaluation.recommended_topic
      })
      .select()
      .single();

    if (aInsertErr) {
      console.error('Error inserting answer:', aInsertErr);
      await supabaseAdmin
        .from('interview_sessions')
        .update({ processing_status: 'failed' })
        .eq('id', sessionId);
      return res.status(500).json({ error: 'Failed to save student answer evaluation' });
    }

    // 7. Revert processing_status to 'waiting'
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'waiting' })
      .eq('id', sessionId);

    res.json(insertedAnswer);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('submitAnswer error:', error);
    res.status(500).json({ error: 'Failed to evaluate your answer. Please try again.' });
  }
}

/**
 * Complete the interview & generate overall report
 */
export async function completeInterview(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: 'User context not found' });
    }

    // 1. Get session details & confirm ownership
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    if (session.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (session.status === 'completed') {
      return res.json(session); // already completed
    }

    // 2. Set processing status to 'generating_feedback'
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'generating_feedback' })
      .eq('id', sessionId);

    // 3. Fetch all questions and student answers
    const { data: questions } = await supabaseAdmin
      .from('interview_questions')
      .select('id, question, expected_points')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    const { data: answers } = await supabaseAdmin
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId);

    if (!questions || !answers || answers.length === 0) {
      await supabaseAdmin
        .from('interview_sessions')
        .update({ processing_status: 'failed' })
        .eq('id', sessionId);
      return res.status(400).json({ error: 'No answers submitted to compile report' });
    }

    // Map questions and answers together
    const results = questions.map(q => {
      const ans = answers.find(a => a.question_id === q.id);
      return {
        question: q.question,
        student_answer: ans?.student_answer || '',
        score: Number(ans?.score || 0),
        technical_feedback: ans?.technical_feedback || '',
        correct_points: (ans?.correct_points as string[]) || [],
        missing_points: (ans?.missing_points as string[]) || []
      };
    });

    // 4. Generate Final Report Card via Gemini
    let report;
    try {
      report = await generateFinalReport({
        target_role: session.target_role,
        interview_type: session.interview_type,
        difficulty: session.difficulty,
        interview_results: results
      });
    } catch (gemErr) {
      await supabaseAdmin
        .from('interview_sessions')
        .update({ processing_status: 'failed' })
        .eq('id', sessionId);
      throw gemErr;
    }

    // 5. Update session with final results and set status to completed
    const { data: updatedSession, error: updateErr } = await supabaseAdmin
      .from('interview_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        overall_score: report.overall_score,
        performance_level: report.performance_level,
        technical_summary: report.technical_summary,
        communication_summary: report.communication_summary,
        strong_areas: report.strong_areas,
        weak_areas: report.weak_areas,
        topics_to_revise: report.topics_to_revise,
        next_difficulty: report.next_difficulty,
        final_message: report.final_message,
        processing_status: 'completed'
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating session completion:', updateErr);
      return res.status(500).json({ error: 'Failed to complete interview session' });
    }

    // 6. Update Topic Progress metrics (Aggregate topic stats)
    try {
      const topic = session.topic;
      const { data: existingProgress } = await supabaseAdmin
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic', topic)
        .maybeSingle();

      if (existingProgress) {
        const attempts = (existingProgress.attempts || 0) + 1;
        const average_score = Math.round(
          ((existingProgress.average_score * existingProgress.attempts + report.overall_score) / attempts) * 10
        ) / 10;
        const best_score = Math.max(existingProgress.best_score || 0, report.overall_score);

        await supabaseAdmin
          .from('progress')
          .update({
            attempts,
            average_score,
            best_score,
            last_attempted_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
      } else {
        await supabaseAdmin
          .from('progress')
          .insert({
            user_id: userId,
            topic: topic,
            attempts: 1,
            average_score: report.overall_score,
            best_score: report.overall_score,
            last_attempted_at: new Date().toISOString()
          });
      }
    } catch (pErr) {
      console.error('Error updating user progress table:', pErr);
      // Don't crash request if stats fails to write
    }

    res.json(updatedSession);
  } catch (error) {
    console.error('completeInterview error:', error);
    res.status(500).json({ error: 'Failed to compile final report. Please try again.' });
  }
}
