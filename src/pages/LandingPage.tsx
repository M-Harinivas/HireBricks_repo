import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import {
  Brain, Video, Shield, ClipboardList, Star, Check, ArrowRight,
  Sparkles, Zap, Users, Building2, TrendingUp, Globe,
  ChevronRight, Menu, X, Play, Briefcase, Upload, Target, Heart
} from 'lucide-react';

/* ─── Scroll-Reveal Section ─── */
const Section = ({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref} id={id}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── Animated Counter ─── */
const Counter = ({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, end, { type: "spring", stiffness: 50, damping: 20, duration: 2 });
      return controls.stop;
    }
  }, [isInView, end, count]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-display font-bold text-primary flex items-center justify-center">
        <motion.span>{rounded}</motion.span><span>{suffix}</span>
      </div>
      <div className="text-sm text-muted-foreground mt-2 font-medium">{label}</div>
    </div>
  );
};

/* ─── Feature Data ─── */
const features = [
  {
    icon: Brain, title: 'Precision Filtering',
    desc: 'Our advanced tracking system helps you filter and evaluate candidates efficiently, highlighting the best talent fast.',
    highlights: ['Skill-based matching', 'Intelligent ranking', 'Contextual search'],
  },
  {
    icon: Video, title: 'Seamless Workflow',
    desc: 'Manage your entire hiring pipeline in one place. From job posting to offer letters, we keep everything synchronized.',
    highlights: ['Centralized dashboard', 'Pipeline management', 'Status tracking'],
  },
  {
    icon: Shield, title: 'Quality Assurance',
    desc: 'Ensure every candidate meets your baseline requirements before you ever spend time on a human interview.',
    highlights: ['Requirement matching', 'Experience verification', 'Standardized profiles'],
  },
  {
    icon: ClipboardList, title: 'Transparent Process',
    desc: 'Both sides win: recruiters get easy-to-manage candidate lists, candidates get a transparent application tracking experience.',
    highlights: ['Clear application status', 'Recruiter-candidate connection', 'Fast decision making'],
  },
];

const trustedLogos = ['Nexora', 'BlueStack', 'CloudNova', 'TalentGrid', 'SkillBridge', 'ScaleMint', 'HireLoop', 'DataForge'];

