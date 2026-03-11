import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, Wifi, Shield, Check, Play, Square, ArrowLeft, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from '@/lib/confetti';

type Phase = 'pre' | 'interview' | 'post';

const CandidateInterview = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('pre');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [timer, setTimer] = useState(0);

  const questions = [
    'Tell me about your experience in financial analysis.',
    'How do you approach building financial models?',
    'Describe a time you identified a significant cost-saving opportunity.',
    'How do you handle tight deadlines with multiple deliverables?',
    'Where do you see yourself in 3 years?',
  ];

  const startInterview = () => {
    setPhase('interview');
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    setTimeout(() => { clearInterval(interval); }, 600000);
  };

  const endInterview = () => { setPhase('post'); confetti(); };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-[80vh]">
      <AnimatePresence mode="wait">
        {phase === 'pre' && (
          <motion.div key="pre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto space-y-6 py-8">
            <h1 className="text-2xl font-bold text-center">System Check</h1>
            <div className="card-elevated p-6 space-y-4">
              {[{ icon: Camera, label: 'Camera', ok: true }, { icon: Mic, label: 'Microphone', ok: true }, { icon: Wifi, label: 'Internet Connection', ok: true }].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><item.icon size={18} className="text-muted-foreground" /><span className="text-sm">{item.label}</span></div>
                  <span className="flex items-center gap-1 text-sm text-success"><Check size={14} /> Ready</span>
                </div>
              ))}
            </div>
            <div className="card-elevated p-5 flex items-start gap-3 bg-warning/5 border-warning/20">
              <Shield size={18} className="text-warning mt-0.5" />
              <div><h4 className="text-sm font-semibold">Proctoring Notice</h4><p className="text-xs text-muted-foreground mt-1">This interview is proctored. Tab switches and background activity may be flagged.</p></div>
            </div>
            <div className="card-elevated p-5">
              <h4 className="text-sm font-semibold mb-2">Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Find a quiet, well-lit environment</li>
                <li>• Speak clearly and at a moderate pace</li>
                <li>• Take a moment to think before answering</li>
              </ul>
            </div>
            <button onClick={startInterview} className="w-full gradient-accent text-accent-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Play size={16} /> Start Interview</button>
          </motion.div>
        )}

        {phase === 'interview' && (
          <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[80vh] gradient-navy rounded-2xl p-8 flex flex-col items-center justify-center text-primary-foreground relative">
            <div className="absolute top-6 right-6 text-sm font-mono">{formatTime(timer)}</div>
            <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mb-6 animate-pulse"><Bot size={36} /></div>
            <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-6 max-w-lg text-center mb-8">
              <p className="text-sm text-primary-foreground/60 mb-1">Question {questionIdx + 1} of {questions.length}</p>
              <p className="text-lg font-medium">{questions[questionIdx]}</p>
            </div>
            <div className="flex items-center gap-3 mb-6">
              {[...Array(20)].map((_, i) => <div key={i} className="w-1 bg-cyan rounded-full animate-pulse" style={{ height: `${Math.random() * 30 + 10}px`, animationDelay: `${i * 0.05}s` }} />)}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setMicOn(!micOn)} className={`w-12 h-12 rounded-full flex items-center justify-center ${micOn ? 'bg-accent' : 'bg-destructive'}`}><Mic size={20} /></button>
              {questionIdx < questions.length - 1 ? (
                <button onClick={() => setQuestionIdx(i => i + 1)} className="px-6 py-2 bg-primary-foreground/20 rounded-lg text-sm font-medium">Next Question</button>
              ) : (
                <button onClick={endInterview} className="px-6 py-2 bg-destructive rounded-lg text-sm font-semibold flex items-center gap-2"><Square size={14} /> End Interview</button>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'post' && (
          <motion.div key="post" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
            <p className="text-muted-foreground mb-8">Your responses have been recorded. We'll notify you once the evaluation is ready.</p>
            <button onClick={() => navigate('/candidate/dashboard')} className="gradient-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto"><ArrowLeft size={16} /> Back to Dashboard</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidateInterview;
