import { SEO } from '@/components/SEO';
import { motion } from 'framer-motion';

const Privacy = () => (
    <div className="bg-background pt-16 pb-12 overflow-hidden">
        <SEO
            title="Privacy Policy | HireBricks"
            description="HireBricks Privacy Policy. Learn how we collect, use, and protect your information."
        />

        {/* Minimal Typographic Header */}
        <div className="w-full bg-muted/20 border-b border-border">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-6xl font-display font-black tracking-tight text-foreground uppercase"
                >
                    Privacy Policy
                </motion.h1>
                <p className="text-muted-foreground mt-4 font-medium">Last updated: March 2026</p>
            </div>
        </div>

        {/* Content Section with Sticky Sidebar & Brutalist Structure */}
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-20">

                {/* Left Sidebar Table of Contents */}
                <div className="hidden lg:block lg:col-span-1 border-r border-border pr-6">
                    <div className="sticky top-24">
                        <h4 className="font-bold text-sm tracking-wider uppercase text-muted-foreground mb-6">Contents</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><a href="#info-collect" className="text-foreground hover:text-primary transition-colors">1. Information We Collect</a></li>
                            <li><a href="#how-we-use" className="text-foreground hover:text-primary transition-colors">2. How We Use Your Information</a></li>
                            <li><a href="#info-sharing" className="text-foreground hover:text-primary transition-colors">3. Information Sharing</a></li>
                            <li><a href="#data-retention" className="text-foreground hover:text-primary transition-colors">4. Data Retention and Security</a></li>
                            <li><a href="#contact-us" className="text-foreground hover:text-primary transition-colors">5. Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                {/* Main Content Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="lg:col-span-3 prose prose-base dark:prose-invert prose-p:text-muted-foreground prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-a:text-primary max-w-none"
                >
                    <div className="space-y-12">
                        <section id="info-collect" className="scroll-mt-24">
                            <h2 className="text-2xl border-b-2 border-primary/20 pb-3 mb-6 inline-block">1. Information We Collect</h2>
                            <p className="leading-relaxed">
                                When you use HireBricks, we collect information you provide directly to us (such as when you create an account, upload a resume, or post a job). This includes your name, email address, professional experience, and any other details you choose to share.
                            </p>
                        </section>

                        <section id="how-we-use" className="scroll-mt-24">
                            <h2 className="text-2xl border-b-2 border-primary/20 pb-3 mb-6 inline-block">2. How We Use Your Information</h2>
                            <p className="leading-relaxed">
                                We use the information we collect to operate, maintain, and improve our services. Specifically, we use it to match candidates with relevant job opportunities, allow recruiters to manage applications, and to communicate with you about your account or our platform.
                            </p>
                        </section>

                        <section id="info-sharing" className="scroll-mt-24">
                            <h2 className="text-2xl border-b-2 border-primary/20 pb-3 mb-6 inline-block">3. Information Sharing</h2>
                            <p className="leading-relaxed">
                                If you are a candidate, your profile and application information is shared with the specific employers to whom you apply. We do not sell your personal data to third-party brokers or advertisers.
                            </p>
                        </section>

                        <section id="data-retention" className="scroll-mt-24">
                            <h2 className="text-2xl border-b-2 border-primary/20 pb-3 mb-6 inline-block">4. Data Retention and Security</h2>
                            <p className="leading-relaxed">
                                We employ industry-standard encryption and security measures to protect your data. We retain your personal information only for as long as necessary to provide you with our services and fulfill the purposes described in this policy.
                            </p>
                        </section>

                        <section id="contact-us" className="scroll-mt-24">
                            <h2 className="text-2xl border-b-2 border-primary/20 pb-3 mb-6 inline-block">5. Contact Us</h2>
                            <div className="bg-muted/10 border-l-4 border-foreground p-6 mt-4">
                                <p className="mb-0">
                                    If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@hirebricks.com" className="font-bold border-b border-primary hover:bg-primary/10 transition-colors no-underline">privacy@hirebricks.com</a>.
                                </p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    </div>
);

export default Privacy;
