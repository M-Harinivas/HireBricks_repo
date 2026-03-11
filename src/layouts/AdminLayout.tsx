import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HireBricksLogo } from '@/components/HireBricksLogo';
import { LayoutDashboard, Building2, Users, Briefcase, BarChart3, Settings, LogOut, Shield } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/tenants', icon: Building2, label: 'Companies' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export const AdminLayout = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <HireBricksLogo size="sm" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent uppercase tracking-wide">Admin</span>
            </div>
            <nav className="flex items-center gap-0.5">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary-foreground/15 text-primary-foreground'
                    : 'text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/8'
                  }`
                }>
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-accent/20 flex items-center justify-center">
                <Shield size={14} className="text-accent" />
              </div>
              <span className="text-sm text-primary-foreground/70">{profile?.full_name}</span>
            </div>
            <button onClick={handleLogout} className="text-primary-foreground/50 hover:text-primary-foreground p-1.5 rounded transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};
