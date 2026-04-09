import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Package, TrendingUp, Bell, Users, CreditCard, Menu, LogOut, LayoutDashboard,
  Sun, Moon, Languages, Tag, Shield,
} from 'lucide-react';

const navKeys = [
  { path: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/products', key: 'nav.products', icon: Package },
  { path: '/categories', key: 'nav.categories', icon: Tag },
  { path: '/tracking', key: 'nav.tracking', icon: TrendingUp },
  { path: '/competitors', key: 'nav.competitors', icon: Users, feature: 'competitorTracking' },
  { path: '/alerts', key: 'nav.alerts', icon: Bell },
  { path: '/subscription', key: 'nav.subscription', icon: CreditCard },
  { path: '/admin', key: 'nav.admin', icon: Shield, adminOnly: true },
];

function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-9 w-9 ${className}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation();
  const next = i18n.language === 'fr' ? 'en' : 'fr';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 ${className}`}
            onClick={() => i18n.changeLanguage(next)}
          >
            <Languages className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{next === 'fr' ? 'Français' : 'English'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const subscription = useSelector((s) => s.subscription.current);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = navKeys.filter(({ feature, adminOnly }) => {
    if (adminOnly && user?.role !== 'admin') return false;
    if (feature && subscription?.features?.[feature] !== true) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-5 py-5 hover:opacity-80 transition-opacity">
        <TrendingUp className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">PriceTracker</span>
      </Link>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNav.map(({ path, key, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {t(key)}
          </NavLink>
        ))}
      </nav>
      <Separator className="bg-sidebar-border" />
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate max-w-[120px]">{user?.name}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/70 hover:text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('nav.logout')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r fixed inset-y-0 z-50 bg-sidebar">
        <SidebarContent onNavigate={() => {}} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 border-b bg-background px-4">
          <div className="flex items-center">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <Link to="/dashboard" className="ml-2 font-semibold hover:opacity-80 transition-opacity">PriceTracker</Link>
          </div>
          <div className="flex items-center">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">{t('nav.navigation')}</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <div className="hidden md:flex items-center justify-end h-14 border-b bg-background sticky top-0 z-30 px-6 gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <main className="p-4 md:p-6 max-w-7xl mx-auto mt-14 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
