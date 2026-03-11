import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/apiService';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Plus, Edit, Eye, Trash2, StopCircle, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const RecruiterJobs = () => {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchJobsData = async () => {
      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetchedJobs = await apiService.getJobs({ organization_id: profile.organization_id });
        const fetchedApps = await apiService.getApplications({ organization_id: profile.organization_id });
        if (fetchedJobs) setJobs(fetchedJobs);
        if (fetchedApps) setApplications(fetchedApps);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobsData();
  }, [profile]);

  const filtered = jobs.filter((j: any) =>
    (statusFilter === 'ALL' || j.status === statusFilter) &&
    j.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    try {
      await apiService.deleteJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete job: ' + err.message);
    }
  };

  const handleClose = async (jobId: string) => {
    if (!confirm('Are you sure you want to close this job? Pending applicants will be rejected.')) return;
    try {
      await apiService.closeJob(jobId);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'CLOSED' } : j));
      toast.success('Job closed successfully');
    } catch (err: any) {
      toast.error('Failed to close job: ' + err.message);
    }
  };

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{jobs.length} total job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/recruiter/jobs/new" className="gradient-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center gap-1.5 btn-scale shadow-sm"><Plus size={15} /> Create Job</Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="ALL">All Status</option>
          <option value="LIVE">Live</option>
          <option value="DRAFT">Draft</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-accent w-7 h-7" />
          </div>
        ) : (
          <table className="dense-table">
            <thead><tr>
              <th>Title</th><th>Department</th><th>Location</th><th>Work Mode</th><th>Applicants</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">No jobs found.</td>
                </tr>
              ) : filtered.map((job: any) => {
                const applicantCount = applications.filter(a => a.job_id === job.id).length;
                return (
                  <tr key={job.id}>
                    <td><Link to={`/recruiter/jobs/${job.id}`} className="font-medium text-accent hover:underline">{job.title}</Link></td>
                    <td className="text-muted-foreground">{job.department}</td>
                    <td className="text-muted-foreground"><span className="inline-flex items-center gap-1"><MapPin size={11} />{job.location}</span></td>
                    <td className="text-muted-foreground">{job.work_mode}</td>
                    <td className="font-medium">{applicantCount}</td>
                    <td><StatusBadge status={job.status} /></td>
                    <td>
                      <div className="flex items-center gap-0.5">
                        <Link to={`/recruiter/jobs/${job.id}`} className="p-1 rounded hover:bg-muted text-muted-foreground" title="View"><Eye size={13} /></Link>
                        {job.status === 'LIVE' && (
                          <button onClick={() => handleClose(job.id)} className="p-1 rounded hover:bg-muted text-warning" title="Close Job"><StopCircle size={13} /></button>
                        )}
                        <button onClick={() => handleDelete(job.id)} className="p-1 rounded hover:bg-muted text-destructive" title="Delete Job"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
};

export default RecruiterJobs;
