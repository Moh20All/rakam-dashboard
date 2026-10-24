'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, KeyRound, Plus, MoreHorizontal, Ban, RotateCcw, Unlink, Download } from 'lucide-react';
import { CopyButton, WhatsAppKeyButton, StatusBadge, Avatar, EmptyState, PageHeader } from '@/components/ui';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useRunAction } from '@/components/Toaster';
import { licenseState, isQuiet, relTime, shortDate, money } from '@/lib/format';
import { setLicenseActive, resetMachine } from '../actions';

const FILTERS = [
  ['all', 'All'],
  ['active', 'Activated'],
  ['waiting', 'Waiting'],
  ['quiet', 'Quiet'],
  ['revoked', 'Revoked'],
];

const SORTS = {
  newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  seen: (a, b) => new Date(b.last_seen_at || 0) - new Date(a.last_seen_at || 0),
  name: (a, b) => (a.customers?.name || '').localeCompare(b.customers?.name || ''),
};

export default function LicensesClient({ licenses, initialState, initialQuery }) {
  const router = useRouter();
  const run = useRunAction();
  const [filter, setFilter] = useState(FILTERS.some(([k]) => k === initialState) ? initialState : 'all');
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState('newest');
  const [confirm, setConfirm] = useState(null);

  const matches = (l, f) => (f === 'all' ? true : f === 'quiet' ? isQuiet(l) : licenseState(l) === f);
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(([k]) => [k, licenses.filter((l) => matches(l, k)).length])), [licenses]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return licenses
      .filter((l) => matches(l, filter))
      .filter((l) => !q || [l.key, l.customers?.name, l.customers?.phone, l.customers?.address, l.note, l.machine_id]
        .some((v) => String(v || '').toLowerCase().includes(q)))
      .sort(SORTS[sort]);
  }, [licenses, filter, query, sort]);

  function exportCsv() {
    const head = ['Customer', 'Phone', 'Key', 'Status', 'Created', 'Activated', 'Last seen', 'Version', 'Price', 'Note'];
    const lines = rows.map((l) => [l.customers?.name, l.customers?.phone, l.key, licenseState(l), l.created_at, l.activated_at, l.last_seen_at, l.last_version, l.price, l.note]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob(['﻿' + [head.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `warshati-licenses-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <PageHeader title="Licenses" subtitle={`${licenses.length} keys for ${new Set(licenses.map((l) => l.customer_id)).size} shops`}>
        <button onClick={exportCsv} className="btn btn-ghost" disabled={!rows.length}><Download className="size-4" /> Export</button>
        <Link href="/dashboard/new" className="btn btn-gold"><Plus className="size-4" /> New license</Link>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input className="input pl-10" placeholder="Search name, phone, key, note…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
        </div>
        <select className="input md:w-44" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="seen">Last seen</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([k, label]) => (
          <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>
            {label} <span className="tnum opacity-70">{counts[k]}</span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={KeyRound} title={licenses.length ? 'No match' : 'No licenses yet'}>
            {licenses.length ? 'Try another search or filter.' : <Link className="text-gold-ink font-semibold" href="/dashboard/new">Create the first one →</Link>}
          </EmptyState>
        ) : (<>
          {/* Phones: one card per key */}
          <ul className="divide-y divide-line md:hidden">
            {rows.map((l) => {
              const state = licenseState(l);
              return (
                <li key={l.id}>
                  <div role="link" tabIndex={0} onClick={() => router.push(`/dashboard/customer/${l.customer_id}`)} className="block cursor-pointer p-4 active:bg-raised">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.customers?.name} muted={state === 'revoked'} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{l.customers?.name || 'Unknown'}</p>
                        <p className="truncate text-xs text-faint">{l.last_seen_at ? `Seen ${relTime(l.last_seen_at)}` : l.customers?.phone || shortDate(l.created_at)}</p>
                      </div>
                      <StatusBadge state={isQuiet(l) ? 'quiet' : state} />
                    </div>
                    <div className="mt-3 flex items-center gap-1 rounded-lg bg-raised px-3 py-1.5">
                      <code className={`flex-1 truncate font-mono text-xs ${state === 'revoked' ? 'text-faint line-through' : ''}`}>{l.key}</code>
                      <CopyButton text={l.key} />
                      <WhatsAppKeyButton phone={l.customers?.phone} name={l.customers?.name} keys={[l.key]} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="border-b border-line bg-raised/50">
                <tr>
                  <th className="th">Customer</th>
                  <th className="th">Key</th>
                  <th className="th">Status</th>
                  <th className="th">Last seen</th>
                  <th className="th">Price</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((l) => {
                  const state = licenseState(l);
                  const quiet = isQuiet(l);
                  return (
                    <tr key={l.id} className="group cursor-pointer hover:bg-raised/50 transition-colors" onClick={() => router.push(`/dashboard/customer/${l.customer_id}`)}>
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <Avatar name={l.customers?.name} muted={state === 'revoked'} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{l.customers?.name || 'Unknown'}</p>
                            <p className="truncate text-xs text-faint">{l.customers?.phone || l.note || shortDate(l.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="td">
                        <div className="flex items-center gap-1">
                          <code className={`font-mono text-[13px] ${state === 'revoked' ? 'text-faint line-through' : ''}`}>{l.key}</code>
                          <CopyButton text={l.key} />
                        </div>
                      </td>
                      <td className="td"><StatusBadge state={quiet ? 'quiet' : state} /></td>
                      <td className="td text-mute whitespace-nowrap">
                        {l.last_seen_at ? <>{relTime(l.last_seen_at)}{l.last_version && <span className="ml-1.5 font-mono text-xs text-faint">v{l.last_version}</span>}</> : <span className="text-faint">—</span>}
                      </td>
                      <td className="td tnum text-mute whitespace-nowrap">{l.price != null ? money(l.price) : <span className="text-faint">—</span>}</td>
                      <td className="td" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <WhatsAppKeyButton phone={l.customers?.phone} name={l.customers?.name} keys={[l.key]} />
                          <RowMenu
                            license={l}
                            onRevoke={() => setConfirm({ kind: 'revoke', l })}
                            onReactivate={() => run(() => setLicenseActive(l.id, true))}
                            onReset={() => setConfirm({ kind: 'reset', l })}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}
        {rows.length > 0 && <p className="border-t border-line px-4 py-3 text-xs text-faint">Showing {rows.length} of {licenses.length}</p>}
      </div>

      <ConfirmDialog
        open={confirm?.kind === 'revoke'}
        title="Revoke this license?"
        body={<>The app at <b>{confirm?.l.customers?.name}</b> will lock the next time it checks its license. You can reactivate it later.</>}
        confirmLabel="Revoke" danger
        onConfirm={() => run(() => setLicenseActive(confirm.l.id, false))}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'reset'}
        title="Unlink this PC?"
        body="Use this when the shop changed or reinstalled its computer. The key can then be activated on another PC, and the old PC will lock on its next check."
        confirmLabel="Unlink PC"
        onConfirm={() => run(() => resetMachine(confirm.l.id))}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

function RowMenu({ license, onRevoke, onReactivate, onReset }) {
  const [open, setOpen] = useState(false);
  const item = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised';
  return (
    <div className="relative">
      <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="More actions" aria-expanded={open}>
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="card absolute right-0 z-20 mt-1 w-48 p-1 shadow-xl" style={{ animation: 'pop-in .12s ease-out' }} onClick={() => setOpen(false)}>
            {license.machine_id && <button className={item} onClick={onReset}><Unlink className="size-4 text-mute" /> Unlink PC</button>}
            {license.is_active
              ? <button className={`${item} text-red-600 dark:text-red-400`} onClick={onRevoke}><Ban className="size-4" /> Revoke</button>
              : <button className={item} onClick={onReactivate}><RotateCcw className="size-4 text-mute" /> Reactivate</button>}
          </div>
        </>
      )}
    </div>
  );
}
