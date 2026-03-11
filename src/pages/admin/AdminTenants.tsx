import { apiService } from '@/lib/apiService';
import { StatusBadge } from '@/components/StatusBadge';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const AdminTenants = () => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await apiService.getAdminTenants();
        setTenants(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const selected = tenants.find(t => t.id === selectedId);
  const filtered = tenants.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Companies</h1>
      <div className="relative max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div>
      <div className="card-elevated overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-border bg-muted/30">{['Company', 'Industry', 'Size', 'Jobs', 'Users', 'Status', 'Joined'].map(h => <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>{filtered.map(t => (
            <tr key={t.id} onClick={() => setSelectedId(t.id)} className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer">
              <td className="px-4 py-3 text-sm font-medium">{t.name}</td><td className="px-4 py-3 text-sm text-muted-foreground">{t.industry || '-'}</td><td className="px-4 py-3 text-sm text-muted-foreground">{t.size || '-'}</td>
              <td className="px-4 py-3 text-sm">{t.jobs?.length || 0}</td><td className="px-4 py-3 text-sm">{t.profiles?.length || 0}</td><td className="px-4 py-3"><StatusBadge status={t.status || 'Active'} /></td><td className="px-4 py-3 text-sm text-muted-foreground">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}</tbody></table>
      </div>
      {selected && (
        <div className="fixed inset-y-0 right-0 w-96 bg-card shadow-xl border-l border-border p-6 z-50 overflow-y-auto">
          <div className="flex justify-between mb-4"><h3 className="text-lg font-bold">{selected.name}</h3><button onClick={() => setSelectedId(null)}><X size={18} /></button></div>
          <div className="space-y-3 text-sm">{Object.entries({ Industry: selected.industry || '-', Size: selected.size || '-', Jobs: selected.jobs?.length || 0, Users: selected.profiles?.length || 0, Status: selected.status || 'Active', Joined: selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '-' }).map(([k, v]) => (
            <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v as string}</span></div>
          ))}</div>
        </div>
      )}
    </div>
  );
};
export default AdminTenants;
