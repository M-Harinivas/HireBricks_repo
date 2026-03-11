import { Check, Info, Zap } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Link } from 'react-router-dom';

const Pricing = () => {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <SEO
                title="Pricing | HireBricks"
                description="Simple, transparent pricing for teams of all sizes. No hidden fees, just smart hiring."
            />
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter mb-4 text-foreground">
                        Flat and Simple <span className="text-accent underline decoration-accent/30 underline-offset-8">pricing</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">
                        Use HireBricks for free or upgrade to Pro at a flat rate.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-stretch gap-0 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="flex-1 bg-card border border-border/50 border-r-0 rounded-l-2xl p-8 md:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl font-display font-bold mb-6 text-foreground">Free</h3>
                        <ul className="space-y-4 mb-10 text-muted-foreground font-medium text-sm">
                            <li className="flex items-center gap-3"><Check size={18} className="text-primary/40" /> Unlimited candidates</li>
                            <li className="flex items-center gap-3"><Check size={18} className="text-primary/40" /> Up to 5 active jobs</li>
                            <li className="flex items-center gap-3"><Check size={18} className="text-primary/40" /> Basic AI Matching</li>
                        </ul>
                        <Link to="/signup" className="mt-auto px-6 py-3 border-2 border-border text-foreground font-bold rounded-lg text-center hover:bg-muted btn-scale transition-colors w-fit">
                            Get started
                        </Link>
                    </div>

                    {/* Pro Tier */}
                    <div className="flex-[1.2] bg-card border-2 border-accent rounded-2xl p-8 md:p-12 shadow-2xl shadow-accent/5 relative z-10 flex flex-col justify-center">
                        <div className="mb-2">
                            <span className="text-5xl font-display font-black tracking-tight text-foreground">₹3,999</span>
                            <span className="text-muted-foreground font-medium"> / month</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-8 font-medium">Or ₹39,990 for a year and get 2 months for free.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mb-10 text-sm font-medium text-foreground">
                            <div className="flex items-start gap-2"><div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5"><Check size={12} className="text-accent" /></div> Flat, fixed pricing</div>
                            <div className="flex items-start gap-2"><div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5"><Check size={12} className="text-accent" /></div> Unlimited recruiters</div>
                            <div className="flex items-start gap-2"><div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5"><Check size={12} className="text-accent" /></div> No per user-fees</div>
                            <div className="flex items-start gap-2"><div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5"><Check size={12} className="text-accent" /></div> Up to 100 active jobs</div>
                        </div>

                        <Link to="/signup" className="mt-auto w-fit px-8 py-3 bg-secondary-foreground text-secondary rounded-lg font-bold hover:brightness-110 btn-scale transition-all">
                            Request access
                        </Link>
                        <p className="text-[10px] text-muted-foreground mt-3">30-day free trial. Tax excluded.</p>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-3">
                        Do you need to manage more than 100 active jobs?
                        <button className="px-3 py-1.5 border border-border rounded-md text-foreground font-semibold hover:bg-muted transition-colors text-xs">Get in touch</button>
                    </p>
                </div>

                <div className="mt-32 text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-xl text-3xl font-display font-black tracking-tight mb-6 shadow-xl shadow-accent/20">
                        🔥 Unlimited <span className="text-background">seats</span>
                    </div>
                    <p className="text-lg font-medium text-foreground leading-relaxed">
                        Everyone in your company needs to be involved in hiring amazing talent.<br />
                        Invite your managers, technical leads, and interviewers for $0.
                    </p>
                </div>

                <div className="mt-32 mb-20">
                    <h2 className="text-3xl font-display font-bold text-center mb-12">Questions & answers</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            { q: "What is an active job?", a: "An active job is a position that is currently open and accepting applications." },
                            { q: "Why do you bill based on active jobs?", a: "We believe you shouldn't be penalized for growing your hiring team. You only pay for the scale of your hiring efforts, not the number of people collaborating." },
                            { q: "What happens if I have more than 100 active jobs?", a: "Reach out to our sales team for an Enterprise plan tailored to your high-volume hiring needs." },
                            { q: "How can I check how many active jobs I currently have?", a: "Your dashboard clearly displays your active job count at all times." }
                        ].map((faq, i) => (
                            <details key={i} className="group bg-card border border-border/50 rounded-xl p-6 open:shadow-md transition-all cursor-pointer">
                                <summary className="text-base flex justify-between font-bold text-foreground outline-none list-none select-none">
                                    {faq.q}
                                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="mt-4 text-sm text-muted-foreground leading-relaxed pr-8">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-32 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
                        Find <span className="bg-primary text-primary-foreground px-3 py-1 rounded-lg">Talent</span> and <span className="bg-amber-500 text-white px-3 py-1 rounded-lg">track</span><br />
                        in a <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg">simple</span> and <span className="bg-rose-500 text-white px-3 py-1 rounded-lg">fast</span> way.
                    </h2>
                    <div className="pt-8">
                        <Link to="/signup" className="inline-block px-8 py-3 bg-secondary-foreground text-secondary rounded-lg font-bold hover:brightness-110 btn-scale transition-all">
                            Start hiring now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
