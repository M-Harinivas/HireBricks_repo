import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/apiService';
import { useAuth } from '@/hooks/useAuth';
import { BriefcaseIcon, MapPin, Sparkles, Building2, ArrowLeft, ArrowRight, CheckCircle2, X, ExternalLink, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const CandidateJobDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [job, setJob] = useState<any>(null);
    const [similarJobs, setSimilarJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [applicationData, setApplicationData] = useState<any>(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyVariants, setApplyVariants] = useState<any[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState<string>('main');
    const [applicationStep, setApplicationStep] = useState<number>(1);
    const [mainProfileData, setMainProfileData] = useState<any>(null);

    useEffect(() => {
        const fetchJobData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await apiService.getJobById(id);
                setJob(data);

                // Fetch similar jobs based on domain
                const similarData = await apiService.getSimilarJobs(id, data.domain, data.organization_id);
                setSimilarJobs(similarData);

                // Fetch application status
                if (profile) {
                    const appData = await apiService.checkApplicationStatus(id, profile.id);
                    if (appData) {
                        setHasApplied(true);
                        setApplicationData(appData);
                    }
                }
            } catch (err: any) {
                toast.error("Failed to load job details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobData();
    }, [id, profile]);

    const handleApplyClick = async () => {
        if (!profile) {
            toast.error('Please log in to apply.');
            return;
        }

        if (hasApplied) {
            toast.error('You have already applied for this job. Please check other jobs.');
            return;
        }

        if (!profile.full_name || !profile.email || !profile.phone || !profile.location) {
            toast.error('Please complete your profile (Name, Email, Phone, Location) before applying.', { duration: 4000 });
            navigate('/candidate/profile');
            return;
        }

        setIsApplying(true);
        try {
            const [variantsData, fullProfile] = await Promise.all([
                apiService.getCandidateProfiles(profile.id),
                apiService.getProfile(profile.id)
            ]);
            setApplyVariants(variantsData || []);
            setMainProfileData(fullProfile);
            setApplicationStep(1);
            setSelectedVariantId('main');
            setShowApplyModal(true);
        } catch (error) {
            toast.error('Failed to load profiles for application.');
        } finally {
            setIsApplying(false);
        }
    };

    const handleConfirmApply = async () => {
        setIsApplying(true);
        try {
            let candidate_profile_id = null;
            let resume_url = mainProfileData?.resume_url || null;

            if (selectedVariantId !== 'main') {
                const variant = applyVariants.find(v => v.id === selectedVariantId);
                if (variant) {
                    candidate_profile_id = variant.id;
                    resume_url = variant.resume_url;
                }
            }

            if (!resume_url) {
                toast.error('The selected profile does not have a resume attached. Please update it first.');
                setIsApplying(false);
                return;
            }

            await apiService.createApplication({
                job_id: id,
                candidate_id: profile.id,
                status: 'APPLIED',
                ai_score: null,
                candidate_profile_id,
                resume_url
            });

            setShowApplyModal(false);
            setHasApplied(true);

            const duration = 3 * 1000;
            const end = Date.now() + duration;
            const frame = () => {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#1B3B6F', '#F59E0B', '#10B981'] });
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#1B3B6F', '#F59E0B', '#10B981'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-fade-in' : 'animate-fade-out'} bg-card border-2 border-accent shadow-2xl rounded-xl p-4 flex gap-4 items-center`}>
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><Sparkles size={20} /></div>
                    <div><h3 className="font-bold text-foreground font-display">Application Sent!</h3><p className="text-sm text-muted-foreground">The recruiter will review your profile shortly.</p></div>
                </div>
            ), { duration: 4000 });
        } catch (err: any) {
            if (err.message && (err.message.includes('23505') || err.message.includes('11000') || err.message.includes('duplicate key'))) {
                toast.error('You have already applied for this job. Please check other jobs.');
                setHasApplied(true);
                setShowApplyModal(false);
            } else {
                toast.error(err.message || 'Failed to submit application.');
            }
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="page-container text-center py-20">
                <h2 className="text-xl font-bold font-display">Job not found</h2>
                <button onClick={() => navigate('/candidate/jobs')} className="mt-4 text-accent hover:underline">Return to jobs</button>
            </div>
        );
    }

    // Parse arrays securely just in case
    const requiredSkills = Array.isArray(job.required_skills) ? job.required_skills : Array.isArray(job.skills) ? job.skills : [];
    const preferredSkills = Array.isArray(job.preferred_skills) ? job.preferred_skills : [];
    const toolsTech = Array.isArray(job.tools_tech) ? job.tools_tech : [];

    return (
        <div className="page-container max-w-4xl pb-24">
            {/* Back Button */}
            <button
                onClick={() => navigate('/candidate/jobs')}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
                <ArrowLeft size={16} /> Back to Search
            </button>

            {/* Header Section */}
            <div className="glass-card p-6 md:p-8 rounded-2xl mb-6 flex flex-col md:flex-row md:items-start justify-between gap-6 border border-border">
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
                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm min-w-[240px]">
                    <button
                        onClick={handleApplyClick}
                        disabled={isApplying || hasApplied}
                        className={`w-full py-3 rounded-lg text-sm font-bold transition-all flex justify-center items-center h-12 shadow-md btn-scale 
                            ${hasApplied ? 'bg-success/10 text-success border border-success/20 cursor-not-allowed' : 'bg-accent text-white hover:brightness-110 active:scale-95 shadow-accent/20'}`}
                    >
                        {isApplying ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : hasApplied ? (
                            <span className="flex items-center gap-1.5 text-base"><CheckCircle2 size={16} /> Applied Successfully</span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-base">Fast Apply <Sparkles size={16} /></span>
                        )}
                    </button>
                    {!hasApplied ? (
                        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground font-medium">
                            <CheckCircle2 size={12} className="text-green-500" /> Apply in 1-click
                        </div>
                    ) : (
                        <div className="mt-3 text-center space-y-1">
                            <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                                <CheckCircle2 size={12} className="text-success" />
                                You successfully submitted to this job.
                            </p>
                            <button
                                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                className="text-xs text-accent font-bold hover:underline"
                            >
                                Meanwhile, try other jobs below ⬇️
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="font-display font-bold text-lg mb-4 text-foreground border-b border-border/50 pb-2">About the Role</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground">
                            {job.description}
                        </div>
                    </div>

                    {(requiredSkills.length > 0 || preferredSkills.length > 0 || toolsTech.length > 0) && (
                        <div className="glass-card p-6 rounded-2xl space-y-6">
                            <h3 className="font-display font-bold text-lg text-foreground border-b border-border/50 pb-2">Skills & Technology</h3>

                            {requiredSkills.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm mb-3">Required Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {requiredSkills.map((s: string) => <span key={s} className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-md">{s}</span>)}
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
                                    <h4 className="font-bold text-sm mb-3">Tools & Technologies</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {toolsTech.map((s: string) => <span key={s} className="px-3 py-1.5 bg-secondary/50 text-secondary-foreground text-xs font-bold rounded-md">{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-base mb-4 text-foreground">Requirements & Context</h3>

                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Experience Minimum</span>
                                <span className="text-sm font-semibold text-foreground">{job.experience || 'Not specified'}</span>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Education Needed</span>
                                <span className="text-sm font-semibold text-foreground">{job.education_requirements || 'Relevant degree or equivalent experience'}</span>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Department</span>
                                <span className="text-sm font-semibold text-foreground">{job.department || 'General'}</span>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Open Vacancies</span>
                                <span className="text-sm font-semibold text-foreground">{job.vacancies || 1} available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Jobs Section */}
            {similarJobs && similarJobs.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                    <h2 className="text-xl font-display font-bold text-foreground mb-6">Similar Roles You Might Like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {similarJobs.map(sj => (
                            <div
                                key={sj.id}
                                onClick={() => navigate(`/candidate/jobs/${sj.id}`)}
                                className="bg-card border border-border/50 p-4 rounded-xl cursor-pointer hover:border-accent hover:shadow-md transition-all group"
                            >
                                <h4 className="font-display font-bold text-base group-hover:text-primary transition-colors">{sj.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1 mb-3">{sj.organizations?.name}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold">
                                    <span className="px-2 py-1 bg-muted rounded">{sj.location}</span>
                                    <span className="px-2 py-1 bg-accent/10 text-accent rounded">{sj.salary_currency === 'INR' ? '₹' : sj.salary_currency}{sj.salary_min && sj.salary_max ? `${sj.salary_min}–${sj.salary_max}L` : sj.salaryRange || 'Competitive'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Apply Flow Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-background/50">
                            <h2 className="text-xl font-bold font-display text-foreground">
                                {applicationStep === 1 ? 'Select Profile' : 'Review Application'}
                            </h2>
                            <button onClick={() => setShowApplyModal(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 bg-muted/20 hover:bg-muted/50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {applicationStep === 1 ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground mb-4">Choose the profile you want to apply with for this role.</p>

                                    <div
                                        onClick={() => setSelectedVariantId('main')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVariantId === 'main' ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50 hover:border-primary/50 bg-muted/5 hover:bg-muted/10'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">General Profile</h3>
                                                <p className="text-xs text-muted-foreground mt-1 font-medium">Your default basic profile</p>
                                            </div>
                                            {selectedVariantId === 'main' && <CheckCircle2 size={20} className="text-primary drop-shadow-sm" />}
                                        </div>
                                    </div>

                                    {applyVariants.map(v => (
                                        <div
                                            key={v.id}
                                            onClick={() => setSelectedVariantId(v.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVariantId === v.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50 hover:border-primary/50 bg-muted/5 hover:bg-muted/10'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">{v.profile_name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1 font-medium">Specialized Resume & Details</p>
                                                </div>
                                                {selectedVariantId === v.id && <CheckCircle2 size={20} className="text-primary drop-shadow-sm" />}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => { setShowApplyModal(false); navigate('/candidate/profile'); }}
                                            className="text-xs font-bold text-accent hover:underline flex items-center justify-center gap-1.5 mx-auto"
                                        >
                                            <ExternalLink size={12} /> Manage or Create Profiles
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-muted/10 p-5 rounded-2xl border border-border/50 shadow-inner">
                                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Applying for</h3>
                                        <p className="font-bold text-foreground text-lg leading-tight">{job.title}</p>
                                        <p className="text-sm font-medium text-muted-foreground mt-1">at {job.organizations?.name}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold font-display border-b border-border/50 pb-2 flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-success" /> Selected Profile Settings
                                        </h3>

                                        <div className="flex items-center gap-4 bg-background border border-border/50 p-4 rounded-xl shadow-sm">
                                            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-foreground uppercase tracking-wide">
                                                    {selectedVariantId === 'main' ? 'General Profile' : applyVariants.find(v => v.id === selectedVariantId)?.profile_name}
                                                </p>
                                                <p className="text-xs font-medium text-muted-foreground mt-0.5">Resume & Details will be attached</p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-secondary/20 border border-secondary/20 p-4 flex items-start gap-3 mt-4">
                                            <Sparkles size={16} className="text-secondary-foreground mt-0.5 shrink-0" />
                                            <p className="text-xs font-medium text-secondary-foreground">
                                                Ensure this is the correct profile before submitting. You cannot change it later, and the recruiter will review these details exclusively.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-border/50 p-6 flex justify-between bg-background">
                            {applicationStep === 2 ? (
                                <>
                                    <button
                                        onClick={() => setApplicationStep(1)}
                                        className="px-6 py-2.5 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-all font-display"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleConfirmApply}
                                        disabled={isApplying}
                                        className="bg-accent text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20 flex items-center gap-2 btn-scale"
                                    >
                                        {isApplying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Submit'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setApplicationStep(2)}
                                    className="w-full bg-foreground text-background px-6 py-3 rounded-lg text-sm font-bold hover:bg-primary hover:shadow-lg transition-all flex justify-center items-center shadow-md btn-scale"
                                >
                                    Continue to Review
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateJobDetail;
