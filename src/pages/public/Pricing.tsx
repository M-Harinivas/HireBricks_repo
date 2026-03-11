import { Check, Shield, Users, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Pricing = () => {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24 overflow-hidden">
            <SEO
                title="Pricing | HireBricks"
                description="Zero cost. Infinite scale. Stop penalizing your growth with legacy ATS per-seat fees."
            />

            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[500px] w-full overflow-hidden pointer-events-none">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />
                <div className="absolute inset-0 dot-grid opacity-30" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Hero Header */}
                <div className="text-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-8"
                    >
                        <Zap size={14} /> 100% Free
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter mb-6 text-foreground uppercase leading-[0.9]"
                    >
                        Scale without <br /><span className="text-primary italic pr-2">Penalty.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed"
                    >
                        Legacy recruitment tools tax your success. They charge per seat, per job, and per candidate. We believe the tools you use to build your team shouldn't drain the budget meant to pay them.
                    </motion.p>
                </div>

                {/* The "Dilemma" / Conversion Block */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-4xl mx-auto relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-1000 rounded-3xl" />

                    <div className="relative bg-card border border-border/50 rounded-3xl p-8 md:p-16 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />

                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            {/* Value Prop */}
                            <div className="flex-1">
                                <h2 className="text-3xl md:text-5xl font-display font-black mb-4 uppercase tracking-tight">
                                    The <span className="text-accent underline decoration-accent/30 underline-offset-8">Unfair</span> Advantage
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Why pay thousands for bloated legacy software when you can access next-generation AI matching, instant pipelines, and unlimited collaboration for absolute zero?
                                </p>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                            <Users size={20} className="text-accent" />
                                        </div>
                                        <div className="font-bold text-lg">Unlimited team seats & recruiters</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                                            <TrendingUp size={20} className="text-success" />
                                        </div>
                                        <div className="font-bold text-lg">Infinite active job postings</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Sparkles size={20} className="text-primary" />
                                        </div>
                                        <div className="font-bold text-lg">Premium AI Matching included</div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Box */}
                            <div className="w-full md:w-[320px] bg-background border border-border p-8 rounded-2xl text-center relative z-10 shrink-0 shadow-xl">
                                <div className="text-muted-foreground font-bold tracking-widest uppercase text-xs mb-2">Platform Access</div>
                                <div className="text-6xl font-display font-black text-foreground mb-2">$0<span className="text-xl text-muted-foreground font-medium">/mo</span></div>
                                <p className="text-sm text-muted-foreground mb-8">No credit card. No hidden tiers. No catch.</p>

                                <Link to="/signup" className="block w-full py-4 bg-primary text-primary-foreground text-lg font-bold rounded-xl hover:shadow-xl hover:-translate-y-1 hover:shadow-primary/25 transition-all duration-300">
                                    Claim Your Account
                                </Link>
                                <p className="text-xs text-muted-foreground mt-4 font-medium">Join 500+ forward-thinking teams.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tactical FAQs */}
                <div className="mt-32 mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-black uppercase tracking-tight">The Elephants in the Room</h2>
                        <p className="text-muted-foreground mt-4 font-medium">We know what you're thinking. Let's clear it up.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        <div className="bg-card/50 border border-border/50 p-8 rounded-2xl hover:bg-card transition-colors">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Shield size={24} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">What is the catch?</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                There isn't one. The recruitment software industry has normalized charging exorbitant fees for basic database access. We are breaking that model to build liquidity and a superior marketplace first.
                            </p>
                        </div>

                        <div className="bg-card/50 border border-border/50 p-8 rounded-2xl hover:bg-card transition-colors">
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                                <Check size={24} className="text-accent" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">But will I outgrow the free tier?</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                No. You get unlimited active jobs, unlimited team seats, and unlimited candidate applications. You can scale from your first hire to your thousandth without hitting a paywall.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center mt-32 mb-16">
                    <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-8">
                        Stop Paying. <span className="text-primary italic">Start Hiring.</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup" className="px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                            Build Your Team
                        </Link>
                        <Link to="/jobs" className="px-10 py-4 bg-background border-2 border-border text-foreground font-bold text-lg rounded-xl hover:bg-muted transition-all duration-300">
                            Find a Job
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
