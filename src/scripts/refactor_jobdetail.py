import re
import sys

with open(r'c:\Users\aadvi\Downloads\HBV2\HBV2\src\pages\candidate\CandidateJobDetail.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { BriefcaseIcon, MapPin, Sparkles, Building2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';",
    "import { BriefcaseIcon, MapPin, Sparkles, Building2, ArrowLeft, ArrowRight, CheckCircle2, X, ExternalLink, FileText } from 'lucide-react';"
)

# Update state variables
state_vars_orig = """    const [isApplying, setIsApplying] = useState(false);"""
state_vars_new = """    const [isApplying, setIsApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyVariants, setApplyVariants] = useState<any[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState<string>('main');
    const [applicationStep, setApplicationStep] = useState<number>(1);
    const [mainProfileData, setMainProfileData] = useState<any>(null);"""
content = content.replace(state_vars_orig, state_vars_new)

# handleApply logic replacement
handle_apply_orig = """    const handleApply = async () => {
        if (!profile) {
            toast.error('Please log in to apply.');
            return;
        }

        setIsApplying(true);
        try {
            // Check for profile completeness before applying
            if (!profile.full_name || !profile.email || !profile.phone || !profile.location) {
                toast.error('Please complete your profile (Name, Email, Phone, Location) before applying.', { duration: 4000 });
                navigate('/candidate/profile');
                return;
            }

            await apiService.createApplication({
                job_id: id,
                candidate_id: profile.id,
                status: 'APPLIED',
                ai_score: null
            });

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
            toast.error(err.message || 'Failed to submit application.');
        } finally {
            setIsApplying(false);
        }
    };"""

handle_apply_new = """    const handleApplyClick = async () => {
        if (!profile) {
            toast.error('Please log in to apply.');
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
            toast.error(err.message || 'Failed to submit application.');
        } finally {
            setIsApplying(false);
        }
    };"""
content = content.replace(handle_apply_orig, handle_apply_new)

# Update onClick={handleApply}
content = content.replace("onClick={handleApply}", "onClick={handleApplyClick}")

# Add modal JSX at the bottom before </div>
modal_jsx = """            {/* Apply Flow Modal */}
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
};"""
content = content.replace("        </div>\n    );\n};", modal_jsx)

with open(r'c:\Users\aadvi\Downloads\HBV2\HBV2\src\pages\candidate\CandidateJobDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS")
