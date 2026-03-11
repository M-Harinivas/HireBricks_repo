import { apiService } from '@/lib/apiService';
import { StatusBadge } from '@/components/StatusBadge';
import { useState, useEffect } from 'react';

const AdminJobs = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiService.getJobs();
        setJobs(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  const filtered = jobs.filter(j => statusFilter === 'ALL' || j.status === statusFilter);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Jobs</h1>
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm">
        <option value="ALL">All Status</option><option value="LIVE">Live</option><option value="DRAFT">Draft</option><option value="CLOSED">Closed</option>
      </select>
      <div className="card-elevated overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-border bg-muted/30">{['Title', 'Company', 'Status', 'Applicants', 'Created'].map(h => <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>{filtered.map(j => (
            <tr key={j.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 text-sm font-medium">{j.title}</td><td className="px-4 py-3 text-sm text-muted-foreground">{j.organizations?.name || '-'}</td>
              <td className="px-4 py-3"><StatusBadge status={j.status} /></td><td className="px-4 py-3 text-sm">{j.applications?.[0]?.count || 0}</td><td className="px-4 py-3 text-sm text-muted-foreground">{new Date(j.created_at).toLocaleDateString()}</td>
            </tr>
          ))}</tbody></table>
      </div>
    </div>
  );
};
export default AdminJobs;
