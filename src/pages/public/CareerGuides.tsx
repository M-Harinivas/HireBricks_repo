import { BookOpen } from 'lucide-react';
import { SEO } from '@/components/SEO';
const CareerGuides = () => (
    <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
        <SEO
            title="Career Guides | HireBricks"
            description="Actionable advice and deep dives into passing technical interviews and negotiating offers."
        />
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground mb-4">Career Guides</h1>
        <p className="text-lg text-muted-foreground font-medium mb-16 max-w-2xl">
            Actionable advice and deep dives into passing technical interviews, negotiating offers, and accelerating your career.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <a key={i} href="#" className="group block bg-card border border-border/50 rounded-xl p-6 hover:shadow-md hover:border-border transition-all">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <BookOpen size={20} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                        The System Design Interview Handbook
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        A comprehensive guide to structuring your thoughts, scoping requirements, and designing scalable architectures under pressure.
                    </p>
                </a>
            ))}
        </div>
    </div>
);

export default CareerGuides;
