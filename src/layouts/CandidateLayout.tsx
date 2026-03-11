import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import { LayoutDashboard, User, Briefcase, FileText, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/candidate/jobs', icon: Briefcase, label: 'Find Jobs' },
  { to: '/candidate/profile', icon: User, label: 'Profile' },
  { to: '/candidate/applications', icon: FileText, label: 'My Applications' },
  { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

export const CandidateLayout = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('candidate-notifications')
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

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Skip to main content — WCAG 2.1 */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[99] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-md focus:text-sm focus:font-bold">
        Skip to main content
      </a>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar/95 backdrop-blur-sm border-b border-white/10 z-40 flex items-center justify-between px-4">
        <HireBricksLogo size="sm" variant="light" />
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2 text-white" aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Dark Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-56 lg:w-[220px] gradient-navy flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Candidate navigation"
      >
        <div className="p-4 h-14 flex items-center border-b border-white/10">
          <HireBricksLogo size="sm" variant="light" />
        </div>

        <div className="px-2 py-4 flex-1 overflow-y-auto slim-scrollbar">
          <nav className="space-y-0.5">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) =>
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
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 p-2.5">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <span className="text-xs font-medium text-white/90 truncate">{profile?.full_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors shrink-0"
              aria-label="Sign out"
            >
              <LogOut size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" role="main" className="flex-1 lg:ml-[220px] flex flex-col min-h-screen w-full pt-14 lg:pt-0">
        <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-5 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
