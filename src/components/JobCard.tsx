import { motion } from 'framer-motion';
import { MapPin, BriefcaseIcon, Building2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
    job: any;
    onApply?: (id: string, e: React.MouseEvent) => void;
    isApplying?: boolean;
    hasApplied?: boolean;
    isPublic?: boolean;
    index?: number;
}

export const JobCard = ({ job, onApply, isApplying, hasApplied, isPublic, index = 0 }: JobCardProps) => {
    const navigate = useNavigate();

    const handleDetailsClick = () => {
        if (isPublic) {
            navigate(`/jobs/${job.id}`); // Or wherever public details are
        } else {
            navigate(`/candidate/jobs/${job.id}`);
        }
    };

    const skills = job.required_skills || job.skills || [];
    const displaySkills = skills.slice(0, 4);
    const remainingSkills = skills.length > 4 ? skills.length - 4 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="h-full w-full"
        >
            <div className="glass-card h-[320px] flex flex-col transition-all duration-300 hover:shadow-md hover:border-border group">
                <div className="p-4 flex flex-col h-full gap-4 group-hover:bg-muted/10 transition-colors">
                    {/* Header Section */}
                    <div className="flex items-start gap-3 h-[60px] shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg shrink-0 overflow-hidden">
                            {job.organizations?.logo_url ? (
                                <img src={job.organizations.logo_url} alt={job.organizations.name || 'Company Logo'} className="w-full h-full object-cover" />
                            ) : (
                                job.organizations?.name?.charAt(0) || job.title.charAt(0)
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2" title={job.title}>
                                {job.title}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1 truncate">
                                <Building2 size={11} className="shrink-0" /> {job.organizations?.name || 'Company'}
                            </p>
                        </div>
                    </div>

                    {/* Meta Info Section */}
                    <div className="flex flex-wrap items-center content-start gap-1.5 min-h-[50px] shrink-0">
                        <Badge variant="outline" className="bg-background text-[10px] font-bold py-0.5 px-2 h-6 flex items-center gap-1 border-border/60">
                            <MapPin size={10} className="text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[80px]">{job.location}</span>
                        </Badge>
                        <Badge variant="outline" className="bg-background text-[10px] font-bold py-0.5 px-2 h-6 flex items-center gap-1 border-border/60">
                            <BriefcaseIcon size={10} className="text-muted-foreground shrink-0" />
                            <span>{job.experience}</span>
                        </Badge>
                        <Badge variant="secondary" className="bg-accent/10 border-none text-accent text-[10px] font-bold py-0.5 px-2 h-6 flex items-center gap-1">
                            {job.salary_currency === 'INR' ? '₹' : job.salary_currency}{job.salaryRange || 'Comp.'}
                        </Badge>
                    </div>

                    {/* Skills Section */}
                    <div className="pt-3 border-t border-border/50 flex-1 overflow-hidden">
                        <div className="flex flex-wrap content-start gap-1 w-full h-full">
                            {displaySkills.map((s: string) => (
                                <span
                                    key={s}
                                    className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground text-[9px] uppercase font-bold tracking-wider rounded truncate max-w-[100px]"
                                >
                                    {s}
                                </span>
                            ))}
                            {remainingSkills > 0 && (
                                <span className="px-2 py-0.5 bg-transparent text-muted-foreground text-[9px] font-bold shrink-0">
                                    +{remainingSkills}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons Section - Always at bottom */}
                    <div className="flex items-center justify-between w-full mt-auto gap-2 pt-2 shrink-0">
                        {hasApplied ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="flex-1 font-bold text-xs h-9 bg-success/10 text-success border-success/20 shadow-none cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                <CheckCircle2 size={14} /> Applied
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => onApply?.(job.id, e)}
                                disabled={isApplying}
                                className="flex-1 font-bold text-xs h-9 bg-muted/40 hover:bg-accent hover:text-white transition-all shadow-none border-border/50 flex items-center justify-center gap-1.5"
                            >
                                {isApplying ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Fast Apply'}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={handleDetailsClick}
                            className="flex-1 font-bold text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90 btn-scale shadow-sm flex items-center justify-center gap-1.5"
                        >
                            Details <ArrowRight size={14} />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
