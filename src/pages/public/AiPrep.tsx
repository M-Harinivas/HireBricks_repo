import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const AiPrep = () => (
    <div className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center flex flex-col items-center">
        <SEO
            title="AI Interview Prep | HireBricks"
            description="Practice behavioral and technical questions with our voice-enabled AI interviewer. Get real-time feedback."
        />
        <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent mb-8 shadow-inner">
            <Bot size={40} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 border border-border rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
            <Sparkles size={14} className="text-accent" />
            In Development
        </div>

        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-foreground mb-6">
            AI Interview Prep
        </h1>

        <p className="text-xl text-muted-foreground font-medium mb-12 max-w-2xl leading-relaxed">
            Practice behavioral and technical questions with our voice-enabled AI interviewer. Get real-time feedback on your answers, pacing, and tone.
        </p>

        <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 w-full max-w-xl shadow-xl">
            <h3 className="text-xl font-bold font-display mb-3">Want early access?</h3>
            <p className="text-sm text-muted-foreground mb-8">
                We're rolling out our AI interviewer to a select group of candidates. Create a free account to join the waitlist.
            </p>
            <Link to="/signup" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 btn-scale">
                Sign up for early access <ArrowRight size={18} />
            </Link>
        </div>
    </div>
);

export default AiPrep;
