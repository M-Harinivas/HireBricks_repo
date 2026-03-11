import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ hires: 0, timeToHire: '14 days', passRate: '65%', acceptRate: '80%' });
  const [monthly, setMonthly] = useState<any[]>([]);
  const [domain, setDomain] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiService.getAdminAnalytics();

        const offersSent = data.offersData.filter((o: any) => ['Sent', 'OFFER_SENT'].includes(o.status)).length || 0;
        const acceptedOffers = data.offersData.filter((o: any) => ['Accepted', 'HIRED'].includes(o.status)).length || 0;

        // Constants
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Hires aggregate - Only count 'HIRED' or 'Accepted' to match 'Total Hires' summary
        const mData = data.offersData.filter((o: any) => ['Accepted', 'HIRED'].includes(o.status)).reduce((acc: any, offer: any) => {
          const d = new Date(offer.created_at || offer.start_date || Date.now());
          const m = months[d.getMonth()];
          if (!acc[m]) acc[m] = { hires: 0, interviews: 0 };
          acc[m].hires++;
          return acc;
        }, {});

        // Calculate time to hire from offers (offer created_at - job created_at)
        let totalTimeToHire = 0;
        let validOffers = 0;

        const timeToHireTrends: any = {};

        data.offersData.forEach((o: any) => {
          if (o.created_at && o.applications?.jobs?.created_at) {
            const offerDate = new Date(o.created_at);
            const jobDate = new Date(o.applications.jobs.created_at);
            const daysDiff = Math.max(0, Math.round((offerDate.getTime() - jobDate.getTime()) / (1000 * 3600 * 24)));

            totalTimeToHire += daysDiff;
            validOffers++;

            const m = months[offerDate.getMonth()];
            if (!timeToHireTrends[m]) timeToHireTrends[m] = { total: 0, count: 0 };
            timeToHireTrends[m].total += daysDiff;
            timeToHireTrends[m].count++;
          }
        });

        const avgTimeToHire = validOffers > 0 ? Math.round(totalTimeToHire / validOffers) : 0;

        let totalApps = 0;
        let passedApps = 0;

        // Domain & Pass Rate Calculations
        const dData = data.jobsData.reduce((acc: any, job: any) => {
          const dept = job.department || 'Other';
          if (!acc[dept]) acc[dept] = { value: 0, pass: 0, total: 0 };

          const apps = job.applications?.length || 0;
          acc[dept].value += apps;
          acc[dept].total += apps;
          totalApps += apps;

          // Consider an application 'passed' if status is beyond APPLIED/REJECTED (e.g. INTERVIEW_SCHEDULED, OFFER_SENT, HIRED, SHORTLISTED)
          const passed = job.applications?.filter((app: any) => ['SHORTLISTED', 'INTERVIEW_INVITED', 'INTERVIEW_SCHEDULED', 'OFFER_SENT', 'HIRED'].includes(app.status)).length || 0;

          acc[dept].pass += passed;
          passedApps += passed;

          return acc;
        }, {});

        setStats({
          hires: acceptedOffers,
          timeToHire: avgTimeToHire > 0 ? `${avgTimeToHire} days` : 'N/A',
          passRate: totalApps > 0 ? Math.round((passedApps / totalApps) * 100) + '%' : '0%',
          acceptRate: offersSent > 0 ? Math.round((acceptedOffers / offersSent) * 100) + '%' : '0%'
        });

        const currentMonth = new Date().getMonth();
        const displayMonths = [];
        const t2hMonths = [];

        for (let i = 5; i >= 0; i--) {
          const mIndex = (currentMonth - i + 12) % 12;
          const m = months[mIndex];
          // Monthly Hires & Interviews
          displayMonths.push({
            month: m,
            hires: mData[m]?.hires || 0,
            interviews: data.interviewsData?.filter((intv: any) => new Date(intv.scheduled_at).getMonth() === mIndex).length || 0
          });

          // Monthly Time-to-Hire trend
          const t2hStats = timeToHireTrends[m];
          t2hMonths.push({
            month: m,
            days: t2hStats && t2hStats.count > 0 ? Math.round(t2hStats.total / t2hStats.count) : 0
          });
        }
        setMonthly(displayMonths);
        setTimeToHireMonthly(t2hMonths);

        const topDomains = Object.entries(dData)
          .map(([name, s]: [string, any]) => ({ name, value: s.value, rate: s.total ? Math.round((s.pass / s.total) * 100) : 0 }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setDomain(topDomains.length > 0 ? topDomains : [{ name: 'No Data', value: 0, rate: 0 }]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const [timeToHireMonthly, setTimeToHireMonthly] = useState<any[]>([]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Analytics</h1><input type="month" defaultValue="2025-03" className="px-3 py-2 rounded-lg border border-input bg-card text-sm" /></div>
      <div className="grid grid-cols-4 gap-4">
        {[{ label: 'Total Hires', val: stats.hires }, { label: 'Avg Time-to-Hire', val: stats.timeToHire }, { label: 'Interview Pass Rate', val: stats.passRate }, { label: 'Offer Accept Rate', val: stats.acceptRate }].map(s => (
          <div key={s.label} className="stat-card text-center"><div className="text-2xl font-bold">{s.val}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-elevated p-5"><h3 className="font-semibold mb-4">Monthly Hires</h3><ResponsiveContainer width="100%" height={220}><BarChart data={monthly}><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="hires" fill="#10B981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="card-elevated p-5"><h3 className="font-semibold mb-4">Time-to-Hire Trend</h3><ResponsiveContainer width="100%" height={220}><LineChart data={timeToHireMonthly}><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="days" stroke="#F59E0B" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        <div className="card-elevated p-5"><h3 className="font-semibold mb-4">Top Industries Hiring</h3><ResponsiveContainer width="100%" height={220}><BarChart data={domain} layout="vertical"><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} /><Tooltip /><Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="card-elevated p-5"><h3 className="font-semibold mb-4">Interview Pass Rate by Domain</h3><ResponsiveContainer width="100%" height={220}><BarChart data={domain}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="rate" fill="#06B6D4" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};
export default AdminAnalytics;
