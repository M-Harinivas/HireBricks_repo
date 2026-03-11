import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import { useAuth } from '@/hooks/useAuth';

interface PublicNavbarProps {
    transparentDefault?: boolean;
}

export const PublicNavbar = ({ transparentDefault = true }: PublicNavbarProps) => {
    const [scrolled, setScrolled] = useState(!transparentDefault);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, profile } = useAuth();

    const getDashboardUrl = () => {
        if (profile?.role === 'ADMIN') return '/admin/dashboard';
        if (profile?.role === 'RECRUITER') return '/recruiter/dashboard';
        return '/candidate/dashboard';
    };

    useEffect(() => {
        if (!transparentDefault) {
            setScrolled(true);
            return;
        }
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        // Trigger once on mount
        handler();
        return () => window.removeEventListener('scroll', handler);
    }, [transparentDefault]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
                    ? 'bg-background/95 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border))]'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 md:h-18 flex items-center justify-between">
                    <HireBricksLogo />
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                            Find Jobs
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent rounded-full group-hover:w-full transition-all duration-300" />
                        </Link>
                        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                            Post a Job
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent rounded-full group-hover:w-full transition-all duration-300" />
                        </Link>
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="text-sm font-semibold text-primary hover:text-accent transition-colors px-4 py-2">
                                    Sign in
                                </Link>
                                <Link to="/signup" className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/15 btn-scale">
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <Link to={getDashboardUrl()} className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/15 btn-scale">
                                Go to Dashboard
                            </Link>
                        )}
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-background border-b border-border"
                        >
                            <div className="px-6 py-4 space-y-3">
                                <Link to="/jobs" className="block text-sm font-medium text-foreground py-2">Find Jobs</Link>
                                <Link to="/login" className="block text-sm font-medium text-foreground py-2">Post a Job</Link>
                                <div className="flex gap-3 pt-3 border-t border-border">
                                    {!isAuthenticated ? (
                                        <>
                                            <Link to="/login" className="flex-1 text-center text-sm font-semibold border border-border px-4 py-2.5 rounded-lg">Sign in</Link>
                                            <Link to="/signup" className="flex-1 text-center text-sm font-semibold bg-primary text-primary-foreground px-4 py-2.5 rounded-lg">Sign up</Link>
                                        </>
                                    ) : (
                                        <Link to={getDashboardUrl()} className="flex-1 text-center text-sm font-semibold bg-primary text-primary-foreground px-4 py-2.5 rounded-lg">Go to Dashboard</Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </>
    );
};
