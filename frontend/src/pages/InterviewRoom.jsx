import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import wsManager from '../services/websocket';
import speechService from '../services/speech';
import WebcamStream from '../components/WebcamStream';
import AudioVisualizer from '../components/AudioVisualizer';
import { ArrowRight, Mic, Video, Volume2, Sparkles, Send, Bell } from 'lucide-react';

export default function InterviewRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const category = location.state?.category || 'Software Engineering';
  const difficulty = location.state?.difficulty || 'Medium';

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Transcription states
  const [transcriptHistory, setTranscriptHistory] = useState('');
  const [interimText, setInterimText] = useState('');
  const [speechError, setSpeechError] = useState('');
  
  // Telemetry telemetry & coaching alerts
  const [coachAlerts, setCoachAlerts] = useState([]);
  const [speakingStartTime, setSpeakingStartTime] = useState(null);
  
  // Media Recording Ref
  const [stream, setStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  // Tab switching detection
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const tabSwitchCountRef = useRef(0);

  // Final answers package
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Tab visibility and full-screen detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        setTabSwitchCount(tabSwitchCountRef.current);

        if (tabSwitchCountRef.current > 3) {
          // Auto-exit interview after 4th tab switch
          alert('You have switched tabs too many times. The interview will be terminated.');
          // Trigger exit by navigating away
          setTimeout(() => navigate('/dashboard'), 500);
          return;
        }

        // Show alert for 1st, 2nd, 3rd tab switch
        alert(`⚠️ Tab Switch Warning ${tabSwitchCountRef.current}/3\n\nDo not switch tabs during the interview. You have ${4 - tabSwitchCountRef.current} more warnings.`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  // Request full-screen mode on interview start
  useEffect(() => {
    if (questions.length > 0 && currentIdx === 0) {
      const enterFullScreen = async () => {
        try {
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }
        } catch (err) {
          console.warn('Fullscreen request failed:', err);
        }
      };
      
      enterFullScreen();
    }
  }, [questions, currentIdx]);

  // 1. Fetch practice questions for this category
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const qList = await interviewAPI.getQuestions(category, difficulty);
        setQuestions(qList);
      } catch (err) {
        console.error('Failed to load questions:', err);
      }
    }
    fetchQuestions();
  }, [category, difficulty]);

  // 2. Setup camera track streams for recording
  useEffect(() => {
    async function configureRecording() {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(camStream);
        
        // Setup MediaRecorder
        const recorder = new MediaRecorder(camStream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;
        recordedChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.start(1000); // chunk every second
      } catch (err) {
        console.warn('Media recording capture failed:', err);
      }
    }
    configureRecording();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 3. Connect to live WebSocket feedback alerts
  useEffect(() => {
    wsManager.connect(
      () => {
        // Subscribe to feedback for this session
        wsManager.subscribe(`/topic/feedback/${sessionId}`, (message) => {
          // Add alert to top of screen and clean up older ones
          setCoachAlerts((prev) => [message, ...prev.slice(0, 2)]);
        });
      },
      (err) => console.error('WebSocket connection failed:', err)
    );

    return () => {
      wsManager.disconnect();
    };
  }, [sessionId]);

  // 4. Start speech recognition for current question
  useEffect(() => {
    if (questions.length === 0) return;
    
    setSpeechError('');
    setTranscriptHistory('');
    setInterimText('');
    setSpeakingStartTime(Date.now());

    speechService.start(
      (result) => {
        setInterimText(result.interimText);
        if (result.finalText) {
          setTranscriptHistory((prev) => {
            const nextText = prev + ' ' + result.finalText;
            
            // Stream telemetry stats to backend over WebSocket
            const duration = (Date.now() - speakingStartTime) / 1000.0;
            wsManager.send('/app/interview/telemetry', {
              sessionId,
              type: 'SPEECH',
              text: nextText,
              durationSeconds: duration,
            });

            return nextText.trim();
          });
        }
      },
      (err) => {
        setSpeechError('Web Speech API details: ' + err);
      }
    );

    return () => {
      speechService.stop();
    };
  }, [questions, currentIdx]);

  // Handle visual telemetry reports from WebcamStream canvas
  const handleVisualTelemetry = (telemetry) => {
    wsManager.send('/app/interview/telemetry', {
      sessionId,
      type: 'VISION',
      eyeContact: telemetry.eyeContact,
      confidence: telemetry.confidence,
    });
  };

  const handleNextQuestion = () => {
    // Save answer text for current question
    const currentQ = questions[currentIdx];
    const finalAnswerText = (transcriptHistory + ' ' + interimText).trim();
    
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: finalAnswerText || 'No answer provided',
    }));

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleSubmitInterview = async () => {
    setSubmitting(true);
    
    // Save final question answer first
    const currentQ = questions[currentIdx];
    const finalAnswerText = (transcriptHistory + ' ' + interimText).trim();
    const finalAnswers = {
      ...answers,
      [currentQ.id]: finalAnswerText || 'No answer provided',
    };

    try {
      // 1. Submit answers to get AI evaluation report
      const answerPayload = questions.map((q) => ({
        id: q.id,
        questionText: q.content,
        userAnswer: finalAnswers[q.id],
      }));

      // Stop speech detection
      speechService.stop();

      // Stop camera recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      const reportResult = await interviewAPI.submitInterview(sessionId, answerPayload);

      // 2. Upload video recording Blob asynchronously
      if (recordedChunksRef.current.length > 0) {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        try {
          await interviewAPI.uploadRecording(sessionId, videoBlob);
        } catch (uploadErr) {
          console.error('Failed to upload video stream:', uploadErr);
        }
      }

      navigate(`/report/${sessionId}`);
    } catch (err) {
      console.error('Evaluation submission failed:', err);
      setSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-slate-400 bg-dark-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-cyan border-t-transparent" />
        <span className="ml-3 text-sm">Preparing interview queries...</span>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Workspace Panel */}
      <div className="grid gap-8 lg:grid-cols-5">
        
        {/* Left 3 Columns: Webcam Stream, Visualizer, Speech Log */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <WebcamStream 
            onTelemetry={handleVisualTelemetry} 
            isRecording={!submitting} 
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <AudioVisualizer stream={stream} />
            </div>
            <div className="flex items-center gap-2 bg-dark-900/50 border border-dark-700/40 rounded-lg px-4 py-2.5">
              <Volume2 className="h-4 w-4 text-accent-cyan" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Mic Status:</span>
              <span className="text-xs text-white font-semibold">Active</span>
            </div>
          </div>

          {/* Teleprompter Speech Box */}
          <div className="glass-panel rounded-xl p-5 text-left border border-dark-700/60 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-accent-rose animate-pulse" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Speech Transcription
              </h4>
            </div>
            <div className="min-h-[90px] max-h-[140px] overflow-y-auto text-sm leading-relaxed text-slate-300 font-sans custom-scroll-y pr-1 select-none italic">
              {speechError ? (
                <span className="text-accent-rose text-xs">{speechError}</span>
              ) : (transcriptHistory || interimText) ? (
                <>
                  {transcriptHistory}
                  <span className="text-accent-cyan font-medium animate-pulse">{interimText ? ` ${interimText}...` : ''}</span>
                </>
              ) : (
                <span className="text-slate-500 text-xs">Start speaking your answer. We will transcribe it in real-time...</span>
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Question, Prompts, Live Coaching Alerts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Active Question Box */}
          <div className="glass-panel rounded-xl p-6 text-left border border-accent-violet/30 bg-gradient-to-br from-dark-900 via-dark-900 to-accent-violet/5 flex flex-col justify-between h-[280px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-accent-violet uppercase tracking-widest">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="rounded bg-accent-violet/10 border border-accent-violet/30 px-2 py-0.5 text-[8px] font-bold text-accent-violet">
                  {currentQuestion.difficulty}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white leading-snug font-sans">
                {currentQuestion.content}
              </h2>
            </div>

            <div className="mt-6 flex justify-end">
              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  className="glow-btn-violet flex items-center gap-2 py-2"
                >
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitInterview}
                  disabled={submitting}
                  className="glow-btn-cyan flex items-center gap-2 py-2.5 font-bold"
                >
                  <Send className="h-4 w-4 text-dark-950" />
                  {submitting ? 'Analyzing Answers...' : 'Complete Interview'}
                </button>
              )}
            </div>
          </div>

          {/* Live Coaching Stream Feed */}
          <div className="glass-panel rounded-xl p-6 text-left border border-dark-700/60 flex flex-col flex-1 h-[210px] overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-accent-cyan" />
              Live Coach Suggestions
            </h3>

            {coachAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 italic text-xs">
                <Sparkles className="h-6 w-6 text-slate-700 mb-2 animate-pulse" />
                <span>Coach is observing. Suggestions will appear here in real-time.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 animate-fadeIn">
                {coachAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 flex items-start gap-2.5 shadow-md ${
                      alert.type === 'SPEECH_RATE'
                        ? 'bg-accent-violet/10 border-accent-violet/30 text-accent-violet'
                        : 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan'
                    }`}
                  >
                    <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                      !
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {alert.type === 'SPEECH_RATE' ? 'Speed Alert' : 'Posture Alert'}
                      </h5>
                      <p className="mt-0.5 text-xs text-slate-200 leading-normal">{alert.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
