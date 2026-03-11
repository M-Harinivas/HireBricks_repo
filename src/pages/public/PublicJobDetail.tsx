import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/apiService';
import { BriefcaseIcon, MapPin, Sparkles, Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicJobDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<any>(null);
    const [similarJobs, setSimilarJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // public facing details
                const data = await apiService.getJobById(id);
                setJob(data);

                // Fetch similar jobs based on domain
                if (data.domain && data.organization_id) {
                    const similarData = await apiService.getSimilarJobs(id, data.domain, data.organization_id);
                    setSimilarJobs(similarData);
                }
            } catch (err: any) {
                toast.error("Failed to load job details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobData();
    }, [id]);

    const handleApplyClick = () => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-fade-in' : 'animate-fade-out'} bg-card border-2 border-accent shadow-2xl rounded-xl p-4 flex gap-4 items-center`}>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><Sparkles size={20} /></div>
                <div><h3 className="font-bold text-foreground font-display">Sign up to apply</h3><p className="text-sm text-muted-foreground">Create a free account to apply with one click.</p></div>
            </div>
        ), { duration: 4000 });
        navigate('/signup');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="max-w-4xl mx-auto px-6 text-center py-20 min-h-[60vh]">
                <h2 className="text-2xl font-bold font-display">Job not found</h2>
                <button onClick={() => navigate('/jobs')} className="mt-4 text-accent hover:underline">Return to jobs</button>
            </div>
        );
    }

    // Parse arrays securely just in case
    const requiredSkills = Array.isArray(job.required_skills) ? job.required_skills : Array.isArray(job.skills) ? job.skills : [];
    const preferredSkills = Array.isArray(job.preferred_skills) ? job.preferred_skills : [];
    const toolsTech = Array.isArray(job.tools_tech) ? job.tools_tech : [];

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
            {/* Back Button */}
            <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
                <ArrowLeft size={16} /> Back to Search
            </button>

            {/* Header Section */}
            <div className="bg-card p-6 md:p-8 rounded-2xl mb-6 flex flex-col md:flex-row md:items-start justify-between gap-6 border border-border shadow-sm">
                <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-display font-bold text-3xl shrink-0">
                        {job.organizations?.name?.charAt(0) || job.title.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-4">
                            <Building2 size={16} /> {job.organizations?.name || 'Company'}
                            {job.domain && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-primary/80">{job.domain}</span>
                                </>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-background border border-border text-foreground text-xs font-bold rounded-md"><MapPin size={12} className="text-muted-foreground" /> {job.location}</span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-background border border-border text-foreground text-xs font-bold rounded-md"><BriefcaseIcon size={12} className="text-muted-foreground" /> {job.work_mode}</span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/10 text-accent text-xs font-bold rounded-md">{job.salary_currency === 'INR' ? '₹' : job.salary_currency}{job.salary_min && job.salary_max ? `${job.salary_min}–${job.salary_max}L` : job.salaryRange || 'Competitive'}</span>
                        </div>
                    </div>
                </div>

                {/* Floating Apply Call to Action */}
                <div className="bg-muted/10 border border-border/50 rounded-xl p-5 shadow-inner min-w-[240px]">
                    <h4 className="font-display font-bold text-sm mb-3 text-foreground text-center">Interested in this role?</h4>
                    <button
                        onClick={handleApplyClick}
                        className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold transition-all flex justify-center items-center h-12 shadow-md hover:bg-primary/90 active:scale-95 btn-scale"
                    >
                        Sign up to Apply
                    </button>
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground font-medium">
                        <CheckCircle2 size={12} className="text-green-500" /> Free 1-click apply access
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
                {/* Main Content Column */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border border-border/50 p-6 md:p-8 rounded-2xl shadow-sm">
                        <h3 className="font-display font-bold text-lg mb-6 text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
                            <BriefcaseIcon size={20} className="text-primary" /> About the Role
                        </h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground leading-relaxed">
                            {job.description || "Join our team to build scalable systems, collaborate with cross-functional experts, and drive innovation in our core product suite."}
                        </div>
                    </div>

                    {(requiredSkills.length > 0 || preferredSkills.length > 0 || toolsTech.length > 0) && (
                        <div className="bg-card border border-border/50 p-6 md:p-8 rounded-2xl space-y-8 shadow-sm">
                            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
                                <Sparkles size={20} className="text-accent" /> Skills & Technology
                            </h3>

                            {requiredSkills.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm mb-3 text-foreground">Required Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {requiredSkills.map((s: string) => <span key={s} className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide rounded-md">{s}</span>)}
                                    </div>
                                </div>
                            )}

                            {preferredSkills.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm mb-3 text-muted-foreground">Preferred Skills (Bonus)</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {preferredSkills.map((s: string) => <span key={s} className="px-3 py-1.5 bg-muted/50 border border-border/50 text-muted-foreground text-xs font-semibold rounded-md">{s}</span>)}
                                    </div>
                                </div>
                            )}

                            {toolsTech.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm mb-3 text-foreground">Tools & Technologies</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {toolsTech.map((s: string) => <span key={s} className="px-3 py-1.5 bg-secondary/30 text-secondary-foreground text-xs font-bold rounded-md">{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    <div className="bg-muted/10 border border-border/50 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                        <h3 className="font-bold text-base mb-6 text-foreground relative z-10">Requirements</h3>

                        <div className="space-y-5 relative z-10">
                            <div>
                                <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Experience Minimum</span>
                                <span className="text-sm font-semibold text-foreground">{job.experience || 'Not specified'}</span>
                            </div>

                            <div className="pt-5 border-t border-border/50">
                                <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Education Needed</span>
                                <span className="text-sm font-semibold text-foreground leading-tight block">{job.education_requirements || 'Relevant degree or equivalent experience'}</span>
                            </div>

                            <div className="pt-5 border-t border-border/50">
                                <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Department</span>
                                <span className="text-sm font-semibold text-foreground">{job.department || 'General'}</span>
                            </div>

                            <div className="pt-5 border-t border-border/50">
                                <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Open Vacancies</span>
                                <span className="text-sm font-semibold text-foreground">{job.vacancies || 1} available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Jobs Section */}
            {similarJobs && similarJobs.length > 0 && (
                <div className="mt-16 pt-10 border-t border-border">
                    <h2 className="text-xl font-display font-bold text-foreground mb-6">Similar Roles You Might Like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similarJobs.map(sj => (
                            <div
                                key={sj.id}
                                onClick={() => navigate(`/jobs/${sj.id}`)}
                                className="bg-card border border-border/50 p-5 rounded-xl cursor-pointer hover:border-accent hover:shadow-md transition-all group"
                            >
                                <h4 className="font-display font-bold text-base leading-tight group-hover:text-primary transition-colors">{sj.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1 mb-4">{sj.organizations?.name || 'Company'}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold">
                                    <span className="px-2 py-1 border border-border/50 bg-background rounded">{sj.location}</span>
                                    <span className="px-2 py-1 bg-accent/10 text-accent rounded">{sj.salary_currency === 'INR' ? '₹' : sj.salary_currency}{sj.salary_min && sj.salary_max ? `${sj.salary_min}–${sj.salary_max}L` : sj.salaryRange || 'Competitive'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicJobDetail;