const testimonials = [
  { name: 'Anika Patel', role: 'VP Engineering, Nexora', quote: 'HireBricks reduced our time-to-hire by 40%. The platform is clean, fast, and candidates love the experience.', avatar: 'AP', side: 'recruiter' },
  { name: 'Arjun Mehta', role: 'Software Engineer', quote: 'Finally, a platform where I can easily track my applications. The process was transparent and I got an offer fast.', avatar: 'AM', side: 'candidate' },
  { name: 'Deepa Menon', role: 'Founder, CloudNova', quote: 'As a small team, HireBricks is our entire hiring department. From posting to offer letters — everything in one platform.', avatar: 'DM', side: 'recruiter' },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -50]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // Removed auto-rotate features interval based on user request.

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="HireBricks — Modern Hiring Platform for Top Teams"
        description="Screen, track, and hire top talent faster with our seamless hiring marketplace and advanced tracking tools. Free to get started."
      />

      {/* ═══ NAVBAR ═══ */}
      <PublicNavbar transparentDefault={true} />

      {/* ═══ HERO — Marketplace Focused ═══ */}
      <section className="relative pt-32 md:pt-40 pb-24 md:pb-32 overflow-hidden" ref={heroRef}>
        {/* Ambient Animated Mesh Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08)_0%,transparent_40%)]"
          />
        </div>
        {/* Subtle dot grid */}
        <div className="absolute inset-0 dot-grid opacity-30" />

        <motion.div style={{ y: heroY }} className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/15 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
          >
            <Sparkles size={14} />
            <span>The smarter way to hire & get hired</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.08] tracking-tight max-w-4xl mx-auto text-balance"
          >
            <span className="text-foreground">Where great talent</span>
            <br />
            <span className="text-foreground">meets great </span>
            <span className="text-gradient">opportunity.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            HireBricks connects candidates and recruiters through precision matching, seamless tracking, and transparent processes — making hiring fair, fast, and human.
          </motion.p>

          {/* Dual CTA — Both audiences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link to="/jobs" className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base flex items-center gap-2 hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 hover:-translate-y-1 btn-scale">
              <Briefcase size={18} />
              Find Your Dream Job
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="group bg-accent text-accent-foreground px-8 py-4 rounded-xl font-semibold text-base flex items-center gap-2 hover:shadow-xl hover:shadow-accent/15 transition-all duration-300 hover:-translate-y-1 btn-scale">
              <Users size={18} />
              Hire Top Talent
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-12 flex items-center justify-center gap-6 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['A', 'S', 'R', 'P'].map((letter, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-background ${i % 2 === 0 ? 'bg-primary' : 'bg-accent'}`}>
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground"><strong className="text-foreground">100+</strong> companies</span>
            </div>
            <div className="w-px h-5 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['M', 'K', 'J', 'L'].map((letter, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-background ${i % 2 === 0 ? 'bg-success' : 'bg-primary'}`}>
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground"><strong className="text-foreground">500+</strong> candidates</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated visual element — Marketplace connection graphic */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-20 max-w-4xl mx-auto px-6"
        >
          <div className="grid grid-cols-3 gap-4 md:gap-8 items-center">
            {/* Candidate side */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="card-elevated p-5 md:p-6 text-center"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Upload size={22} className="text-primary" />
              </div>
              <h4 className="font-display font-bold text-sm md:text-base">Candidates</h4>
              <p className="text-xs text-muted-foreground mt-1 hidden md:block">Upload resume, track applications, get placed</p>
            </motion.div>

            {/* Center — Connection Bridge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="relative"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto animate-pulse-glow">
                <Users size={28} className="text-accent" />
              </div>
              <div className="absolute top-1/2 -left-4 md:-left-8 w-4 md:w-8 h-0.5 bg-accent/30 -translate-y-1/2" />
              <div className="absolute top-1/2 -right-4 md:-right-8 w-4 md:w-8 h-0.5 bg-accent/30 -translate-y-1/2" />
              <p className="text-center text-xs font-semibold text-accent mt-3">Seamless Connection</p>
            </motion.div>

            {/* Recruiter side */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="card-elevated p-5 md:p-6 text-center"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Target size={22} className="text-accent" />
              </div>
              <h4 className="font-display font-bold text-sm md:text-base">Recruiters</h4>
              <p className="text-xs text-muted-foreground mt-1 hidden md:block">Post jobs, review profiles, hire fast</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ TRUSTED BY ═══ */}
      <Section className="py-14 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] mb-10">Trusted by forward-thinking teams</p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex gap-16 items-center" style={{ animation: 'marquee 30s linear infinite' }}>
              {[...trustedLogos, ...trustedLogos].map((name, i) => (
                <div key={i} className="shrink-0 text-xl font-display font-bold text-muted-foreground/20 select-none">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ STATS ═══ */}
      <Section className="py-20">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Counter end={100} suffix="+" label="Companies" />
          <Counter end={500} suffix="+" label="Candidates" />
          <Counter end={65} suffix="%" label="Faster Hiring" />
          <Counter end={95} suffix="%" label="Satisfaction Rate" />
        </div>
      </Section>

      {/* ═══ FEATURES ═══ */}
      <Section className="py-20 md:py-28 relative" id="features">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FEF3C7]/15 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              <Zap size={14} /> Why HireBricks
            </span>
            <h2 className="font-display text-3xl md:text-[2.75rem] font-bold leading-tight">A platform that works for both sides</h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Fair for candidates. Efficient for recruiters. Better outcomes for everyone.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-center max-w-6xl mx-auto">
            {/* Tab switcher */}
            <div className="lg:col-span-2 space-y-3">
              {features.map((f, i) => (
                <motion.button
                  key={i}
                  onMouseEnter={() => setActiveFeature(i)}
                  onClick={() => setActiveFeature(i)}
                  className={`relative w-full text-left px-6 py-5 rounded-xl transition-all duration-300 group overflow-hidden ${activeFeature === i
                    ? 'bg-card shadow-lg shadow-primary/5'
                    : 'bg-transparent hover:bg-card/50'
                    }`}
                  whileHover={{ x: activeFeature === i ? 0 : 4 }}
                >
                  {/* Left edge indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${activeFeature === i ? 'bg-accent' : 'bg-transparent'}`} />

                  <div className="flex items-center gap-4">
                    <f.icon size={22} className={activeFeature === i ? 'text-accent' : 'text-muted-foreground'} />
                    <h3 className={`font-display font-bold text-base md:text-lg ${activeFeature === i ? 'text-foreground' : 'text-muted-foreground'}`}>{f.title}</h3>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Feature visual */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="card-elevated rounded-2xl overflow-hidden shadow-2xl shadow-primary/5"
                >
                  <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-background p-8 md:p-12 min-h-[400px] flex flex-col justify-center items-center text-center relative border border-border/50">
                    <div className="absolute inset-0 dot-grid opacity-20" />

                    {/* Decorative glowing orb */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div className="relative z-10 w-full max-w-md">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-20 h-20 rounded-2xl bg-background border border-border shadow-xl flex items-center justify-center mx-auto mb-8 relative"
                      >
                        <div className="absolute inset-0 bg-accent/10 rounded-2xl animate-pulse" />
                        {(() => {
                          const Icon = features[activeFeature].icon;
                          return <Icon size={36} className="text-accent relative z-10" />;
                        })()}
                      </motion.div>

                      <motion.h3
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="font-display text-2xl font-bold mb-3"
                      >
                        {features[activeFeature].title}
                      </motion.h3>

                      <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-muted-foreground"
                      >
                        {features[activeFeature].desc}
                      </motion.p>

                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-8 flex flex-wrap gap-2 justify-center"
                      >
                        {features[activeFeature].highlights.map((h, j) => (
                          <span key={j} className="text-xs font-medium bg-background/80 backdrop-blur-sm border border-border px-4 py-2 rounded-full text-foreground/80 shadow-sm">
                            {h}
                          </span>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ HOW IT WORKS — Both perspectives ═══ */}
      <Section className="py-20 md:py-32" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              <Play size={14} /> How It Works
            </span>
            <h2 className="font-display text-3xl md:text-[2.75rem] font-bold">Simple for everybody</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
            {/* Candidate Flow */}
            <div className="relative">
              <div className="absolute top-20 bottom-20 left-[2.25rem] w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden sm:block" />
              <div className="flex items-center gap-4 mb-10 pl-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                  <Briefcase size={24} className="text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">For Candidates</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Create Your Profile', desc: 'Upload your resume to instantly populate your profile and highlight your experience.' },
                  { step: '02', title: 'Find Jobs & Apply', desc: 'Browse recommended opportunities and apply with one click. Your profile does the talking.' },
                  { step: '03', title: 'Connect & Get Hired', desc: 'Track your application status in real-time and coordinate interviews directly with recruiters.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="relative sm:pl-16 group"
                  >
                    <div className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 text-xs font-display font-bold bg-background border-2 border-primary/30 text-primary rounded-full items-center justify-center z-10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      {item.step}
                    </div>
                    <div className="card-elevated p-6 hover:border-primary/30 transition-colors duration-300">
                      <div className="flex items-center gap-3 mb-2 sm:hidden">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{item.step}</span>
                        <h4 className="font-display font-bold text-lg">{item.title}</h4>
                      </div>
                      <h4 className="font-display font-bold text-lg mb-2 hidden sm:block">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10 sm:pl-16">
                <Link to="/jobs" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300">
                  Start as Candidate <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Recruiter Flow */}
            <div className="relative mt-12 lg:mt-0">
              <div className="absolute top-20 bottom-20 left-[2.25rem] w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent hidden sm:block" />
              <div className="flex items-center gap-4 mb-10 pl-2">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-inner">
                  <Building2 size={24} className="text-accent" />
                </div>
                <h3 className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">For Recruiters</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Post Your Job', desc: 'Create a detailed listing with requirements and skills in minutes.' },
                  { step: '02', title: 'Review Applications', desc: 'Easily manage incoming candidates with our streamlined tracking system.' },
                  { step: '03', title: 'Hire With Confidence', desc: 'Connect with top talent, move them through the pipeline, and send offers.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="relative sm:pl-16 group"
                  >
                    <div className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 text-xs font-display font-bold bg-background border-2 border-accent/30 text-accent rounded-full items-center justify-center z-10 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                      {item.step}
                    </div>
                    <div className="card-elevated p-6 hover:border-accent/30 transition-colors duration-300">
                      <div className="flex items-center gap-3 mb-2 sm:hidden">
                        <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">{item.step}</span>
                        <h4 className="font-display font-bold text-lg">{item.title}</h4>
                      </div>
                      <h4 className="font-display font-bold text-lg mb-2 hidden sm:block">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10 sm:pl-16">
                <Link to="/login" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all duration-300">
                  Start as Recruiter <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ WHY BOTH SIDES LOVE IT ═══ */}
      <Section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FEF3C7]/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              <Heart size={14} /> Why Everyone Loves It
            </span>
            <h2 className="font-display text-3xl md:text-[2.75rem] font-bold">Built for the modern job market</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Globe, title: 'Hire Anywhere', desc: 'Connect with talent globally. No geographic restrictions, find the best fit for your team.' },
              { icon: TrendingUp, title: 'Faster Process', desc: 'Recruiters fill positions in less time. Our intuitive dashboard handles the heavy lifting.' },
              { icon: Shield, title: 'Transparent Tracking', desc: 'Every candidate knows exactly where they stand in the hiring pipeline.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-interactive p-8 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon size={24} className="text-accent" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ TESTIMONIALS ═══ */}
      <Section className="py-20 md:py-28" id="testimonials">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              <Star size={14} /> What People Say
            </span>
            <h2 className="font-display text-3xl md:text-[2.75rem] font-bold">Loved by both sides</h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="text-accent/20 mb-6">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                    <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                  </svg>
                </div>
                <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground ${testimonials[activeTestimonial].side === 'recruiter' ? 'bg-primary' : 'bg-accent'}`}>
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{testimonials[activeTestimonial].name}</div>
                    <div className="text-xs text-muted-foreground">{testimonials[activeTestimonial].role}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${testimonials[activeTestimonial].side === 'recruiter' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                  }`}>
                  {testimonials[activeTestimonial].side}
                </span>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-accent w-6' : 'bg-border hover:bg-muted-foreground/30'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ FINAL CTA ═══ */}
      <Section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-primary rounded-2xl p-10 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 dot-grid opacity-5" />
            <motion.div
              className="absolute -top-40 -right-40 w-96 h-96 bg-accent rounded-full blur-3xl opacity-20 pointer-events-none"
              animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
                Ready to connect?
              </h2>
              <p className="text-primary-foreground/80 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                Join the fastest-growing modern hiring marketplace. Whether you're building a team or advancing your career — your next step starts here.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/jobs" className="group bg-accent text-accent-foreground px-8 py-4 rounded-xl font-semibold text-base flex items-center gap-2 hover:shadow-xl hover:shadow-accent/40 hover:scale-105 active:scale-95 transition-all duration-300">
                  Find Jobs <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="border-2 border-primary-foreground/20 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base hover:bg-primary-foreground/10 hover:scale-105 active:scale-95 transition-all duration-300">
                  Start Hiring
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;
