import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/apiService';
import { StatusBadge } from '@/components/StatusBadge';
import { X, AlertTriangle, Info, Loader2, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const RecruiterInterviews = () => {
  const { profile } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetched = await apiService.getInterviews();
        if (fetched) {
          const orgInterviews = fetched.filter((i: any) =>
            i.applications?.jobs?.organization_id === profile.organization_id
          );
          setInterviews(orgInterviews);
        }
      } catch (err) {
        console.error('Error fetching interviews:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterviews();
  }, [profile]);

  const selected = interviews.find(i => i.id === selectedId);

  const getRiskLevel = (score: number) => {
    if (score > 80) return { label: 'Low', color: 'bg-success/10 text-success' };
    if (score > 50) return { label: 'Medium', color: 'bg-warning/10 text-warning' };
    return { label: 'High', color: 'bg-destructive/10 text-destructive' };
  };

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">AI Interviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{interviews.length} interview{interviews.length !== 1 ? 's' : ''} scheduled</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Video size={14} />
          <span>{interviews.filter(i => i.status === 'INTERVIEW_SCHEDULED').length} pending</span>
        </div>
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
                <th>Candidate</th>
                <th>Job</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Score</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">No interviews found.</td>
                </tr>
              ) : interviews.map(i => {
                const risk = getRiskLevel(i.proctoring_score || 0);
                return (
                  <tr key={i.id} onClick={() => i.status === 'INTERVIEW_COMPLETED' && setSelectedId(i.id)} className={i.status === 'INTERVIEW_COMPLETED' ? 'cursor-pointer' : ''}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                          {i.applications?.profiles?.full_name?.charAt(0) || 'C'}
                        </div>
                        <span className="font-medium">{i.applications?.profiles?.full_name || 'Candidate'}</span>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{i.applications?.jobs?.title || '-'}</td>
                    <td className="text-muted-foreground text-xs">{new Date(i.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td><StatusBadge status={i.status} /></td>
                    <td className="text-muted-foreground">{i.duration ? `${i.duration}m` : '-'}</td>
                    <td className="font-semibold">{i.ai_score ?? '-'}</td>
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${risk.color}`}>
                        {risk.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Proctoring Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedId(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-lg p-5 max-w-lg w-full shadow-xl border border-border relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-section-title">Proctoring — {selected.applications?.profiles?.full_name || 'Candidate'}</h3>
              <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"><X size={16} /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-muted/30 rounded-md p-2.5 text-center">
                <div className="text-lg font-display font-bold">{selected.ai_score ?? '-'}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">AI Score</div>
              </div>
              <div className="bg-muted/30 rounded-md p-2.5 text-center">
                <div className="text-lg font-display font-bold">{selected.duration ?? '-'}m</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Duration</div>
              </div>
              <div className="bg-muted/30 rounded-md p-2.5 text-center">
                <StatusBadge status={selected.proctoring_score > 80 ? 'LOW_RISK' : selected.proctoring_score > 50 ? 'MEDIUM_RISK' : 'HIGH_RISK'} />
                <div className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Risk</div>
              </div>
            </div>

            {selected.flagged_events ? (
              <div className="space-y-1.5 mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flagged Events</h4>
                {(typeof selected.flagged_events === 'string' ? JSON.parse(selected.flagged_events) : selected.flagged_events).map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 bg-muted/30 rounded-md p-2.5">
                    <AlertTriangle size={12} className={e.severity === 'High' ? 'text-destructive' : e.severity === 'Medium' ? 'text-warning' : 'text-muted-foreground'} />
                    <span className="text-xs flex-1">{e.event}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{e.time}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground mb-3">No flagged events recorded.</p>}

            <div className="flex items-start gap-2 bg-accent/5 border border-accent/10 rounded-md p-2.5">
              <Info size={12} className="mt-0.5 text-accent shrink-0" />
              <span className="text-[11px] text-muted-foreground">No candidate is auto-disqualified. All decisions require recruiter review.</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviews;
