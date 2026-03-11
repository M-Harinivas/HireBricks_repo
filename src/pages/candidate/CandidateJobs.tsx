import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { useAuth } from '@/hooks/useAuth';
import { Search, Filter, Sparkles, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { JobCard } from '@/components/JobCard';

const CandidateJobs = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('ALL');
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Reset page when search or filters change
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
  }, [profile]);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const filters: any = { status: 'LIVE' };
        if (search) filters.search = search;
        if (workMode !== 'ALL') filters.work_mode = workMode;

        const { data, count } = await apiService.getPaginatedJobs(filters, page, pageSize);
        if (data) setJobs(data);
        if (count !== null) setTotalJobs(count);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(timer);
  }, [page, search, workMode]);

  const filtered = jobs;

  const handleApply = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) {
      toast.error('Please log in to apply.');
      return;
    }

    setIsApplying(id);
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
      setAppliedJobIds(prev => new Set(prev).add(id));
    } catch (err: any) {
      if (err.message && (err.message.includes('23505') || err.message.includes('11000') || err.message.includes('duplicate key'))) {
        toast.error('You have already applied for this job. Please check other jobs.');
        setAppliedJobIds(prev => new Set(prev).add(id));
      } else {
        toast.error(err.message || 'Failed to submit application.');
      }
    } finally {
      setIsApplying(null);
    }
  };

  return (
    <div className="page-container space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-page-title">Discover Jobs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find roles that match your unique skills and experience.</p>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-1 shadow-sm"><Sparkles size={12} /> AI Matches: 3</span>
      </div>

      <div className="flex flex-wrap lg:flex-nowrap gap-2 bg-card border border-border/50 p-1.5 rounded-lg shadow-sm">
        <div className="relative flex-1 min-w-[200px] flex items-center">
          {isLoading ? (
            <Loader2 size={14} className="absolute left-3 text-accent animate-spin" />
          ) : (
            <Search size={14} className="absolute left-3 text-muted-foreground" />
          )}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search roles, companies, or skills..."
            className="w-full pl-8 pr-8 py-2 rounded-md border-none bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="w-px bg-border my-1.5 hidden lg:block" />
        <div className="flex gap-2 items-center flex-1 lg:flex-none relative">
          <Filter size={14} className="text-muted-foreground ml-3 hidden sm:block pointer-events-none" />
          <select
            value={workMode}
            onChange={e => setWorkMode(e.target.value)}
            className="w-full lg:w-40 px-3 py-2 rounded-md border-none bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none transition-all"
          >
            <option value="ALL">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 glass-card text-center">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-3"><Search size={20} className="text-muted-foreground" /></div>
          <h3 className="font-display text-lg font-bold">No jobs found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">We couldn't find any roles matching "{search}". Try adjusting your filters.</p>
          <button onClick={() => { setSearch(''); setWorkMode('ALL'); }} className="mt-4 px-3 py-1.5 text-sm font-medium border border-border bg-background rounded-md hover:bg-muted transition-colors btn-scale">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((j, i) => (
            <JobCard
              key={j.id}
              job={j}
              index={i}
              isApplying={isApplying === j.id}
              hasApplied={appliedJobIds.has(j.id)}
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalJobs > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-6 mt-4 border-t border-border/50 gap-4">
          <span className="text-sm text-muted-foreground font-medium">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalJobs)} of {totalJobs} jobs
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-border bg-card rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors btn-scale"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(totalJobs / pageSize), p + 1))}
              disabled={page >= Math.ceil(totalJobs / pageSize)}
              className="px-4 py-2 text-sm font-medium border border-border bg-card rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors btn-scale"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobs;
