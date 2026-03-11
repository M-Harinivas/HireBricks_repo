import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, Role } from '@/hooks/useAuth';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import { Loader2, Briefcase, Building2, ChevronLeft, Mail, Lock, User, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type SignupStep = 'role' | 'form';

const SignupPage = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [step, setStep] = useState<SignupStep>('role');
    const [role, setRole] = useState<Role | null>(null);

    const [form, setForm] = useState({ company: '', name: '', email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRoleSelect = (selectedRole: Role) => {
        setRole(selectedRole);
        setStep('form');
    };

    const handleBack = () => {
        setStep('role');
        setRole(null);
    };

    const validateEmail = (emailStr: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailStr);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        if (!validateEmail(form.email)) {
            toast.error('Please enter a valid email address format.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await signup(form.email, form.password, {
                full_name: form.name,
                role: role,
                ...(role === 'RECRUITER' ? { company: form.company } : {})
            });
            if (result.success) {
                toast.success('Account created! Redirecting to dashboard...');
                navigate(role === 'RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard');
            } else {
                toast.error(result.error || 'Failed to create account');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignup = () => {
        toast('Google Sub-link is currently unavailable in this demo.', { icon: 'ℹ️' });
    };

    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">

            {/* Left Panel: Branded Visual (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 gradient-navy text-primary-foreground flex-col p-8 xl:p-12 relative overflow-hidden">
                {/* Abstract Background Effects */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 mb-2">
                    <HireBricksLogo size="lg" variant="light" />
                </div>

                {/* Neatly Centered Hero Image - Scaled down to prevent scrolling */}
                <div className="relative z-10 flex-1 flex items-center justify-center my-0 min-h-0 w-full">
                    <motion.img
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        src="/signup-hero-seamless.png"
                        alt="HireBricks Platform"
                        className="w-full max-w-[75%] object-contain mix-blend-screen max-h-[45vh]"
                        style={{
                            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
                            maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-md mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <h1 className="text-3xl lg:text-4xl font-display font-bold mb-3 leading-tight">
                            Start building your future.
                        </h1>
                        <p className="text-primary-foreground/80 text-base leading-relaxed">
                            Join thousands of professionals and progressive businesses in the smartest hiring network.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel: Interactive Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-20 relative">
                <div className="absolute inset-0 dot-grid opacity-50 z-0" />

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <HireBricksLogo size="lg" />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'role' && (
                            <motion.div
                                key="role"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-display font-bold text-foreground mb-3">Join HireBricks</h2>
                                    <p className="text-muted-foreground">Select how you'd like to use the platform.</p>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleRoleSelect('CANDIDATE')}
                                        className="w-full text-left card-interactive p-6 flex flex-col gap-4 group border-2 border-transparent hover:border-accent/40"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <User size={24} className="text-primary" />
                                            </div>
                                            <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-accent flex items-center justify-center transition-colors">
                                                <div className="w-2.5 h-2.5 rounded-full bg-accent scale-0 group-hover:scale-100 transition-transform" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">I am a Candidate</h3>
                                            <p className="text-sm text-muted-foreground">I want to find my dream job, connect with top employers, and get hired faster.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleRoleSelect('RECRUITER')}
                                        className="w-full text-left card-interactive p-6 flex flex-col gap-4 group border-2 border-transparent hover:border-accent/40"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                                <Building2 size={24} className="text-accent" />
                                            </div>
                                            <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-accent flex items-center justify-center transition-colors">
                                                <div className="w-2.5 h-2.5 rounded-full bg-accent scale-0 group-hover:scale-100 transition-transform" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">I am a Recruiter</h3>
                                            <p className="text-sm text-muted-foreground">I want to post jobs, manage applications, and hire the best.</p>
                                        </div>
                                    </button>
                                </div>

                                <p className="text-center text-sm text-muted-foreground mt-8">
                                    Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                                </p>
                            </motion.div>
                        )}

                        {step === 'form' && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="mb-8">
                                    <button
                                        onClick={handleBack}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors mb-6 -ml-2 p-2"
                                    >
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                    <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                                        {role === 'CANDIDATE' ? 'Create Candidate Account' : 'Create Recruiter Account'}
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        {role === 'CANDIDATE'
                                            ? "Start your career journey with smart matching."
                                            : "Build your dream team effortlessly."}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {role === 'RECRUITER' && (
                                        <div>
                                            <label className="text-sm font-medium block mb-1.5 text-foreground/80">
                                                Company Name <span className="text-destructive">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                                    <Building size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={form.company}
                                                    onChange={e => setForm({ ...form, company: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                                    placeholder="Acme Corp"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium block mb-1.5 text-foreground/80">
                                            Full Name <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                                <User size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                                placeholder={role === 'CANDIDATE' ? "John Doe" : "Jane Smith"}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium block mb-1.5 text-foreground/80">
                                            {role === 'RECRUITER' ? 'Work Email' : 'Email Address'} <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                                <Mail size={16} />
                                            </div>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value.toLowerCase() })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm lowercase"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium block mb-1.5 text-foreground/80">
                                            Password <span className="text-destructive">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type="password"
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/10 btn-scale"
                                        >
                                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                            {isSubmitting ? 'Creating account...' : 'Create Account'}
                                        </button>
                                    </div>
                                </form>

                                <p className="text-center text-xs text-muted-foreground mt-8 p-4 bg-muted/30 rounded-lg">
                                    By clicking Create Account, you agree to our <Link to="/terms" className="underline decoration-muted-foreground/50 hover:text-foreground hover:decoration-foreground">Terms of Use</Link> and acknowledge you have read our <Link to="/privacy" className="underline decoration-muted-foreground/50 hover:text-foreground hover:decoration-foreground">Privacy Policy</Link>.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
