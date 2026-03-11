import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, profile } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!profile) return;
    if (profile.role === 'ADMIN') navigate('/admin/dashboard');
    else if (profile.role === 'RECRUITER') navigate('/recruiter/dashboard');
    else navigate('/candidate/dashboard');
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success && result.profile) {
        const userProfile = result.profile;
        toast.success(`Welcome back, ${userProfile.full_name || 'User'}!`);

        // Use the profile from result for immediate redirection
        if (userProfile.role === 'ADMIN') navigate('/admin/dashboard');
        else if (userProfile.role === 'RECRUITER') navigate('/recruiter/dashboard');
        else navigate('/candidate/dashboard');
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Left Panel: Branded Visual (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 gradient-navy text-primary-foreground flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <HireBricksLogo size="lg" variant="light" />
        </div>

        <div className="relative z-10 max-w-md my-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
              Connecting talent with possibility.
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-12">
              Join the HireBricks platform to streamline your recruitment or find your next dream job today.
            </p>
          </motion.div>
        </div>
        {/* Empty div to maintain flex alignment */}
        <div></div>
      </div>

      {/* Right Panel: Interactive Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-20 relative">
        <div className="absolute inset-0 dot-grid opacity-50 z-0" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <HireBricksLogo size="lg" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="card-elevated rounded-[1.5rem] p-8 md:p-10 border border-border/60 shadow-xl"
          >
            <h1 className="text-[1.75rem] font-display font-bold mb-2 flex items-center gap-2">Welcome Back! <span className="text-2xl">👋</span></h1>
            <p className="text-muted-foreground text-[15px] mb-8">Sign in to access your dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold block mb-2 text-foreground/90">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value.toLowerCase())}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all lowercase"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-foreground/90">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[13px] text-accent font-medium hover:text-accent/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-card/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all pr-12 track-password"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#5DCB73] hover:bg-[#4FB763] text-white py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 shadow-sm"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {isSubmitting ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <div className="mt-8 text-center bg-muted/30 p-4 rounded-xl">
              <p className="text-[13px] text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
