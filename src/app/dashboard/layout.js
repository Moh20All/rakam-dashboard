import Link from 'next/link';
import { logoutAction } from '../login/actions';

export default function DashboardLayout({ children }) {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light">
      <div className="flex h-full grow flex-col">
        {/* Navigation Bar — matches stitch: navy bg, Rakam logo, nav links, avatar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-primary px-6 md:px-10 py-4 text-white">
          <div className="flex items-center gap-4">
            <div className="size-8 text-accent">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-white text-2xl font-black leading-tight tracking-tight">Rakam</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8 items-center">
            <nav className="hidden md:flex items-center gap-9">
              <Link href="/dashboard" className="text-white/90 hover:text-accent text-sm font-semibold leading-normal transition-colors">Dashboard</Link>
              <Link href="/dashboard/new" className="text-white/60 hover:text-accent text-sm font-medium leading-normal transition-colors">New License</Link>
              <Link href="/dashboard/monitoring" className="text-white/60 hover:text-accent text-sm font-medium leading-normal transition-colors">Monitoring</Link>
            </nav>
            <div className="flex gap-3 items-center">
              <form action={logoutAction}>
                <button type="submit" className="flex items-center justify-center rounded-lg h-10 w-10 bg-white/10 hover:bg-white/20 text-white transition-all" title="Sign Out">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </form>
              <div className="h-10 w-10 rounded-full border-2 border-accent/50 overflow-hidden bg-primary flex items-center justify-center text-accent font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 justify-center py-8">
          <div className="flex flex-col max-w-[1200px] flex-1 px-4 md:px-10">
            {children}
          </div>
        </main>

        {/* Footer — matches stitch */}
        <footer className="py-10 border-t border-slate-200 mt-10">
          <div className="max-w-[1200px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-60">
              <div className="size-6 text-primary">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                </svg>
              </div>
              <span className="font-bold text-sm">RAKAM © 2024</span>
            </div>
            <div className="flex gap-6">
              <span className="text-slate-500 text-sm font-medium">Privacy Policy</span>
              <span className="text-slate-500 text-sm font-medium">Service Terms</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
