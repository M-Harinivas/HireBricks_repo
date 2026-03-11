import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Calendar, ArrowRight, TrendingUp, Sparkles, FileText, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { motion } from 'framer-motion';

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Review', 'Offer', 'Hired'];
const statusToStage: Record<string, number> = { APPLIED: 0, SHORTLISTED: 1, INTERVIEW_INVITED: 2, INTERVIEW_SCHEDULED: 2, INTERVIEW_COMPLETED: 3, UNDER_REVIEW: 3, OFFER_SENT: 4, HIRED: 5, REJECTED: -1 };

const stagger = (i: number) => ({ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] });

const CandidateDashboard = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState({ applications: 0, interviews: 0, offers: 0 });
  const [activeApp, setActiveApp] = useState<any>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile) return;
      setIsLoading(true);
      try {
        const [applications, jobs] = await Promise.all([
          apiService.getApplications({ candidate_id: profile.id }),
          apiService.getJobs({ status: 'LIVE' })
        ]);

        const appDetails = applications || [];
        const interviews = await apiService.getInterviews() as any;
        const userAppIds = new Set(appDetails.map((a: any) => a.id));
        const userInterviews = (interviews || []).filter((i: any) => userAppIds.has(i.application_id));

        setMetrics({
          applications: appDetails.length,
          interviews: userInterviews.length,
          offers: 0,
        });

        if (appDetails.length > 0) {
          setActiveApp(appDetails[0]);
        }

        setRecommendedJobs((jobs || []).slice(0, 3));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const stageIdx = activeApp ? (statusToStage[activeApp.status] ?? 0) : -1;
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-5">
      {/* Compact Welcome + Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-page-title">Welcome back, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {metrics.interviews > 0
              ? `You have ${metrics.interviews} upcoming interview${metrics.interviews > 1 ? 's' : ''} — let's prepare!`
              : "Here's your job search overview."}
          </p>
        </div>
        <Link
          to="/candidate/jobs"
          className="gradient-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 btn-scale shadow-sm shrink-0"
        >
          <Briefcase size={14} /> Find Jobs
        </Link>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Applications', value: metrics.applications, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Interviews', value: metrics.interviews, icon: Calendar, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Offers', value: metrics.offers, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(i)}
            className="glass-card p-3.5 flex items-center gap-3"
          >
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
              <s.icon size={16} />
            </div>
            <div>
              <div className="text-2xl font-display font-bold tracking-tight">{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid — Application Status + Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Application Status — Takes 3/5 */}
        <div className="lg:col-span-3">
          {activeApp ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="glass-card overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-section-title flex items-center gap-2">
                  <TrendingUp size={16} className="text-accent" /> Current Application
                </h2>
                <Link to="/candidate/applications" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
                  View all <ArrowUpRight size={11} />
                </Link>
              </div>

              <div className="p-4">
                {/* Job Info Row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg shrink-0">
                    {activeApp.jobs?.organizations?.name?.charAt(0) || activeApp.jobs?.title?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-base leading-tight truncate">{activeApp.jobs?.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{activeApp.jobs?.organizations?.name} · {activeApp.jobs?.location}</p>
                  </div>
                  <StatusBadge status={activeApp.status} />
                </div>

                {/* Horizontal Progress Bar */}
                <div className="relative">
                  {/* Track */}
                  <div className="flex items-center gap-0">
                    {STAGES.map((s, i) => {
                      const isActive = i <= stageIdx;
                      const isCurrent = i === stageIdx;
                      return (
                        <div key={s} className="flex-1 flex flex-col items-center relative">
                          {/* Connector line */}
                          {i > 0 && (
                            <div className={`absolute top-3 right-1/2 w-full h-0.5 -z-0 ${i <= stageIdx ? 'bg-accent' : 'bg-border'}`} />
                          )}
                          {/* Dot */}
                          <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                            ${isActive ? 'bg-accent border-accent' : 'bg-background border-border'}
                            ${isCurrent ? 'ring-4 ring-accent/20 scale-110' : ''}
                          `}>
                            {isActive && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          {/* Label */}
                          <span className={`text-[10px] mt-1.5 font-medium text-center leading-tight ${isCurrent ? 'text-accent font-bold' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {s}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] text-accent font-medium mt-0.5">Current</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick action */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>Applied {activeApp.created_at ? new Date(activeApp.created_at).toLocaleDateString() : 'recently'}</span>
                  </div>
                  <Link to="/candidate/applications" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                    Full Details <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="font-display text-base mb-1 font-bold text-foreground">No applications yet</p>
              <p className="text-xs text-muted-foreground mb-4">Explore open roles and start your journey.</p>
              <Link to="/candidate/jobs" className="px-4 py-2 rounded-lg gradient-accent text-white font-semibold text-sm hover:opacity-90 transition-all inline-block">
                Browse Jobs
              </Link>
            </motion.div>
          )}
        </div>

        {/* Recommended Jobs — Takes 2/5 */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="glass-card overflow-hidden h-full"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-section-title flex items-center gap-2">
                <Sparkles size={14} className="text-accent" /> Recommended
              </h2>
              <Link to="/candidate/jobs" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
                All jobs <ArrowUpRight size={11} />
              </Link>
            </div>

            <div className="divide-y divide-border/50">
              {recommendedJobs.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No recommendations yet</div>
              ) : recommendedJobs.map((j, i) => (
                <motion.div
                  key={j.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.3 }}
                >
                  <Link to="/candidate/jobs" className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                      {j.organizations?.name?.charAt(0) || j.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{j.title}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">{j.organizations?.name || 'Company'} · {j.location}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-accent/10 text-accent rounded uppercase tracking-wider flex items-center gap-0.5">
                        <Sparkles size={8} /> Match
                      </span>
                      <span className="text-[10px] text-muted-foreground">{j.work_mode}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
