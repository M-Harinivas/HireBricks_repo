import re

# 1. Update JobCard.tsx
with open(r'c:\Users\aadvi\Downloads\HBV2\HBV2\src\components\JobCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { MapPin, BriefcaseIcon, Building2, ArrowRight, Sparkles } from 'lucide-react';", 
                          "import { MapPin, BriefcaseIcon, Building2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';")

content = content.replace("isApplying?: boolean;", "isApplying?: boolean;\n    hasApplied?: boolean;")
content = content.replace("export const JobCard = ({ job, onApply, isApplying, isPublic, index = 0 }: JobCardProps) => {", 
                          "export const JobCard = ({ job, onApply, isApplying, hasApplied, isPublic, index = 0 }: JobCardProps) => {")

buttons_orig = """                    {/* Action Buttons Section - Always at bottom */}
                    <div className="flex items-center justify-between w-full mt-auto gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => onApply?.(job.id, e)}
                            disabled={isApplying}
                            className="flex-1 font-bold text-xs h-9 bg-muted/40 hover:bg-accent hover:text-white transition-all shadow-none border-border/50"
                        >
                            {isApplying ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Fast Apply'}
                        </Button>
                        <Button"""

buttons_new = """                    {/* Action Buttons Section - Always at bottom */}
                    <div className="flex items-center justify-between w-full mt-auto gap-2 pt-2">
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
                        <Button"""
content = content.replace(buttons_orig, buttons_new)

with open(r'c:\Users\aadvi\Downloads\HBV2\HBV2\src\components\JobCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Update CandidateJobs.tsx
with open(r'c:\Users\aadvi\Downloads\HBV2\HBV2\src\pages\candidate\CandidateJobs.tsx', 'r', encoding='utf-8') as f:
    content2 = f.read()

state_orig = "  const [isApplying, setIsApplying] = useState<string | null>(null);"
state_new = "  const [isApplying, setIsApplying] = useState<string | null>(null);\n  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());"
content2 = content2.replace(state_orig, state_new)

effects_orig = """  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, workMode]);"""

effects_new = """  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, workMode]);

  useEffect(() => {
      const fetchAppliedJobs = async () => {
          if (!profile) return;
          try {
              const applications = await apiService.getApplications({ candidate_id: profile.id });
              const ids = new Set<string>();
              (applications || []).forEach((app: any) => ids.add(app.job_id));
              setAppliedJobIds(ids);
          } catch (err) {
              console.error('Failed to fetch applied jobs', err);
          }
      };
      
      fetchAppliedJobs();
  }, [profile]);"""
content2 = content2.replace(effects_orig, effects_new)

handle_apply_err = """    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application.');
    } finally {
      setIsApplying(null);
    }"""
handle_apply_err_new = """      setAppliedJobIds(prev => new Set(prev).add(id));
    } catch (err: any) {
      if (err.message && (err.message.includes('23505') || err.message.includes('11000') || err.message.includes('duplicate key'))) {
          toast.error('You have already applied for this job. Please check other jobs.');
          setAppliedJobIds(prev => new Set(prev).add(id));
      } else {
          toast.error(err.message || 'Failed to submit application.');
      }
    } finally {
      setIsApplying(null);
    }"""
content2 = content2.replace(handle_apply_err, handle_apply_err_new)

job_render_orig = """              index={i}
              isApplying={isApplying === j.id}
              onApply={handleApply}
            />"""
job_render_new = """              index={i}
              isApplying={isApplying === j.id}
              hasApplied={appliedJobIds.has(j.id)}
              onApply={handleApply}
            />"""
content2 = content2.replace(job_render_orig, job_render_new)

with open(r'c:\Users\aadvi\Downloads\HBV2\HBV2\src\pages\candidate\CandidateJobs.tsx', 'w', encoding='utf-8') as f:
    f.write(content2)

# 3. Quick check of PublicJobs.tsx - it renders JobCard but since users aren't logged in, they don't apply.
# We don't necessarily need applied status there, but we can prevent TS errors if `hasApplied` is passed, but it's optional anyway.

print("SUCCESS")
