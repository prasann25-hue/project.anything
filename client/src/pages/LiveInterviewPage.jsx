import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api.js';
import { useInterviewRealtime } from '../hooks/useInterviewRealtime.js';
import { StudentAnswerSchema } from '../validation/schemas.js';
import { 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Send, 
  Award,
  CheckCircle,
  HelpCircle,
  XCircle,
  MessageSquareCode,
  Languages,
  RotateCcw
} from 'lucide-react';

export const LiveInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  const { processingStatus, setProcessingStatus } = useInterviewRealtime(id);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(StudentAnswerSchema)
  });

  const loadSession = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getInterviewById(id);
      setSession(data.session);
      setQuestions(data.questions);
      setProcessingStatus(data.session.processing_status);

      if (data.session.status === 'completed') {
        navigate(`/interview/${id}/result`);
        return;
      }

      if (data.session.current_question_number === 0 && data.questions.length === 0) {
        await triggerQuestionGeneration();
      } else {
        const activeQ = data.questions.find((q) => q.question_order === data.session.current_question_number);
        if (activeQ) {
          const matchingAns = data.answers.find((a) => a.question_id === activeQ.id);
          if (matchingAns) {
            setCurrentEvaluation(matchingAns);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setInitError('Failed to initialize mock session. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  useEffect(() => {
    if (processingStatus === 'question_ready') {
      refreshQuestions();
    }
  }, [processingStatus]);

  const refreshQuestions = async () => {
    if (!id) return;
    try {
      const data = await api.getInterviewById(id);
      setSession(data.session);
      setQuestions(data.questions);
      setCurrentEvaluation(null);
      reset({ student_answer: '' });
    } catch (err) {
      console.error('Error refreshing questions:', err);
    }
  };

  const triggerQuestionGeneration = async () => {
    if (!id) return;
    try {
      setProcessingStatus('generating_question');
      await api.generateQuestion(id);
    } catch (err) {
      console.error(err);
      setInitError(err.message || 'Failed to generate question. Please try again.');
      setProcessingStatus('failed');
    }
  };

  const onAnswerSubmit = async (values) => {
    if (!id) return;
    try {
      setProcessingStatus('evaluating_answer');
      const evalData = await api.submitAnswer(id, values.student_answer);
      setCurrentEvaluation(evalData);
      setProcessingStatus('waiting');
    } catch (err) {
      console.error(err);
      setProcessingStatus('failed');
      alert(err.message || 'Evaluation failed. Please try re-submitting.');
    }
  };

  const handleNextQuestion = async () => {
    setCurrentEvaluation(null);
    await triggerQuestionGeneration();
  };

  const handleFinishInterview = async () => {
    if (!id) return;
    try {
      setProcessingStatus('generating_feedback');
      await api.completeInterview(id);
      navigate(`/interview/${id}/result`);
    } catch (err) {
      console.error(err);
      setProcessingStatus('failed');
      alert(err.message || 'Failed to compile final report.');
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 text-sm">Synchronizing interview room...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-bold text-white">Initialization Error</h3>
        <p className="text-gray-400 text-sm max-w-md">{initError}</p>
        <button 
          onClick={loadSession}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Try Reloading
        </button>
      </div>
    );
  }

  const activeQuestion = questions.find(q => q.question_order === session?.current_question_number);
  const isLastQuestion = session ? session.current_question_number === session.total_questions : false;

  return (
    <div className="space-y-8 animate-fade-in">
      {session && (
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">{session.topic} Mock Session</h1>
            <p className="text-xs text-gray-500 mt-1">
              Role: <span className="text-gray-400">{session.target_role}</span> • 
              Difficulty: <span className="text-gray-400">{session.difficulty}</span> • 
              Type: <span className="text-gray-400">{session.interview_type}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl">
              Question {session.current_question_number} of {session.total_questions}
            </span>
          </div>
        </div>
      )}

      {processingStatus !== 'waiting' && processingStatus !== 'question_ready' && processingStatus !== 'completed' && (
        <div className="bg-brand-900/10 border border-brand-500/25 p-5 rounded-2xl flex items-center gap-4 animate-pulse">
          <Loader2 className="w-5 h-5 text-brand-400 animate-spin flex-shrink-0" />
          <div className="text-sm">
            {processingStatus === 'generating_question' && (
              <p className="font-semibold text-brand-400">Gemini is writing the next question based on your tech-stack...</p>
            )}
            {processingStatus === 'evaluating_answer' && (
              <p className="font-semibold text-brand-400">Evaluating correctness and communication quality...</p>
            )}
            {processingStatus === 'generating_feedback' && (
              <p className="font-semibold text-brand-400">Compiling overall evaluation scorecard...</p>
            )}
            {processingStatus === 'failed' && (
              <p className="font-semibold text-red-400">Gemini encountered an error. Click retry to resume.</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {activeQuestion ? (
            <div className="bg-[#0d1222]/40 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-md">
                  Active Question
                </span>
                {activeQuestion.skill_tested && (
                  <span className="text-xs text-gray-400 font-medium">Focus: {activeQuestion.skill_tested}</span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">{activeQuestion.question}</h2>
            </div>
          ) : (
            <div className="bg-[#0d1222]/20 border border-gray-800 border-dashed rounded-3xl p-12 text-center text-gray-500">
              Generating first question...
            </div>
          )}

          {activeQuestion && !currentEvaluation && (
            <div className="bg-[#0d1222]/40 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
              <form onSubmit={handleSubmit(onAnswerSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="student_answer" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Your Response
                  </label>
                  <textarea
                    id="student_answer"
                    rows={8}
                    disabled={isSubmitting || processingStatus === 'evaluating_answer'}
                    className="w-full bg-[#080b13] border border-gray-800 rounded-2xl p-4 text-sm focus:border-brand-500 focus:outline-none transition disabled:opacity-50 font-sans"
                    placeholder="Provide your technical answer here. Be thorough..."
                    {...register('student_answer')}
                  />
                  {errors.student_answer && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.student_answer.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || processingStatus === 'evaluating_answer'}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm py-3.5 rounded-xl border border-brand-500/30 transition shadow-lg shadow-brand-600/10 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || processingStatus === 'evaluating_answer' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Answer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {currentEvaluation && (
            <div className="bg-gray-950/20 border border-gray-900 rounded-3xl p-6 space-y-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your Submitted Answer</span>
              <p className="text-sm text-gray-400 leading-relaxed italic">"{currentEvaluation.student_answer}"</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {currentEvaluation ? (
            <div className="bg-[#0d1222]/40 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-800 pb-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Question Scorecard</h3>
                  <p className="text-xs text-gray-500">Evaluated on correctness, completeness, and clarity</p>
                </div>
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 font-black text-xl">
                  {currentEvaluation.score}
                  <span className="text-[8px] text-gray-500 uppercase font-bold mt-[-2px]">/ 10</span>
                </div>
              </div>

              <div className="space-y-4">
                {currentEvaluation.correct_points?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Correct Points Hit
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1.5 pl-1">
                      {currentEvaluation.correct_points.map((p, idx) => (
                        <li key={idx} className="leading-relaxed">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentEvaluation.missing_points?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-900">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" /> Missing Points
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1.5 pl-1">
                      {currentEvaluation.missing_points.map((p, idx) => (
                        <li key={idx} className="leading-relaxed">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentEvaluation.incorrect_points?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-900">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Incorrect / Misleading
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1.5 pl-1">
                      {currentEvaluation.incorrect_points.map((p, idx) => (
                        <li key={idx} className="leading-relaxed">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-gray-800 pt-5">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquareCode className="w-4 h-4 text-brand-400" /> Technical Feedback
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{currentEvaluation.technical_feedback}</p>
                </div>

                <div className="space-y-1 pt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-brand-400" /> Communication Review
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{currentEvaluation.communication_feedback}</p>
                </div>
              </div>

              <div className="bg-brand-500/5 border border-brand-500/10 p-5 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Improved Answer Suggestion</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{currentEvaluation.improved_answer}</p>
              </div>

              <div className="pt-2">
                {isLastQuestion ? (
                  <button
                    onClick={handleFinishInterview}
                    disabled={processingStatus === 'generating_feedback'}
                    className="w-full bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-bold text-sm py-4 rounded-xl border border-brand-500/30 transition shadow-lg shadow-brand-600/20 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {processingStatus === 'generating_feedback' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Compiling Final Report Card...</span>
                      </>
                    ) : (
                      <>
                        <span>Finish & Compile Report Card</span>
                        <Award className="w-5 h-5" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    disabled={processingStatus === 'generating_question'}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm py-4 rounded-xl border border-brand-500/30 transition shadow-lg shadow-brand-600/10 flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {processingStatus === 'generating_question' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Crafting Next Question...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Next Question</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-[#0d1222]/20 border border-gray-800 border-dashed rounded-3xl p-12 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center">
              <HelpCircle className="w-10 h-10 mb-3 text-gray-600" />
              <h3 className="font-bold text-white mb-1">Waiting for Submission</h3>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">Submit your technical solution on the left to see detailed scorecards, hit points, and suggestions.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
