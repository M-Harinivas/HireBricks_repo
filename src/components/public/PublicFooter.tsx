import { Link } from 'react-router-dom';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import { Instagram, Linkedin } from 'lucide-react';

export const PublicFooter = () => {
    return (
        <footer className="bg-primary text-primary-foreground pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
                    <div className="col-span-2">
                        <HireBricksLogo size="md" variant="light" />
                        <p className="text-primary-foreground/80 mt-4 max-w-xs text-sm leading-relaxed">
                            Connecting exceptional talent with forward-thinking companies. Your next great opportunity starts here.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <a href="#" className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.linkedin.com/company/hirebricks/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-base mb-5 text-primary-foreground">For Candidates</h4>
                        <ul className="space-y-3 text-sm text-primary-foreground/70">
                            <li><Link to="/jobs" className="hover:text-primary-foreground transition-colors">Browse Jobs</Link></li>
                            <li><Link to="/ai-interview-prep" className="hover:text-primary-foreground transition-colors">AI Interview Prep</Link></li>
                            <li><Link to="/candidate/profile" className="hover:text-primary-foreground transition-colors">Profile Builder</Link></li>
                            <li><Link to="/guides" className="hover:text-primary-foreground transition-colors">Career Guides</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-base mb-5 text-primary-foreground">For Recruiters</h4>
                        <ul className="space-y-3 text-sm text-primary-foreground/70">
                            <li><Link to="/login" className="hover:text-primary-foreground transition-colors">Post a Job</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary-foreground transition-colors">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-base mb-5 text-primary-foreground">Company</h4>
                        <ul className="space-y-3 text-sm text-primary-foreground/70">
                            <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
                    © {new Date().getFullYear()} HireBricks. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
