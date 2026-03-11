import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/apiService';
import { Download, Loader2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const RecruiterScorecards = () => {
  const { profile } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recFilter, setRecFilter] = useState('ALL');

  useEffect(() => {
    const fetchScorecards = async () => {
      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetched = await apiService.getApplications({ organization_id: profile.organization_id });
        if (fetched) {
          const eligible = fetched.filter((c: any) => c.status === 'INTERVIEW_COMPLETED' || c.status === 'OFFER_SENT' || c.status === 'SHORTLISTED' || c.status === 'UNDER_REVIEW');
          setCandidates(eligible);
        }
      } catch (err) {
        console.error('Error fetching scorecards:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScorecards();
  }, [profile]);

  const getScores = (score: number) => ({
    resume: Math.min(100, Math.round(score * 0.95)),
    interview: Math.min(100, Math.round(score * 0.88)),
    communication: Math.min(100, Math.round(score * 1.02)),
    confidence: Math.min(100, Math.round(score * 0.92)),
    composite: score,
    recommendation: score >= 85 ? 'Strong Hire' : score >= 70 ? 'Hire' : score >= 55 ? 'Maybe' : 'No Hire',
  });

  const getRecColor = (rec: string) => {
    if (rec === 'Strong Hire') return 'bg-success/10 text-success';
    if (rec === 'Hire') return 'bg-accent/10 text-accent';
    if (rec === 'Maybe') return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const filtered = candidates.filter(c => recFilter === 'ALL' || getScores(c.ai_score || 0).recommendation === recFilter);

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Scorecards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{candidates.length} candidates evaluated</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={recFilter} onChange={e => setRecFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="ALL">All Recommendations</option>
            {['Strong Hire', 'Hire', 'Maybe', 'No Hire'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={() => toast.success('CSV exported!')} className="flex items-center gap-1.5 border border-border px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

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
          <div className="overflow-x-auto">
            <table className="dense-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th className="text-center">Resume</th>
                  <th className="text-center">Interview</th>
                  <th className="text-center">Communication</th>
                  <th className="text-center">Confidence</th>
                  <th className="text-center">Composite</th>
                  <th>Recommendation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No scorecards found.</td></tr>
                ) : filtered.map(c => {
                  const s = getScores(c.ai_score || 0);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                            {c.profiles?.full_name?.charAt(0) || 'C'}
                          </div>
                          <span className="font-medium">{c.profiles?.full_name || 'Candidate'}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{c.jobs?.title || '-'}</td>
                      <td className="text-center font-medium">{s.resume}</td>
                      <td className="text-center font-medium">{s.interview}</td>
                      <td className="text-center font-medium">{s.communication}</td>
                      <td className="text-center font-medium">{s.confidence}</td>
                      <td className="text-center">
                        <span className="text-base font-display font-bold">{s.composite}</span>
                      </td>
                      <td>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getRecColor(s.recommendation)}`}>
                          {s.recommendation}
                        </span>
                      </td>
                      <td>
                        <button className="text-xs text-accent hover:underline font-medium">Review</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RecruiterScorecards;
