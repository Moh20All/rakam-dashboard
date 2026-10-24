'use client';

import { useMemo, useState } from 'react';
import { Bug, Lightbulb, MessageSquare, MessageSquareText, Search, Trash2, Check, Eye, Inbox, Monitor } from 'lucide-react';
import { StatusBadge, EmptyState, PageHeader, CopyButton } from '@/components/ui';
import { useRunAction } from '@/components/Toaster';
import ConfirmDialog from '@/components/ConfirmDialog';
import { relTime, dateTime } from '@/lib/format';
import { setFeedbackStatus, setFeedbackNote, deleteFeedback } from '../actions';

const TYPE_ICON = { Bug, Suggestion: Lightbulb };
const TYPE_TONE = { Bug: 'text-orange-500 bg-orange-500/10', Suggestion: 'text-amber-500 bg-amber-500/10' };

// "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... Electron/34.x" -> "Windows 10/11 · Electron 34"
function shortOs(ua) {
  if (!ua) return '';
  const win = /Windows NT ([\d.]+)/.exec(ua);
  const el = /Electron\/(\d+)/.exec(ua);
  return [win ? `Windows ${win[1] === '10.0' ? '10/11' : win[1]}` : ua.slice(0, 30), el && `Electron ${el[1]}`].filter(Boolean).join(' · ');
}

export default function FeedbackClient({ feedback }) {
  const run = useRunAction();
  const [status, setStatus] = useState('new');
  const [type, setType] = useState('All');
  const [version, setVersion] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const statusOf = (f) => f.status || 'new';
  const versions = useMemo(() => [...new Set(feedback.map((f) => f.app_version).filter(Boolean))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })), [feedback]);
  const types = useMemo(() => [...new Set(feedback.map((f) => f.type).filter(Boolean))], [feedback]);
  const count = (s) => feedback.filter((f) => s === 'all' || statusOf(f) === s).length;

  const rows = feedback.filter((f) =>
    (status === 'all' || statusOf(f) === status) &&
    (type === 'All' || f.type === type) &&
    (version === 'All' || f.app_version === version) &&
    (!query || String(f.message).toLowerCase().includes(query.toLowerCase())));

  async function open(f) {
    const next = openId === f.id ? null : f.id;
    setOpenId(next);
    if (next && statusOf(f) === 'new') await setFeedbackStatus(f.id, 'seen'); // quietly mark as seen
  }

  return (
    <>
      <PageHeader title="Feedback" subtitle="What shops tell you from inside the app." />

      <div className="mb-4 flex flex-wrap gap-2">
        {[['new', 'New', Inbox], ['seen', 'Seen', Eye], ['done', 'Done', Check], ['all', 'All', MessageSquareText]].map(([k, label, Icon]) => (
          <button key={k} className="chip" aria-pressed={status === k} onClick={() => setStatus(k)}>
            <Icon className="size-3.5" /> {label} <span className="tnum opacity-70">{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input className="input pl-10" placeholder="Search messages…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input md:w-40" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="All">All types</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="input md:w-40" value={version} onChange={(e) => setVersion(e.target.value)} aria-label="Version">
          <option value="All">All versions</option>
          {versions.map((v) => <option key={v} value={v}>v{v}</option>)}
        </select>
      </div>

      <div className="card divide-y divide-line overflow-hidden">
        {rows.length === 0 && (
          <EmptyState icon={MessageSquareText} title={status === 'new' ? 'Inbox zero 🎉' : 'Nothing here'}>
            {status === 'new' ? 'No new feedback. Shops send it from the app’s Feedback button.' : 'Try another filter.'}
          </EmptyState>
        )}
        {rows.map((f) => {
          const Icon = TYPE_ICON[f.type] || MessageSquare;
          const isOpen = openId === f.id;
          return (
            <article key={f.id} className={isOpen ? 'bg-raised/40' : ''}>
              <button onClick={() => open(f)} className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-raised/50 transition-colors">
                <span className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${TYPE_TONE[f.type] || 'text-sky-500 bg-sky-500/10'}`}><Icon className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${isOpen ? 'whitespace-pre-wrap' : 'truncate'} ${statusOf(f) === 'new' ? 'font-semibold' : ''}`} dir="auto">{f.message}</p>
                  <p className="mt-1 text-xs text-faint">{f.type} · v{f.app_version} · {relTime(f.created_at)}</p>
                </div>
                <StatusBadge state={statusOf(f)} />
              </button>
              {isOpen && <FeedbackDetail f={f} run={run} onDelete={() => setToDelete(f)} statusOf={statusOf} shortOs={shortOs} />}
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!toDelete} danger confirmLabel="Delete"
        title="Delete this feedback?" body="It will be removed for good."
        onConfirm={() => run(() => deleteFeedback(toDelete.id))}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}

function FeedbackDetail({ f, run, onDelete, statusOf, shortOs }) {
  const [note, setNote] = useState(f.admin_note || '');
  return (
    <div className="space-y-4 px-5 pb-5 pl-16">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-mute">
        <span>{dateTime(f.created_at)}</span>
        <span className="inline-flex items-center gap-1" title={f.os_info}><Monitor className="size-3" />{shortOs(f.os_info)}</span>
      </div>
      <div>
        <label className="label">Private note</label>
        <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What you did about it, who reported it…" />
      </div>
      <div className="flex flex-wrap gap-2">
        {note !== (f.admin_note || '') && <button className="btn btn-gold btn-sm" onClick={() => run(() => setFeedbackNote(f.id, note))}>Save note</button>}
        {statusOf(f) !== 'done'
          ? <button className="btn btn-ghost btn-sm" onClick={() => run(() => setFeedbackStatus(f.id, 'done'), 'Marked as done')}><Check className="size-3.5" /> Mark done</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => run(() => setFeedbackStatus(f.id, 'seen'), 'Reopened')}><Eye className="size-3.5" /> Reopen</button>}
        <CopyButton text={f.message} label="Copy" className="btn btn-ghost btn-sm" />
        <div className="flex-1" />
        <button className="icon-btn hover:text-red-500" onClick={onDelete} aria-label="Delete"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
}
