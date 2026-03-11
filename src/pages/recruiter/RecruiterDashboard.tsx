import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/apiService';
import { StatusBadge, ScoreBar } from '@/components/StatusBadge';
import { Briefcase, Users, Video, UserCheck, Plus, ArrowUpRight, Loader2, Clock, AlertCircle, CheckCircle2, CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const pipelineColors = [
  'hsl(220, 14%, 80%)',   // Applied – neutral
  'hsl(24, 95%, 53%)',    // Shortlisted – accent orange
  'hsl(217, 60%, 27%)',   // Interview – navy
  'hsl(217, 60%, 40%)',   // Review – lighter navy
  'hsl(38, 92%, 50%)',    // Offer – warm yellow
  'hsl(160, 84%, 39%)',   // Hired – green
];

// Removed mock pipelineData array

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-foreground text-background rounded-md px-3 py-1.5 shadow-xl text-xs font-medium">
        {label}: <span className="font-bold">{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

const staggerDelay = (i: number) => ({ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] });

const RecruiterDashboard = () => {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetchedJobs = await apiService.getJobs({ organization_id: profile.organization_id });
        const fetchedApps = await apiService.getApplications({ organization_id: profile.organization_id });
        const fetchedInterviews = await apiService.getInterviews();

        if (fetchedJobs) setJobs(fetchedJobs);
        if (fetchedApps) setApplications(fetchedApps);
        if (fetchedInterviews) {
          const orgInterviews = fetchedInterviews.filter((i: any) =>
            i.applications?.jobs?.organization_id === profile.organization_id
          );
          setInterviews(orgInterviews);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [profile]);

  const activeJobs = jobs.filter(j => j.status === 'LIVE').length;
  const totalApplicants = applications.length;
  const todayInterviews = interviews.filter(i => new Date(i.scheduled_at).toDateString() === new Date().toDateString()).length;
  const hiredThisMonth = applications.filter(a => a.status === 'HIRED').length;
  const pendingReview = applications.filter(a => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW').length;

  const dynamicPipelineData = [
    { stage: 'Applied', count: applications.filter(a => a.status === 'APPLIED').length },
    { stage: 'Shortlisted', count: applications.filter(a => a.status === 'SHORTLISTED').length },
    { stage: 'Interview', count: applications.filter(a => typeof a.status === 'string' && a.status.startsWith('INTERVIEW_')).length },
    { stage: 'Review', count: applications.filter(a => a.status === 'UNDER_REVIEW').length },
    { stage: 'Offer', count: applications.filter(a => typeof a.status === 'string' && a.status.startsWith('OFFER_')).length },
    { stage: 'Hired', count: applications.filter(a => a.status === 'HIRED').length },
  ];

  const stats = [
    { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Interviews Today', value: todayInterviews, icon: Video, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Hires This Month', value: hiredThisMonth, icon: UserCheck, color: 'text-success', bg: 'bg-success/10' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <Loader2 className="animate-spin text-accent w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="page-container space-y-5">
      {/* Header — Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, here's what's happening today.</p>
        </div>
        <Link
          to="/recruiter/jobs/new"
          className="gradient-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 btn-scale shadow-sm"
        >
          <Plus size={15} /> Post New Job
        </Link>
      </div>

      {/* Stat Cards — Compact Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={staggerDelay(i)}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <div className="text-metric text-2xl">{s.value}</div>
              <div className="text-[11px] text-muted-foreground font-medium tracking-wide">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid — 3 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column — Pipeline + Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pipeline Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-section-title">Hiring Pipeline</h3>
              <Link to="/recruiter/candidates" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={11} />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dynamicPipelineData} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 93%)" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(220, 14%, 96%)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {dynamicPipelineData.map((_, index) => (
                    <Cell key={index} fill={pipelineColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Applications — Dense Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="glass-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-section-title">Recent Applications</h3>
              <Link to="/recruiter/candidates" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={11} />
              </Link>
            </div>
            {applications.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">No recent applications</div>
            ) : (
              <table className="dense-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Role</th>
                    <th>AI Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 6).map(c => (
                    <tr key={c.id} className="cursor-pointer" onClick={() => { }}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {c.profiles?.full_name?.charAt(0) || c.profiles?.email?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-foreground">{c.profiles?.full_name || 'Candidate'}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{c.jobs?.title}</td>
                      <td><ScoreBar score={c.ai_score || 0} /></td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>

        {/* Right Column — Interviews + Tasks */}
        <div className="space-y-4">
          {/* Quick Tasks Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="glass-card p-4"
          >
            <h3 className="text-section-title mb-3">Action Items</h3>
            <div className="space-y-2">
              {pendingReview > 0 && (
                <Link to="/recruiter/candidates" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-accent/5 border border-accent/15 hover:bg-accent/10 transition-colors group">
                  <div className="w-7 h-7 rounded-md bg-accent/15 flex items-center justify-center">
                    <AlertCircle size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{pendingReview} candidates awaiting review</p>
                    <p className="text-[10px] text-muted-foreground">Review and shortlist new applicants</p>
                  </div>
                  <ArrowUpRight size={12} className="text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                </Link>
              )}
              {todayInterviews > 0 && (
                <Link to="/recruiter/interviews" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-warning/5 border border-warning/15 hover:bg-warning/10 transition-colors group">
                  <div className="w-7 h-7 rounded-md bg-warning/15 flex items-center justify-center">
                    <Clock size={14} className="text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{todayInterviews} interview{todayInterviews > 1 ? 's' : ''} today</p>
                    <p className="text-[10px] text-muted-foreground">Prepare questions and review profiles</p>
                  </div>
                  <ArrowUpRight size={12} className="text-muted-foreground group-hover:text-warning transition-colors shrink-0" />
                </Link>
              )}
              {activeJobs > 0 && (
                <Link to="/recruiter/jobs" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{activeJobs} active job{activeJobs > 1 ? 's' : ''} live</p>
                    <p className="text-[10px] text-muted-foreground">Monitor applications and pipeline</p>
                  </div>
                  <ArrowUpRight size={12} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              )}
              {pendingReview === 0 && todayInterviews === 0 && activeJobs === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-success" />
                  All caught up! No pending actions.
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-section-title">Upcoming Interviews</h3>
              <Link to="/recruiter/interviews" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
                All <ArrowUpRight size={11} />
              </Link>
            </div>
            <div className="space-y-1.5">
              {interviews.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No upcoming interviews</div>
              ) : interviews.slice(0, 4).map((i, idx) => (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.08, duration: 0.3 }}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-warning/10 flex items-center justify-center shrink-0">
                    <CalendarDays size={13} className="text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{i.applications?.profiles?.full_name || 'Candidate'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{i.applications?.jobs?.title}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                    {new Date(i.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
