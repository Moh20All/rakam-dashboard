'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, KeyRound, Plus, MessageSquareText, Bug, BookOpen, Globe, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { Logo } from './Logo';
import { ToastProvider } from './Toaster';
import { logoutAction } from '@/app/login/actions';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/licenses', label: 'Licenses', icon: KeyRound, alsoActive: '/dashboard/customer' },
  { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquareText, countKey: 'feedback' },
  { href: '/dashboard/crashes', label: 'Crashes', icon: Bug, countKey: 'crashes' },
];

// The label follows the data-theme attribute through CSS, so no state is needed
function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('warshati-theme', next); } catch {}
  }
  return (
    <button onClick={toggle} className="flex w-full items-center gap-3 rounded-xl px-3 h-10 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors">
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
    <nav className="flex h-full flex-col bg-navy px-3 py-5 text-white" onClick={(e) => e.target.closest('a') && setOpen(false)}>
      <div className="px-2 pb-6"><Logo sub="Admin" /></div>

      <Link href="/dashboard/new" className="btn btn-gold mx-1 mb-6">
        <Plus className="size-4" /> New license
      </Link>

      <ul className="space-y-1">
        {NAV.map((item) => {
          const active = isActive(item);
          const count = item.countKey ? counts[item.countKey] : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 h-10 text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className={`size-4 ${active ? 'text-gold-hi' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {count > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-navy tnum">{count}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <a href="/guide" target="_blank" className="flex items-center gap-3 rounded-xl px-3 h-10 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white">
          <BookOpen className="size-4" /> User guide
        </a>
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 h-10 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white">
          <Globe className="size-4" /> Website
        </a>
        <ThemeToggle />
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 h-10 text-sm font-medium text-white/60 hover:bg-red-500/10 hover:text-red-300">
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen lg:pl-64">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

        {/* Mobile top bar + drawer */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 h-14 lg:hidden">
          <Logo />
          <button onClick={() => setOpen(true)} className="inline-flex size-10 items-center justify-center rounded-xl text-white hover:bg-white/10" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 z-10 inline-flex size-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10" aria-label="Close menu">
                <X className="size-5" />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
