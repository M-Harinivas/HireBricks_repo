import { useParams, Link } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { Search, MapPin, Clock, Users, DollarSign, Loader2, ArrowLeft, FileText } from 'lucide-react';
import { downloadResume } from '@/services/resumeService';
import toast from 'react-hot-toast';
const statusToColumn: Record<string, string> = {
  APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', INTERVIEW_INVITED: 'Interview Invited',
  INTERVIEW_SCHEDULED: 'Scheduled', INTERVIEW_COMPLETED: 'Completed', UNDER_REVIEW: 'Review',
  OFFER_SENT: 'Offer', HIRED: 'Hired', REJECTED: 'Rejected',
};

const PIPELINE_COLUMNS = ['Applied', 'Shortlisted', 'Interview Invited', 'Scheduled', 'Completed', 'Review', 'Offer', 'Hired', 'Rejected'];

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [jobCandidates, setJobCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const fetchedJob = await apiService.getJobById(id);
        const fetchedApps = await apiService.getApplications({ job_id: id });
        if (fetchedJob) setJob(fetchedJob);
        if (fetchedApps) setJobCandidates(fetchedApps);
      } catch (err) {
        console.error("Error fetching job details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);
  const [tab, setTab] = useState<'applications' | 'pipeline' | 'details'>('applications');
  const [search, setSearch] = useState(''); const handleDownload = async (path: string) => {
    try {
      const url = await downloadResume(path);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Failed to download resume');
    }
  };

  const filteredCandidates = jobCandidates.filter(c => (c.profiles?.full_name?.toLowerCase() || '').includes(search.toLowerCase()));

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-full py-20 min-h-[50vh] gap-4">
        <Loader2 className="animate-spin text-accent w-10 h-10" />
        <p className="text-muted-foreground animate-pulse">Loading job workspace...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center flex-col items-center h-full py-20 min-h-[50vh] gap-4">
        <h2 className="text-xl font-bold">Job Not Found</h2>
        <Link to="/recruiter/jobs" className="text-accent hover:underline flex items-center gap-1"><ArrowLeft size={16} /> Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {/* Job Header */}
      <div className="card-elevated p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link to="/recruiter/jobs" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /></Link>
              <h1 className="text-2xl font-bold">{job.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
              <span>{job.work_mode}</span>
              <span className="flex items-center gap-1"><Clock size={14} />{job.experience || 'Open'} Experience</span>
              <span className="flex items-center gap-1"><DollarSign size={14} />{job.salary_currency === 'INR' ? '₹' : job.salary_currency}{job.salary_min && job.salary_max ? `${job.salary_min}–${job.salary_max}L` : 'Competitive'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 hidden sm:flex">
            <StatusBadge status={job.status} />
            <div className="text-center px-4">
              <div className="text-2xl font-bold">{jobCandidates.length}</div>
              <div className="text-xs text-muted-foreground">Applicants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['applications', 'pipeline', 'details'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>
        ))}
      </div>

      {tab === 'applications' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..." className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="card-elevated overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Name', 'Experience', 'Location', 'Status', 'Actions'].map(h => <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>)}
              </tr></thead>
              <tbody>
                {filteredCandidates.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">{c.profiles?.full_name?.[0] || 'U'}</div><div className="text-sm font-medium">{c.profiles?.full_name || 'Candidate'}</div></div></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.profiles?.experience || '-'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.profiles?.location || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={`/recruiter/candidates/${c.id}`} className="text-xs text-accent hover:underline font-medium">View</Link>
                        {c.profiles?.resume_url && (
                          <button
                            onClick={() => handleDownload(c.profiles.resume_url)}
                            className="p-1.5 text-muted-foreground hover:text-accent rounded-md hover:bg-muted transition-colors"
                            title="Download Resume"
                          >
                            <FileText size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No candidates found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pipeline' && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map(col => {
            const colCandidates = jobCandidates.filter(c => statusToColumn[c.status] === col);
            return (
              <div key={col} className="min-w-[200px] bg-muted/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">{col}</h4>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{colCandidates.length}</span>
                </div>
                <div className="space-y-2">
                  {colCandidates.map(c => (
                    <Link to={`/recruiter/candidates/${c.id}`} key={c.id} className="block bg-card rounded-lg p-3 border border-border hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="text-sm font-medium">{c.profiles?.full_name || 'Candidate'}</div>
                      <div className="text-xs text-muted-foreground mt-1">{c.profiles?.title || '-'}</div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'details' && (
        <div className="card-elevated p-6 space-y-4">
          <h3 className="font-semibold">Job Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
          <h3 className="font-semibold">Required Skills</h3>
          <div className="flex flex-wrap gap-2">{(job.required_skills || job.skills || []).map((s: string) => <span key={s} className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">{s}</span>)}</div>

          {job.preferred_skills && job.preferred_skills.length > 0 && (
            <>
              <h3 className="font-semibold mt-4">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">{job.preferred_skills.map((s: string) => <span key={s} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium border border-border">{s}</span>)}</div>
            </>
          )}

          {job.tools_tech && job.tools_tech.length > 0 && (
            <>
              <h3 className="font-semibold mt-4">Tools & Technology</h3>
              <div className="flex flex-wrap gap-2">{job.tools_tech.map((s: string) => <span key={s} className="px-3 py-1 bg-secondary/50 text-secondary-foreground text-xs rounded-full font-medium">{s}</span>)}</div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6 bg-muted/20 p-4 rounded-xl">
            <div><span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Experience</span><p className="text-sm font-semibold">{job.experience || 'Not specified'}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Education</span><p className="text-sm font-semibold">{job.education_requirements || 'Degree or equivalent'}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Department</span><p className="text-sm font-semibold">{job.department}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Domain</span><p className="text-sm font-semibold">{job.domain || 'General'}</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
