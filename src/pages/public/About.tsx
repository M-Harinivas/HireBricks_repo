import { motion } from 'framer-motion';
import { Sparkles, Users, Target, CheckCircle2 } from 'lucide-react';
import { SEO } from '@/components/SEO';

const About = () => {
    return (
        <div className="bg-background pt-16 pb-0 overflow-hidden">
            <SEO
                title="About Us | HireBricks"
                description="Learn about HireBricks and our mission to make hiring fair, fast, and human through innovative technology."
            />

            {/* HERO SECTION: Massive Typographic Hero + Layered Depth */}
            <section className="relative w-full min-h-[70vh] flex items-end pb-12 md:pb-20">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop"
                        alt="Modern team context"
                        width="2670"
                        height="1780"
                        className="w-full h-full object-cover grayscale opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>

                {/* Massive Typography Overlay */}
                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="text-6xl md:text-8xl lg:text-[140px] font-display font-black tracking-tighter text-foreground leading-[0.85] uppercase">
                            Hire <br className="hidden md:block" /> Different.
                        </h1>
                        <p className="text-xl md:text-3xl text-muted-foreground font-medium mt-8 max-w-3xl border-l-4 border-primary pl-6">
                            HireBricks was built on a simple premise: recruiting should not be an administrative nightmare. It should be a strategic advantage.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* CONTENT SECTION: Extreme Asymmetry & Fragmentation */}
            <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">

                    {/* Left Prose Content (7 Columns) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7 prose prose-lg dark:prose-invert prose-p:text-muted-foreground prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-a:text-primary max-w-none"
                    >
                        <h2 className="text-3xl border-b-2 border-primary/20 pb-4 mb-8 inline-block">The Problem</h2>
                        <p className="text-xl leading-relaxed">
                            Legacy ATS platforms are bloated, slow, and universally despised by both recruiters and candidates. They optimize for HR compliance rather than the actual user experience of finding a job or finding a teammate. Candidates are forced into archaic portals, and recruiters spend more time managing software than building relationships.
                        </p>

                        <h2 className="text-3xl border-b-2 border-primary/20 pb-4 mt-16 mb-8 inline-block">Our Mission</h2>
                        <p className="text-xl leading-relaxed">
                            We are engineering a profoundly better way to connect talent with opportunity. By utilizing advanced AI matching, removing unnecessary friction from the application process, and prioritizing speed and clarity in the recruiter dashboard, we are accelerating the hiring lifecycle for everyone involved.
                        </p>

                        <div className="bg-primary/5 border-l-4 border-primary p-6 my-10 font-medium text-foreground text-lg">
                            We believe in flat pricing. We believe in design. We believe that software should get out of your way.
                        </div>

                        <h2 className="text-3xl border-b-2 border-primary/20 pb-4 mt-16 mb-8 inline-block">Join Us</h2>
                        <p className="text-xl leading-relaxed">
                            We are a fast-growing team of technologists, designers, and industry veterans on a mission to reshape the future of hiring. We value extreme ownership, rapid iteration, and a deep empathy for our users. If you're driven to build systems that scale and software that matters, <a href="mailto:careers@hirebricks.com" className="font-bold border-b border-primary hover:bg-primary/10 transition-colors no-underline">drop us a line.</a>
                        </p>
                    </motion.div>

                    {/* Right Visual AI Element (5 Columns) */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24 h-[600px] w-full">
                            {/* Sharp Geometry Decoration */}
                            <div className="absolute -inset-4 border-2 border-foreground/10 z-0 hidden lg:block" />
                            <div className="absolute -inset-2 bg-muted/20 z-0" />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10 w-full h-full overflow-hidden shadow-2xl"
                            >
                                <img
                                    src="/images/ai_recruitment_abstract.png"
                                    alt="AI Recruitment Abstract"
                                    width="600"
                                    height="600"
                                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                                />
                                {/* Overlay gradient to merge with layout */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-background/90 backdrop-blur-md border border-border p-4">
                                        <div className="flex items-center gap-3 text-primary font-bold text-sm tracking-wider uppercase mb-1">
                                            <Sparkles size={16} /> Intelligent Matching
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">Removing the friction between talent and opportunity via advanced heuristics.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
