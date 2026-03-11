import { apiService } from '@/lib/apiService';
import { StatusBadge } from '@/components/StatusBadge';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiService.getAdminUsers();
        setUsers(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => roleFilter === 'ALL' || u.role === roleFilter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm">
        <option value="ALL">All Roles</option><option value="RECRUITER">Recruiter</option><option value="CANDIDATE">Candidate</option>
      </select>
      <div className="card-elevated overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-border bg-muted/30">{['Name', 'Email', 'Role', 'Company', 'Status', 'Joined', 'Actions'].map(h => <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>{filtered.map(u => (
            <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 text-sm font-medium">{u.full_name || 'User'}</td><td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/10 text-accent">{u.role}</span></td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{u.organizations?.name || '-'}</td><td className="px-4 py-3"><StatusBadge status={u.status || 'Active'} /></td><td className="px-4 py-3 text-sm text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
              <td className="px-4 py-3"><button onClick={() => toast.success('Status toggled')} className="text-xs text-accent hover:underline">{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button></td>
            </tr>
          ))}</tbody></table>
      </div>
    </div>
  );
};
export default AdminUsers;
