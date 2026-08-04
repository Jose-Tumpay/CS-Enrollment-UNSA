import { Link, useLocation } from 'wouter';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, Grid3x3, CheckSquare, BarChart2,
  SplitSquareHorizontal, Moon, Sun, LogOut, HelpCircle,
} from 'lucide-react';
import { useStudentStore } from '../hooks/useStudentStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { resetProfile } = useStudentStore();

  const navItems = [
    { href: '/dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
    { href: '/malla',       label: 'Malla Curricular',  icon: Grid3x3 },
    { href: '/simulador',   label: 'Simulador',         icon: CheckSquare },
    { href: '/progreso',    label: 'Progreso',          icon: BarChart2 },
    { href: '/comparador',  label: 'Comparador',        icon: SplitSquareHorizontal },
  ];

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background print:h-auto print:block">
      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col hidden md:flex shrink-0 print:hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              CS
            </div>
            <span>UNSA Planner</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (location === '/' && item.href === '/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="border-t border-border my-2" />

          {/* Help link */}
          <Link
            href="/ayuda"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === '/ayuda'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            ¿Cómo usar?
          </Link>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>

          <button
            onClick={() => {
              if (confirm('¿Estás seguro de reiniciar tu perfil? Se borrará todo tu progreso.')) {
                resetProfile();
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-destructive hover:bg-destructive/10 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            Reiniciar Perfil
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:overflow-visible print:block">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              CS
            </div>
            UNSA Planner
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Scrollable area */}
        <div className="flex-1 overflow-auto bg-background/50 print:overflow-visible print:bg-white">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden border-t border-border bg-background flex items-center justify-around p-2 pb-safe shrink-0 print:hidden">
          {[...navItems, { href: '/ayuda', label: '¿Cómo usar?', icon: HelpCircle }].map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-md ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight text-center">
                  {item.label === '¿Cómo usar?' ? 'Ayuda' : item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
