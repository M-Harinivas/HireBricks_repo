import { motion } from 'framer-motion';

const Terms = () => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
            >
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <p className="lead text-lg mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                        <p>By accessing or using HireBricks, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials (information or software) on HireBricks' website for personal, non-commercial transitory viewing only.</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>attempt to decompile or reverse engineer any software contained on HireBricks' website;</li>
                            <li>remove any copyright or other proprietary notations from the materials.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                        <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default Terms;
