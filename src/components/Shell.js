'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, KeyRound, Plus, MessageSquareText, Bug, BookOpen, Globe, LogOut, Menu, X, Moon, Sun, ClipboardList } from 'lucide-react';
import { Logo } from './Logo';
import { ToastProvider } from './Toaster';
import { logoutAction } from '@/app/login/actions';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/licenses', label: 'Licenses', icon: KeyRound, alsoActive: '/dashboard/customer' },
  { href: '/dashboard/registrations', label: 'Sign-ups', icon: ClipboardList, countKey: 'registrations' },
  { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquareText, countKey: 'feedback' },
  { href: '/dashboard/crashes', label: 'Crashes', icon: Bug, countKey: 'crashes' },
];

// Sidebar rows on the graphite (inverse) ground: design system AdminSidebar
const ROW = 'flex w-full items-center gap-2.5 rounded-sm px-3 h-9 text-[13px] font-medium transition-colors';
const ROW_IDLE = 'text-inverse-foreground/80 hover:bg-inverse-raised hover:text-inverse-foreground';

// The label follows the data-theme attribute through CSS, so no state is needed
function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('warshati-theme', next); } catch {}
  }
  return (
    <button onClick={toggle} className={`${ROW} ${ROW_IDLE}`}>
      <Moon className="size-4 dark:hidden" /><Sun className="hidden size-4 dark:block" />
      <span className="dark:hidden">Dark mode</span><span className="hidden dark:inline">Light mode</span>
    </button>
  );
}

export default function Shell({ children, counts = {} }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) || (item.alsoActive && pathname.startsWith(item.alsoActive));

  const sidebar = (
    <nav className="flex h-full flex-col bg-inverse text-inverse-foreground" onClick={(e) => e.target.closest('a') && setOpen(false)}>
      <div className="px-4 pt-4 pb-3.5"><Logo sub="Admin" /></div>

      <div className="px-2 pb-3">
        <Link href="/dashboard/new" className="btn btn-flux w-full">
          <Plus className="size-4" /> New license
        </Link>
      </div>

      <ul className="flex flex-1 flex-col gap-0.5 px-2 py-1">
        {NAV.map((item) => {
          const active = isActive(item);
          const count = item.countKey ? counts[item.countKey] : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`${ROW} ${active ? 'bg-inverse-raised text-inverse-foreground font-semibold' : ROW_IDLE}`}
              >
                <item.icon className={`size-4 ${active ? 'text-flux' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {count > 0 && <span className="grid min-w-5 h-5 place-items-center rounded-full bg-flux px-1.5 text-[11px] font-bold text-flux-foreground tnum">{count}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-0.5 border-t border-inverse-raised p-2">
        <a href="/guide" target="_blank" className={`${ROW} ${ROW_IDLE}`}>
          <BookOpen className="size-4" /> User guide
        </a>
        <a href="/" target="_blank" className={`${ROW} ${ROW_IDLE}`}>
          <Globe className="size-4" /> Website
        </a>
        <ThemeToggle />
        <form action={logoutAction}>
          <button className={`${ROW} text-inverse-foreground/80 hover:bg-inverse-raised hover:text-destructive-soft`}>
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen lg:pl-60">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">{sidebar}</aside>

        {/* Phone: top bar + slide-in sidebar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-inverse px-2.5 h-[52px] lg:hidden">
          <Logo />
          <button onClick={() => setOpen(true)} className="inline-flex size-10 items-center justify-center rounded-sm text-inverse-foreground hover:bg-inverse-raised" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-overlay" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 shadow-dialog">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 z-10 inline-flex size-9 items-center justify-center rounded-sm text-inverse-foreground/75 hover:bg-inverse-raised" aria-label="Close menu">
                <X className="size-5" />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
