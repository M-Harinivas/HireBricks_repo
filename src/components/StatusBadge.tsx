const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  LIVE: 'bg-emerald-500/10 text-emerald-600',
  CLOSED: 'bg-destructive/10 text-destructive',
  APPLIED: 'bg-blue-500/10 text-blue-600',
  SHORTLISTED: 'bg-purple-500/10 text-purple-600',
  INTERVIEW_INVITED: 'bg-indigo-500/10 text-indigo-600',
  INTERVIEW_SCHEDULED: 'bg-amber-500/10 text-amber-600',
  INTERVIEW_COMPLETED: 'bg-teal-500/10 text-teal-600',
  UNDER_REVIEW: 'bg-cyan-500/10 text-cyan-600',
  OFFER_SENT: 'bg-fuchsia-500/10 text-fuchsia-600',
  HIRED: 'bg-green-500/10 text-green-600',
  REJECTED: 'bg-rose-500/10 text-rose-600',
  ACTIVE: 'bg-emerald-500/10 text-emerald-600',
  PASSIVE: 'bg-muted text-muted-foreground',
  ARCHIVED: 'bg-gray-500/10 text-gray-600',
};

export const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-muted text-muted-foreground';
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`${colorClass} px-2.5 py-1 rounded-full text-xs font-medium`}>
      {label}
    </span>
  );
};

export const ScoreBar = ({ score, max = 100 }: { score: number; max?: number }) => {
  const pct = (score / max) * 100;
  const color = pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium">{score}</span>
    </div>
  );
};
