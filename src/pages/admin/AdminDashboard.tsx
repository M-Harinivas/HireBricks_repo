import { Building2, Users, Briefcase, Video, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';

const COLORS = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Companies', value: 0, icon: Building2 },
    { label: 'Total Users', value: 0, icon: Users },
    { label: 'Jobs This Month', value: 0, icon: Briefcase },
    { label: 'Interviews', value: 0, icon: Video },
    { label: 'Offers Sent', value: 0, icon: FileText },
  ]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [domain, setDomain] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiService.getAdminAnalytics();

        setStats([
          { label: 'Total Companies', value: data.totalCompanies || 0, icon: Building2 },
          { label: 'Total Users', value: data.totalUsers || 0, icon: Users },
          { label: 'Jobs This Month', value: data.jobsThisMonth || 0, icon: Briefcase },
          { label: 'Interviews', value: data.totalInterviews || 0, icon: Video },
          { label: 'Offers Sent', value: data.offersSent || 0, icon: FileText },
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // aggregate interviews month by month dynamically
        const mData = data.interviewsData.reduce((acc: any, intv: any) => {
          const d = new Date(intv.scheduled_at || Date.now());
          const m = months[d.getMonth()];
          if (!acc[m]) acc[m] = { interviews: 0 };
          acc[m].interviews++;
          return acc;
        }, {});

        const currentMonth = new Date().getMonth();
        const displayMonths = [];
        for (let i = 5; i >= 0; i--) {
          const mIndex = (currentMonth - i + 12) % 12;
          const m = months[mIndex];
          displayMonths.push({ month: m, interviews: mData[m]?.interviews || 0 });
        }
        setMonthly(displayMonths);

        // Domain Data
        const dData = data.jobsData.reduce((acc: any, job: any) => {
          const dept = job.department || 'Other';
          if (!acc[dept]) acc[dept] = { value: 0 };
          const apps = job.applications?.length || 0;
          acc[dept].value += apps;
          return acc;
        }, {});

        const topDomains = Object.entries(dData)
          .map(([name, s]: [string, any]) => ({ name, value: s.value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setDomain(topDomains.length > 0 ? topDomains : [{ name: 'No Data', value: 1 }]);

        // Generate dynamic activity based on actual data
        const dynamicActivity = [];
        data.offersData.slice(0, 3).forEach((o: any) => {
          dynamicActivity.push({ event: `Offer status: ${o.status}`, time: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recent' });
        });

        setActivities(dynamicActivity.length > 0 ? dynamicActivity : [{ event: 'Platform active, monitoring metrics...', time: 'Just now' }]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><s.icon size={18} /></div>
            <div><div className="text-xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-elevated p-5">
          <h3 className="font-semibold mb-4">Monthly Interview Volume</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthly}><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="interviews" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card-elevated p-5">
          <h3 className="font-semibold mb-4">Applications by Domain</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={domain} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
              {domain.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card-elevated p-5">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">{activities.map((a, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm">{a.event}</span><span className="text-xs text-muted-foreground">{a.time}</span>
          </div>
        ))}</div>
      </div>
    </div>
  );
};
export default AdminDashboard;
