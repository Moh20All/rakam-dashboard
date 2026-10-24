'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ban, Cpu, KeyRound, Loader2, MapPin, Phone, Plus, RotateCcw, Save, Trash2, Unlink, CalendarDays, Activity, Pencil } from 'lucide-react';
import { CopyButton, WhatsAppKeyButton, StatusBadge, Avatar } from '@/components/ui';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useRunAction } from '@/components/Toaster';
import { licenseState, isQuiet, relTime, shortDate, dateTime, money, waNumber } from '@/lib/format';
import { updateCustomer, deleteCustomer, addLicenses, setLicenseActive, resetMachine, deleteLicense, updateLicenseNote } from '../../actions';

export default function CustomerClient({ customer }) {
  const router = useRouter();
  const run = useRunAction();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [adding, setAdding] = useState(false);

  const licenses = customer.licenses;
  const allKeys = licenses.filter((l) => l.is_active).map((l) => l.key);
  const total = licenses.reduce((s, l) => s + (Number(l.price) || 0), 0);
  const lastSeen = licenses.map((l) => l.last_seen_at).filter(Boolean).sort().pop();

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const res = await run(() => updateCustomer(customer.id, new FormData(e.currentTarget)));
    setSaving(false);
    if (res) setDirty(false);
  }

  async function addKey() {
    setAdding(true);
    await run(() => addLicenses(customer.id, 1, licenses.at(-1)?.price ?? null));
    setAdding(false);
  }

  return (
    <>
      <Link href="/dashboard/licenses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink"><ArrowLeft className="size-4" /> Licenses</Link>

      {/* Header */}
      <div className="card mb-6 flex flex-wrap items-center gap-4 p-5">
        <Avatar name={customer.name} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight">{customer.name}</h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mute">
            {customer.phone && <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" />{customer.phone}</span>}
            {customer.address && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{customer.address}</span>}
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />Customer since {shortDate(customer.created_at || licenses[0]?.created_at)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {waNumber(customer.phone) && allKeys.length > 0 && (
            <WhatsAppKeyButton phone={customer.phone} name={customer.name} keys={allKeys} label="Send keys" className="btn btn-ghost" />
          )}
          {customer.phone && <a href={`tel:${customer.phone}`} className="btn btn-ghost"><Phone className="size-4" /> Call</a>}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Mini label="Keys" value={licenses.length} />
        <Mini label="Activated" value={licenses.filter((l) => licenseState(l) === 'active').length} />
        <Mini label="Paid" value={money(total)} />
        <Mini label="Last seen" value={lastSeen ? relTime(lastSeen) : '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Licenses */}
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Licenses</h2>
            <button className="btn btn-ghost btn-sm" onClick={addKey} disabled={adding}>
              {adding ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Add a key
            </button>
          </div>
          {licenses.length === 0 && (
            <div className="card p-10 text-center text-sm text-mute"><KeyRound className="mx-auto mb-2 size-6 text-faint" />No key for this customer.</div>
          )}
          {licenses.map((l) => (
            <LicenseCard key={l.id} l={l} customer={customer} run={run} setConfirm={setConfirm} />
          ))}
        </section>

        {/* Details form */}
        <section className="card h-fit p-5">
          <h2 className="mb-4 font-semibold">Details</h2>
          <form onSubmit={save} onChange={() => setDirty(true)} className="space-y-4">
            <div><label className="label" htmlFor="c-name">Name</label><input id="c-name" name="name" required defaultValue={customer.name} className="input" /></div>
            <div><label className="label" htmlFor="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" defaultValue={customer.phone || ''} className="input" /></div>
            <div><label className="label" htmlFor="c-address">City / address</label><input id="c-address" name="address" defaultValue={customer.address || ''} className="input" /></div>
            <div><label className="label" htmlFor="c-notes">Private notes</label><textarea id="c-notes" name="notes" rows={4} defaultValue={customer.notes || ''} className="input" /></div>
            <button type="submit" disabled={saving || !dirty} className="btn btn-primary w-full">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} {dirty ? 'Save changes' : 'Saved'}
            </button>
          </form>
          <div className="mt-6 border-t border-line pt-4">
            <button className="btn btn-ghost btn-sm w-full text-destructive" onClick={() => setConfirm({ kind: 'deleteCustomer' })}>
              <Trash2 className="size-3.5" /> Delete customer
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirm?.kind === 'revoke'} danger confirmLabel="Revoke"
        title="Revoke this license?"
        body="The app will lock on its next license check. You can reactivate the key later."
        onConfirm={() => run(() => setLicenseActive(confirm.l.id, false))}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'reset'} confirmLabel="Unlink PC"
        title="Unlink this PC?"
        body="Use this when the shop changed or reinstalled its computer. The key can then be activated on another PC, and the old PC will lock on its next check."
        onConfirm={() => run(() => resetMachine(confirm.l.id))}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'deleteLicense'} danger confirmLabel="Delete key" typeToConfirm="delete"
        title="Delete this key for good?"
        body={<>Key <code className="font-mono">{confirm?.l?.key}</code> will disappear and the app using it will lock. To pause a shop, <b>revoke</b> instead.</>}
        onConfirm={() => run(() => deleteLicense(confirm.l.id))}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'deleteCustomer'} danger confirmLabel="Delete customer" typeToConfirm="delete"
        title={`Delete ${customer.name}?`}
        body={`This deletes the customer and ${licenses.length} key${licenses.length === 1 ? '' : 's'}. Their app will lock. This cannot be undone.`}
        onConfirm={async () => { const r = await run(() => deleteCustomer(customer.id), 'Customer deleted'); if (r) router.push('/dashboard/licenses'); }}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

