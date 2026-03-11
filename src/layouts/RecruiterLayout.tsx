import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import { LayoutDashboard, Briefcase, Users, Video, ClipboardList, FileText, Bell, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruiter/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/recruiter/candidates', icon: Users, label: 'Candidates' },
  { to: '/recruiter/interviews', icon: Video, label: 'Interviews' },
  { to: '/recruiter/scorecards', icon: ClipboardList, label: 'Scorecards' },
  { to: '/recruiter/offers', icon: FileText, label: 'Offers' },
  { to: '/recruiter/notifications', icon: Bell, label: 'Notifications' },
  { to: '/recruiter/settings', icon: Settings, label: 'Settings' },
];

export const RecruiterLayout = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        (payload: any) => {
          toast.success(payload.new.message, {
            icon: '🔔',
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen">
      {/* Skip to main content — WCAG 2.1 */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[99] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-md focus:text-sm focus:font-bold">
        Skip to main content
      </a>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 gradient-navy z-50 flex items-center justify-between px-4">
        <HireBricksLogo size="sm" variant="light" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/70 hover:text-white p-1.5 rounded-md"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Dark Navy Sidebar */}
      <aside
        className={`
          ${collapsed ? 'w-[64px]' : 'w-[220px]'}
          gradient-navy fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 z-50
          hidden lg:flex
          ${mobileOpen ? '!flex !w-[260px]' : ''}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={`h-14 flex items-center border-b border-white/10 ${collapsed && !mobileOpen ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {(!collapsed || mobileOpen) && <HireBricksLogo size="sm" variant="light" />}
          <button
            onClick={() => { if (mobileOpen) setMobileOpen(false); else setCollapsed(!collapsed); }}
            className="text-white/50 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {mobileOpen ? <X size={14} /> : collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto slim-scrollbar" aria-label="Recruiter navigation">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 relative group ${isActive
                ? 'text-white bg-white/12 font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-accent rounded-r-full" aria-hidden="true" />
                  )}
                  <item.icon size={16} className={isActive ? 'text-accent' : 'text-white/50 group-hover:text-white/80'} aria-hidden="true" />
                  {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-2.5 space-y-2">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-7 h-7 rounded-md bg-accent/20 flex items-center justify-center text-accent text-xs font-bold" aria-hidden="true">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 truncate">{profile?.full_name}</p>
                <p className="text-[10px] text-white/40 truncate">{profile?.email || 'Recruiter'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-white/40 hover:text-red-400 text-xs w-full px-2.5 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={14} aria-hidden="true" />
            {(!collapsed || mobileOpen) && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        id="main-content"
        role="main"
        className={`flex-1 ${collapsed ? 'lg:ml-[64px]' : 'lg:ml-[220px]'} transition-all duration-300 bg-background min-h-screen mt-12 lg:mt-0`}
      >
        <Outlet />
      </main>
    </div>
  );
};
