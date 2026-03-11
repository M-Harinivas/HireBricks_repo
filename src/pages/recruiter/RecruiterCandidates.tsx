import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/apiService';
import { StatusBadge, ScoreBar } from '@/components/StatusBadge';
import { Search, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const RecruiterCandidates = () => {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetchedApps = await apiService.getApplications({ organization_id: profile.organization_id });
        const fetchedJobs = await apiService.getJobs({ organization_id: profile.organization_id });
        if (fetchedApps) setApplications(fetchedApps);
        if (fetchedJobs) setJobs(fetchedJobs);
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, [profile]);

  const filtered = applications.filter(a =>
    (jobFilter === 'ALL' || a.job_id === jobFilter) &&
    (statusFilter === 'ALL' || a.status === statusFilter) &&
    (a.profiles?.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{applications.length} total applicants across all jobs</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={14} />
          <span>{filtered.length} showing</span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..." className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={jobFilter} onChange={e => setJobFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="ALL">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="ALL">All Status</option>
          {['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'UNDER_REVIEW', 'OFFER_SENT', 'HIRED', 'REJECTED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card overflow-hidden"
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-accent w-7 h-7" />
          </div>
        ) : (
          <table className="dense-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job Applied</th>
                <th>Experience</th>
                <th>Location</th>
                <th>AI Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">No candidates found.</td>
                </tr>
              ) : filtered.map(app => (
                <tr key={app.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center text-accent font-bold text-xs shrink-0">
                        {app.profiles?.full_name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-medium">{app.profiles?.full_name || 'Candidate'}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{app.jobs?.title || '-'}</td>
                  <td className="text-muted-foreground">{app.profiles?.experience || '-'}</td>
                  <td className="text-muted-foreground">{app.profiles?.location || '-'}</td>
                  <td><ScoreBar score={app.ai_score || 0} /></td>
                  <td><StatusBadge status={app.status} /></td>
                  <td><Link to={`/recruiter/candidates/${app.id}`} className="text-xs text-accent hover:underline font-medium">View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
};

export default RecruiterCandidates;
