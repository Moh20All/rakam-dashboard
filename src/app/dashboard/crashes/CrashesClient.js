'use client';

import { useMemo, useState } from 'react';
import { Bug, CheckCircle2, ChevronDown, RotateCcw, Terminal, Trash2, MessageCircleWarning } from 'lucide-react';
import { StatusBadge, EmptyState, PageHeader, CopyButton } from '@/components/ui';
import { useRunAction } from '@/components/Toaster';
import ConfirmDialog from '@/components/ConfirmDialog';
import { relTime, dateTime, crashSignature } from '@/lib/format';
import { setCrashesResolved, setCrashNote, deleteCrashes } from '../actions';

// Same first error line = same bug. Groups keep every report, newest first.
function groupCrashes(crashes) {
  const map = new Map();
  for (const c of crashes) {
    const sig = crashSignature(c.error);
    if (!map.has(sig)) map.set(sig, []);
    map.get(sig).push(c);
  }
  return [...map.entries()].map(([sig, items]) => ({
    sig,
    items,
    latest: items[0],
    open: items.filter((c) => !c.resolved).length,
    versions: [...new Set(items.map((c) => c.app_version).filter(Boolean))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
  }));
}

export default function CrashesClient({ crashes }) {
  const run = useRunAction();
  const [view, setView] = useState('open');
  const [openSig, setOpenSig] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const groups = useMemo(() => groupCrashes(crashes), [crashes]);
  const shown = groups.filter((g) => (view === 'open' ? g.open > 0 : view === 'resolved' ? g.open === 0 : true));

  return (
    <>
      <PageHeader title="Crashes" subtitle="Errors sent from the app’s crash screen, grouped by error." />

      <div className="mb-4 flex flex-wrap gap-2">
        {[['open', 'Open'], ['resolved', 'Fixed'], ['all', 'All']].map(([k, label]) => (
          <button key={k} className="chip" aria-pressed={view === k} onClick={() => setView(k)}>
            {label} <span className="tnum opacity-70">{groups.filter((g) => (k === 'open' ? g.open > 0 : k === 'resolved' ? g.open === 0 : true)).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.length === 0 && (
          <div className="card"><EmptyState icon={Bug} title={view === 'open' ? 'No open crashes 🎉' : 'Nothing here'}>{view === 'open' ? 'Every reported crash is marked as fixed.' : null}</EmptyState></div>
        )}
        {shown.map((g) => {
          const isOpen = openSig === g.sig;
          const ids = g.items.map((c) => c.id);
          const fixed = g.open === 0;
          return (
            <article key={g.sig} className={`card overflow-hidden ${fixed ? 'opacity-70' : ''}`}>
              <button onClick={() => setOpenSig(isOpen ? null : g.sig)} className="flex w-full items-start gap-3 p-4 text-left hover:bg-raised/50 transition-colors">
                <span className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${fixed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {fixed ? <CheckCircle2 className="size-4" /> : <Bug className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[13px] font-medium">{String(g.latest.error).split('\n')[0]}</p>
                  <p className="mt-1 text-xs text-faint">
                    {g.items.length} report{g.items.length > 1 ? 's' : ''} · {g.versions.map((v) => `v${v}`).join(', ') || 'unknown version'} · last {relTime(g.latest.created_at)}
                  </p>
                </div>
                <StatusBadge state={fixed ? 'resolved' : 'open'} label={fixed ? 'Fixed' : `${g.open} open`} />
                <ChevronDown className={`mt-1.5 size-4 shrink-0 text-faint transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && <CrashGroupDetail g={g} ids={ids} fixed={fixed} run={run} onDelete={() => setToDelete(g)} />}
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!toDelete} danger confirmLabel="Delete"
        title="Delete these crash reports?"
        body={`${toDelete?.items.length} report(s) will be removed for good.`}
        onConfirm={() => run(() => deleteCrashes(toDelete.items.map((c) => c.id)))}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}

function CrashGroupDetail({ g, ids, fixed, run, onDelete }) {
  const [pick, setPick] = useState(0);
  const [note, setNote] = useState(g.latest.admin_note || '');
  const c = g.items[pick];
  const trace = `${c.error}\n\n${c.stack || ''}`.trim();

  return (
    <div className="space-y-4 border-t border-line p-4">
      {g.items.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {g.items.slice(0, 12).map((x, i) => (
            <button key={x.id} className="chip" aria-pressed={pick === i} onClick={() => setPick(i)}>
              {x.resolved ? <CheckCircle2 className="size-3 text-emerald-500" /> : null} v{x.app_version} · {relTime(x.created_at)}
            </button>
          ))}
        </div>
      )}

      {c.context && (
        <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <MessageCircleWarning className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div><p className="text-xs font-semibold text-amber-700 dark:text-amber-400">What the user was doing</p><p className="mt-0.5" dir="auto">{c.context}</p></div>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-mute"><Terminal className="size-3.5" /> Stack trace · {dateTime(c.created_at)}</span>
          <CopyButton text={trace} label="Copy" className="btn btn-ghost btn-sm" />
        </div>
        <pre className="max-h-80 overflow-auto rounded-xl bg-navy p-4 font-mono text-[11.5px] leading-relaxed text-amber-200/90 whitespace-pre-wrap">{trace}</pre>
        {c.os && <p className="mt-1.5 truncate text-xs text-faint" title={c.os}>{c.os}</p>}
      </div>

      <div>
        <label className="label">Private note (shared by the whole group)</label>
        <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cause, fixed in which version…" />
      </div>

      <div className="flex flex-wrap gap-2">
        {note !== (g.latest.admin_note || '') && <button className="btn btn-gold btn-sm" onClick={() => run(() => setCrashNote(ids, note))}>Save note</button>}
        {fixed
          ? <button className="btn btn-ghost btn-sm" onClick={() => run(() => setCrashesResolved(ids, false))}><RotateCcw className="size-3.5" /> Reopen</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => run(() => setCrashesResolved(ids, true))}><CheckCircle2 className="size-3.5" /> Mark {g.items.length > 1 ? `all ${g.items.length}` : ''} fixed</button>}
        <div className="flex-1" />
        <button className="icon-btn hover:text-red-500" onClick={onDelete} aria-label="Delete group"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
}
