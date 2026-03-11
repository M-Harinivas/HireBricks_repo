import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import { Loader2, Mail, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { resetPasswordForEmail } = useAuth();

    const validateEmail = (emailStr: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailStr);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address format.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await resetPasswordForEmail(email);
            if (result.success) {
                setIsSuccess(true);
                toast.success('Password reset email sent!');
            } else {
                toast.error(result.error || 'Failed to send reset email.');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
            <div className="absolute inset-0 dot-grid" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-[420px]"
            >
                <div className="card-elevated rounded-2xl p-8 md:p-10">
                    <div className="flex justify-center mb-8">
                        <HireBricksLogo size="lg" />
                    </div>

                    <h1 className="text-2xl font-display font-bold text-center mb-1">Reset Password</h1>
                    <p className="text-muted-foreground text-sm text-center mb-8">
                        {isSuccess ? "Check your email for reset instructions." : "Enter your email to reset your password."}
                    </p>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium block mb-1.5">
                                    Email Address <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value.toLowerCase())}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all lowercase shadow-sm"
                                        placeholder="you@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 btn-scale mt-4"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="p-4 bg-success/10 rounded-lg border border-success/20 text-center space-y-3 mb-6">
                            <p className="text-sm font-medium text-success-foreground">We've sent a recovery link to:</p>
                            <p className="font-semibold text-foreground">{email}</p>
                            <p className="text-xs text-muted-foreground">Please check your inbox and spam folder.</p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
