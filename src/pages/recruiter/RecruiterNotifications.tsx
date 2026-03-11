import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/lib/apiService';
import { Bell, FileText, Brain, CheckCircle, XCircle, Video, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const iconMap: Record<string, typeof Bell> = {
  application: FileText, evaluation: Brain, offer_accepted: CheckCircle, offer_declined: XCircle, interview_completed: Video,
};

const RecruiterNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const fetched = await apiService.getNotifications(user.id);
        if (fetched) setNotifications(fetched);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  const markAllRead = async () => {
    if (!user?.id) return;
    try {
      await apiService.markNotificationsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{notifications.filter(n => !n.read).length} unread</p>
        </div>
        <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"><Check size={12} /> Mark all read</button>
      </div>
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-accent w-7 h-7" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground glass-card">No notifications found.</div>
        ) : (
          notifications.map(n => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <div key={n.id} className={`glass-card p-3 flex items-start gap-3 transition-colors ${!n.read ? 'border-l-2 border-l-accent' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'offer_accepted' ? 'bg-success/10 text-success' : n.type === 'offer_declined' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold">{n.title}</h4>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">{new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            );
          }))}
      </div>
    </div>
  );
};

export default RecruiterNotifications;
