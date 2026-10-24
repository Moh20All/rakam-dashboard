import Link from 'next/link';
import { KeyRound, Store, Hourglass, Wallet, Activity, MoonStar, MessageSquareText, Bug, Zap, Plus, Database, ArrowRight, Ban } from 'lucide-react';
import { getLicenses, getFeedback, getCrashes, hasUpgrade } from '@/lib/data';
import { licenseState, isQuiet, relTime, money, QUIET_DAYS } from '@/lib/format';
import { PageHeader } from '@/components/ui';

export const metadata = { title: 'Overview' };

const DAY = 86400000;

export default async function OverviewPage() {
  const [licenses, feedback, crashes, upgraded] = await Promise.all([getLicenses(), getFeedback(), getCrashes(), hasUpgrade()]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const states = licenses.map(licenseState);
  const shops = new Set(licenses.map((l) => l.customer_id)).size;
  const activated = states.filter((s) => s === 'active').length;
  const waiting = states.filter((s) => s === 'waiting').length;
  const revoked = states.filter((s) => s === 'revoked').length;
  const revenue = licenses.reduce((s, l) => s + (Number(l.price) || 0), 0);
  const revenueMonth = licenses.filter((l) => new Date(l.created_at).getTime() >= monthStart).reduce((s, l) => s + (Number(l.price) || 0), 0);
  const newThisMonth = licenses.filter((l) => new Date(l.created_at).getTime() >= monthStart).length;
  const seenToday = licenses.filter((l) => l.last_seen_at && now - new Date(l.last_seen_at) < DAY).length;
  const quiet = licenses.filter(isQuiet);
  const newFeedback = feedback.filter((f) => (f.status || 'new') === 'new').length;
  const openCrashes = crashes.filter((c) => !c.resolved).length;

  // Keys created per month, last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const n = licenses.filter((l) => { const t = new Date(l.created_at); return t >= d && t < next; }).length;
    return { label: d.toLocaleDateString('en-GB', { month: 'short' }), n };
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.n));

  // Versions in use (from license checks)
  const versions = {};
  for (const l of licenses) if (l.last_version && licenseState(l) === 'active') versions[l.last_version] = (versions[l.last_version] || 0) + 1;
  const versionList = Object.entries(versions).sort((a, b) => b[0].localeCompare(a[0], undefined, { numeric: true }));

  // Activity feed
  const events = [];
  for (const l of licenses) {
    const who = l.customers?.name || 'Unknown';
    const href = `/dashboard/customer/${l.customer_id}`;
    events.push({ at: l.created_at, icon: KeyRound, tone: 'text-gold-ink', text: <>Key created for <b>{who}</b></>, href });
    if (l.activated_at) events.push({ at: l.activated_at, icon: Zap, tone: 'text-emerald-500', text: <><b>{who}</b> activated Warshati</>, href });
    if (l.revoked_at) events.push({ at: l.revoked_at, icon: Ban, tone: 'text-slate-400', text: <>Key revoked for <b>{who}</b></>, href });
  }
  for (const f of feedback) events.push({ at: f.created_at, icon: MessageSquareText, tone: 'text-sky-500', text: <>{f.type || 'Feedback'}: <span className="text-mute">“{String(f.message).slice(0, 70)}{String(f.message).length > 70 ? '…' : ''}”</span></>, href: '/dashboard/feedback' });
  for (const c of crashes) events.push({ at: c.created_at, icon: Bug, tone: 'text-red-500', text: <>Crash in v{c.app_version}: <span className="font-mono text-xs text-mute">{String(c.error).split('\n')[0].slice(0, 60)}</span></>, href: '/dashboard/crashes' });
  events.sort((a, b) => new Date(b.at) - new Date(a.at));

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader title={`${greeting} 👋`} subtitle="Here is how Warshati is doing.">
        <Link href="/dashboard/new" className="btn btn-gold"><Plus className="size-4" /> New license</Link>
      </PageHeader>

      {!upgraded && (
        <div className="card mb-6 flex flex-wrap items-center gap-4 border-gold/40 bg-gold/5 p-4">
          <Database className="size-5 text-gold-ink" />
          <div className="flex-1 min-w-60 text-sm">
            <b>One step left:</b> run <code className="font-mono text-xs">supabase/dashboard-upgrade.sql</code> in the Supabase SQL editor
            to turn on “last seen”, prices, feedback statuses and login protection.
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Store} label="Shops" value={shops} hint={`${licenses.length} keys in total`} />
        <Kpi icon={Zap} label="Activated" value={activated} hint={`${revoked} revoked`} tone="text-emerald-500" />
        <Kpi icon={Hourglass} label="Waiting" value={waiting} hint="Not activated yet" tone="text-amber-500" href="/dashboard/licenses?state=waiting" />
        <Kpi icon={Wallet} label="Revenue" value={money(revenue)} hint={`${money(revenueMonth)} this month · ${newThisMonth} new key${newThisMonth === 1 ? '' : 's'}`} tone="text-gold-ink" />
        <Kpi icon={Activity} label="Open today" value={upgraded ? seenToday : '—'} hint="Shops whose app checked in" tone="text-sky-500" />
        <Kpi icon={MoonStar} label="Quiet shops" value={upgraded ? quiet.length : '—'} hint={`No check-in for ${QUIET_DAYS}+ days`} tone="text-orange-500" href="/dashboard/licenses?state=quiet" />
        <Kpi icon={MessageSquareText} label="New feedback" value={newFeedback} hint={`${feedback.length} in total`} tone="text-sky-500" href="/dashboard/feedback" />
        <Kpi icon={Bug} label="Open crashes" value={openCrashes} hint={`${crashes.length} reports in total`} tone="text-red-500" href="/dashboard/crashes" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold">Recent activity</h2>
          </div>
          {events.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-mute">Nothing yet. Create your first license to get started.</p>
          ) : (
            <ul className="divide-y divide-line">
              {events.slice(0, 12).map((e, i) => (
                <li key={i}>
                  <Link href={e.href} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-raised/60 transition-colors">
                    <e.icon className={`size-4 shrink-0 ${e.tone}`} />
                    <span className="flex-1 min-w-0 truncate">{e.text}</span>
                    <span className="shrink-0 text-xs text-faint">{relTime(e.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <h2 className="font-semibold">New keys per month</h2>
            <div className="mt-5 flex h-40 gap-3">
              {months.map((m) => (
                <div key={m.label} className="flex h-full flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-xs font-semibold tnum">{m.n || ''}</span>
                    <div className="w-full rounded-t-lg bg-gold" style={{ height: `${(m.n / maxMonth) * 100}%`, minHeight: m.n ? 6 : 2, opacity: m.n ? 1 : 0.25 }} />
                  </div>
                  <span className="text-[11px] text-faint">{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Versions in use</h2>
            {versionList.length === 0 ? (
              <p className="mt-3 text-sm text-mute">{upgraded ? 'Shows up once shops open the app (v1.6.0 or later).' : 'Available after the database upgrade.'}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {versionList.map(([v, n]) => (
                  <li key={v} className="text-sm">
                    <div className="mb-1 flex justify-between"><span className="font-mono">v{v}</span><span className="text-mute tnum">{n} shop{n > 1 ? 's' : ''}</span></div>
                    <div className="h-1.5 rounded-full bg-raised"><div className="h-full rounded-full bg-navy dark:bg-gold" style={{ width: `${(n / activated) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {quiet.length > 0 && (
            <section className="card p-5">
              <h2 className="font-semibold">Shops gone quiet</h2>
              <p className="mt-1 text-xs text-mute">Maybe worth a call.</p>
              <ul className="mt-3 divide-y divide-line">
                {quiet.slice(0, 5).map((l) => (
                  <li key={l.id}>
                    <Link href={`/dashboard/customer/${l.customer_id}`} className="flex items-center justify-between py-2.5 text-sm hover:text-gold-ink">
                      <span className="font-medium">{l.customers?.name}</span>
                      <span className="flex items-center gap-1 text-xs text-faint">{relTime(l.last_seen_at)} <ArrowRight className="size-3" /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function Kpi({ icon: Icon, label, value, hint, tone = 'text-ink', href }) {
  const body = (
    <>
      <div className="flex items-center gap-2 text-xs font-semibold text-mute">
        <Icon className={`size-4 ${tone}`} /> {label}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tnum">{typeof value === 'number' ? value.toLocaleString('en') : value}</p>
      {hint && <p className="mt-1 truncate text-xs text-faint">{hint}</p>}
    </>
  );
  return href
    ? <Link href={href} className="card block p-4 transition-colors hover:border-gold/50">{body}</Link>
    : <div className="card p-4">{body}</div>;
}
