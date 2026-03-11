import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, Building2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Review', 'Offer', 'Hired'];

const statusToStage: Record<string, number> = { APPLIED: 0, SHORTLISTED: 1, INTERVIEW_INVITED: 2, INTERVIEW_SCHEDULED: 2, INTERVIEW_COMPLETED: 3, UNDER_REVIEW: 3, OFFER_SENT: 4, HIRED: 5, REJECTED: -1 };

const CandidateApplications = () => {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (!profile) return;
      setIsLoading(true);
      try {
        const data = await apiService.getApplications({ candidate_id: profile.id });
        if (data) setApplications(data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  }, [profile]);

  return (
    <div className="page-container space-y-4">
      <div>
        <h1 className="text-page-title">My Applications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your progress and respond to next steps.</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-3"><Clock size={20} className="text-muted-foreground" /></div>
            <h3 className="font-display font-bold text-lg">No active applications</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">You haven't applied to any roles lately. Let's change that!</p>
            <Link to="/candidate/jobs" className="btn-scale px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Explore Jobs</Link>
          </div>
        ) : (
          applications.map((app, i) => {
            const stageIdx = statusToStage[app.status] ?? 0;
            let cta = null;
            if (app.status === 'INTERVIEW_INVITED' || app.status === 'INTERVIEW_SCHEDULED') {
              cta = { label: 'Manage Interview', link: `/candidate/interview/${app.id}` };
            } else if (app.status === 'OFFER_SENT') {
              cta = { label: 'View Offer', link: `/candidate/offers/${app.id}` };
            }

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className={`glass-card overflow-hidden group ${app.status === 'REJECTED' ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                {/* Info */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 group-hover:bg-muted/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg shrink-0">
                      {app.jobs?.organizations?.name?.charAt(0) || app.jobs?.title?.charAt(0) || 'J'}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">{app.jobs?.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium mt-1">
                        <span className="flex items-center gap-1"><Building2 size={11} />{app.jobs?.organizations?.name}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} />{app.jobs?.location}</span>
                        <span className="px-1.5 py-0.5 bg-background border border-border/50 text-foreground rounded text-[9px] font-bold uppercase tracking-wider">{app.jobs?.work_mode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 w-full md:w-auto">
                    <StatusBadge status={app.status} />
                    <span className="text-[10px] text-muted-foreground font-medium">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="px-4 pb-4 pt-1">
                  <div className="bg-muted/10 border border-border/50 rounded-lg p-4 relative">
                    <div className="absolute top-[22px] left-8 right-8 h-0.5 bg-muted/80 rounded-full" />
                    <div className="relative flex justify-between">
                      {STAGES.map((s, idx) => {
                        const isActive = idx <= stageIdx;
                        const isCurrent = idx === stageIdx;
                        return (
                          <div key={s} className="flex flex-col items-center gap-1.5 relative z-10 w-16">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 z-10 
                                ${isActive ? 'bg-accent' : 'bg-background border-2 border-muted shadow-sm'}
                                ${isCurrent ? 'ring-3 ring-accent/20 scale-110' : ''}
                              `}
                            >
                              {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className={`text-[9px] font-bold text-center uppercase tracking-wider transition-colors
                              ${isActive ? 'text-foreground' : 'text-muted-foreground/60'}
                              ${isCurrent ? 'text-accent' : ''}
                            `}>
                              {s}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      className="absolute top-[22px] left-8 h-0.5 bg-accent rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `calc(${Math.max(0, (stageIdx / (STAGES.length - 1)) * 100)}% - 4rem)` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                {cta && (
                  <div className="px-4 py-3 bg-muted/5 border-t border-border/50 flex justify-end">
                    <Link to={cta.link} className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-md text-sm font-bold btn-scale shadow-sm shadow-accent/20 hover:brightness-110">
                      {cta.label}
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CandidateApplications;