function LicenseCard({ l, customer, run, setConfirm }) {
  const state = licenseState(l);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(l.note || '');
  const [price, setPrice] = useState(l.price ?? '');

  async function saveNote() {
    const r = await run(() => updateLicenseNote(l.id, note, price));
    if (r) setEditing(false);
  }

  return (
    <div className={`card p-5 ${state === 'revoked' ? 'opacity-75' : ''}`}>
      <div className="flex flex-wrap items-center gap-3">
        <code className={`font-mono text-[15px] font-semibold tracking-wide ${state === 'revoked' ? 'line-through text-faint' : ''}`}>{l.key}</code>
        <CopyButton text={l.key} />
        <WhatsAppKeyButton phone={customer.phone} name={customer.name} keys={[l.key]} />
        <div className="flex-1" />
        <StatusBadge state={isQuiet(l) ? 'quiet' : state} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
        <Field icon={CalendarDays} label="Created">{shortDate(l.created_at)}</Field>
        <Field icon={Activity} label="Activated">{l.activated_at ? shortDate(l.activated_at) : '—'}</Field>
        <Field icon={Activity} label="Last seen">
          {l.last_seen_at ? <span title={dateTime(l.last_seen_at)}>{relTime(l.last_seen_at)}{l.last_version && <span className="ml-1 font-mono text-xs text-faint">v{l.last_version}</span>}</span> : '—'}
        </Field>
        <Field icon={Cpu} label="PC">
          {l.machine_id ? <span className="font-mono text-xs" title={l.machine_id}>{l.machine_id.slice(0, 10)}…</span> : <span className="text-faint">Not linked</span>}
        </Field>
      </dl>

      {editing ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_9rem_auto]">
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (e.g. Counter PC)" />
          <input className="input tnum" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price DA" inputMode="numeric" />
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={saveNote}>Save</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="mt-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink">
          <Pencil className="size-3.5" />
          {l.note || l.price != null ? <>{l.note}{l.note && l.price != null ? ' · ' : ''}{l.price != null && money(l.price)}</> : 'Add a note or price'}
        </button>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        {l.is_active
          ? <button className="btn btn-ghost btn-sm text-destructive" onClick={() => setConfirm({ kind: 'revoke', l })}><Ban className="size-3.5" /> Revoke</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => run(() => setLicenseActive(l.id, true))}><RotateCcw className="size-3.5" /> Reactivate</button>}
        {l.machine_id && <button className="btn btn-ghost btn-sm" onClick={() => setConfirm({ kind: 'reset', l })}><Unlink className="size-3.5" /> Unlink PC</button>}
        <div className="flex-1" />
        <button className="icon-btn hover:text-destructive" onClick={() => setConfirm({ kind: 'deleteLicense', l })} title="Delete key" aria-label="Delete key"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-faint"><Icon className="size-3" />{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-mute">{label}</p>
      <p className="mt-1 text-lg font-bold tnum">{value}</p>
    </div>
  );
}
