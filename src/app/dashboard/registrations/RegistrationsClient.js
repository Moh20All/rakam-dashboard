'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Download, Gift, KeyRound, MapPin, MessageCircle, Monitor, Phone, Search, Trash2, UserRound, Inbox, PhoneCall, CheckCircle2, XCircle } from 'lucide-react';
import { StatusBadge, EmptyState, PageHeader, CopyButton, Avatar } from '@/components/ui';
import { useRunAction } from '@/components/Toaster';
import ConfirmDialog from '@/components/ConfirmDialog';
import { relTime, dateTime, waNumber } from '@/lib/format';
import { setRegistrationStatus, setRegistrationNote, deleteRegistration } from '../actions';

const FILTERS = [
  ['new', 'New', Inbox],
  ['contacted', 'Contacted', PhoneCall],
  ['converted', 'Customers', CheckCircle2],
  ['declined', 'Declined', XCircle],
  ['all', 'All', ClipboardList],
];
const TOOLS = { notebook: 'Notebook', excel: 'Excel', software: 'Other software', nothing: 'Nothing yet' };
const LANG = { fr: 'French', ar: 'Arabic', en: 'English' };

/** Place in the line (1 = first sign-up), used for the free offer */
function withPositions(rows) {
  const order = [...rows].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const pos = new Map(order.map((r, i) => [r.id, i + 1]));
  return rows.map((r) => ({ ...r, position: pos.get(r.id) }));
}

export default function RegistrationsClient({ registrations, freeSpots }) {
  const run = useRunAction();
  const [filter, setFilter] = useState('new');
  const [query, setQuery] = useState('');
  const [wilaya, setWilaya] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const all = useMemo(() => withPositions(registrations), [registrations]);
  const statusOf = (r) => r.status || 'new';
  const wilayas = useMemo(() => [...new Map(all.map((r) => [r.wilaya_code, r.wilaya_name])).entries()].sort((a, b) => a[0] - b[0]), [all]);
  const count = (k) => all.filter((r) => k === 'all' || statusOf(r) === k).length;
  const q = query.trim().toLowerCase();
  const rows = all.filter((r) =>
    (filter === 'all' || statusOf(r) === filter) &&
    (wilaya === 'All' || String(r.wilaya_code) === wilaya) &&
    (!q || [r.shop_name, r.owner_name, r.phone, r.email, r.wilaya_name, r.commune_name, r.address].some((v) => String(v || '').toLowerCase().includes(q))));

  const free = Math.min(all.length, freeSpots);

  function exportCsv() {
    const head = ['#', 'Date', 'Shop', 'Owner', 'Phone', 'Email', 'Wilaya', 'Commune', 'Address', 'PCs', 'Manages with', 'Message', 'Status', 'Note'];
    const lines = rows.map((r) => [r.position, r.created_at, r.shop_name, r.owner_name, r.phone, r.email, `${r.wilaya_code} ${r.wilaya_name}`, r.commune_name, r.address, r.pcs, TOOLS[r.current_tool] || '', r.message, statusOf(r), r.admin_note]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob(['﻿' + [head.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `warshati-signups-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <PageHeader title="Sign-ups" subtitle={`From the Register & pre-order page · ${free} of ${freeSpots} free spots taken`}>
        <button onClick={exportCsv} className="btn btn-ghost" disabled={!rows.length}><Download className="size-4" /> Export</button>
        <a href="/register" target="_blank" className="btn btn-ghost">Open the form</a>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([k, label, Icon]) => (
          <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>
            <Icon className="size-3.5" /> {label} <span className="tnum opacity-70">{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input className="input pl-10" placeholder="Search shop, name, phone, commune…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="input md:w-56" value={wilaya} onChange={(e) => setWilaya(e.target.value)} aria-label="Wilaya">
          <option value="All">All wilayas</option>
          {wilayas.map(([code, name]) => <option key={code} value={String(code)}>{String(code).padStart(2, '0')} · {name}</option>)}
        </select>
      </div>

      <div className="card divide-y divide-line overflow-hidden">
        {rows.length === 0 && (
          <EmptyState icon={ClipboardList} title={all.length ? 'Nothing here' : 'No sign-ups yet'}>
            {all.length ? 'Try another filter.' : <>Share <code className="font-mono text-xs">/register</code> with shops. If you just set this up, run <code className="font-mono text-xs">supabase/registrations.sql</code> in Supabase.</>}
          </EmptyState>
        )}
        {rows.map((r) => {
          const isOpen = openId === r.id;
          return (
            <article key={r.id} className={isOpen ? 'bg-raised/40' : ''}>
              <button onClick={() => setOpenId(isOpen ? null : r.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-raised/50 transition-colors">
                <Avatar name={r.shop_name} muted={statusOf(r) === 'declined'} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${statusOf(r) === 'new' ? 'font-semibold' : 'font-medium'}`}>{r.shop_name}</p>
                  <p className="truncate text-xs text-faint">#{r.position} · {r.owner_name} · {r.commune_name}, {r.wilaya_name} · {relTime(r.created_at)}</p>
                </div>
                {r.position <= freeSpots && <span className="hidden items-center gap-1 rounded-full bg-flux-soft px-2 py-0.5 text-[11px] font-semibold text-flux-soft-foreground sm:inline-flex"><Gift className="size-3" /> Free</span>}
                <StatusBadge state={statusOf(r)} />
              </button>
              {isOpen && <Detail r={r} run={run} statusOf={statusOf} freeSpots={freeSpots} onDelete={() => setToDelete(r)} />}
            </article>
          );
        })}
      </div>
      {rows.length > 0 && <p className="mt-3 text-xs text-faint">Showing {rows.length} of {all.length}</p>}

      <ConfirmDialog
        open={!!toDelete} danger confirmLabel="Delete"
        title="Delete this sign-up?" body="It will be removed for good. The shops after it move up one place in the line."
        onConfirm={() => run(() => deleteRegistration(toDelete.id))}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}

function Detail({ r, run, statusOf, freeSpots, onDelete }) {
  const [note, setNote] = useState(r.admin_note || '');
  const status = statusOf(r);
  const wa = waNumber(r.phone);
  const hello = `Bonjour ${r.owner_name}, c'est Warshati. Merci pour votre inscription (${r.shop_name}) !`;
  const createHref = `/dashboard/new?${new URLSearchParams({
    reg: r.id,
    name: r.shop_name,
    phone: r.phone,
    address: [r.address, r.commune_name, r.wilaya_name].filter(Boolean).join(', '),
    notes: [`Sign-up #${r.position}${r.position <= freeSpots ? ' (free offer)' : ''} · owner: ${r.owner_name}`, r.email && `Email: ${r.email}`, r.message].filter(Boolean).join('\n'),
    count: String(r.pcs || 1),
  })}`;

  return (
    <div className="space-y-4 px-5 pb-5 sm:pl-[68px]">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <Item icon={UserRound} label="Owner">{r.owner_name}</Item>
        <Item icon={Phone} label="Phone"><span className="font-mono">{r.phone}</span></Item>
        <Item icon={MapPin} label="Place">{r.commune_name}, {String(r.wilaya_code).padStart(2, '0')} {r.wilaya_name}{r.address ? ` · ${r.address}` : ''}</Item>
        <Item icon={Monitor} label="PCs">{r.pcs}</Item>
        <Item icon={ClipboardList} label="Manages with">{TOOLS[r.current_tool] || '—'}</Item>
        <Item icon={Gift} label="Place in line">#{r.position} {r.position <= freeSpots ? '· free offer' : '· pre-order'}</Item>
        {r.email && <Item icon={MessageCircle} label="Email">{r.email}</Item>}
        <Item icon={ClipboardList} label="Signed up">{dateTime(r.created_at)}{r.lang ? ` · ${LANG[r.lang] || r.lang}` : ''}</Item>
      </dl>
      {r.message && <p className="rounded-md bg-muted px-3.5 py-2.5 text-sm whitespace-pre-wrap" dir="auto">{r.message}</p>}

      <div>
        <label className="label">Private note</label>
        <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Called on…, wants a demo on…" />
      </div>

      <div className="flex flex-wrap gap-2">
        {note !== (r.admin_note || '') && <button className="btn btn-primary btn-sm" onClick={() => run(() => setRegistrationNote(r.id, note))}>Save note</button>}
        {status !== 'converted' && <Link href={createHref} className="btn btn-primary btn-sm"><KeyRound className="size-3.5" /> Create license</Link>}
        {r.customer_id && <Link href={`/dashboard/customer/${r.customer_id}`} className="btn btn-ghost btn-sm">Open customer</Link>}
        <a href={`tel:${r.phone}`} className="btn btn-ghost btn-sm"><Phone className="size-3.5" /> Call</a>
        {wa && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(hello)}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm text-whatsapp"><MessageCircle className="size-3.5" /> WhatsApp</a>}
        <CopyButton text={r.phone} label="Copy phone" className="btn btn-ghost btn-sm" />
        <div className="flex-1" />
        <select className="input h-8 w-auto py-0 text-sm" value={status} onChange={(e) => run(() => setRegistrationStatus(r.id, e.target.value), 'Status changed')} aria-label="Status">
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Customer</option>
          <option value="declined">Declined</option>
        </select>
        <button className="icon-btn hover:text-destructive" onClick={onDelete} aria-label="Delete"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
}

function Item({ icon: Icon, label, children }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-xs text-faint"><Icon className="size-3" />{label}</dt>
      <dd className="mt-0.5 font-medium break-words">{children}</dd>
    </div>
  );
}
