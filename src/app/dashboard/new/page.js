'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Minus, Plus, Sparkles, UserRound } from 'lucide-react';
import { createCustomerWithLicenses } from '../actions';
import { CopyButton, WhatsAppKeyButton } from '@/components/ui';
import { useRunAction } from '@/components/Toaster';
import { licenseMessage } from '@/lib/format';

export default function NewLicensePage() {
  const run = useRunAction();
  const [pending, setPending] = useState(false);
  const [count, setCount] = useState(1);
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set('count', String(count));
    setPending(true);
    const res = await run(() => createCustomerWithLicenses(fd));
    setPending(false);
    if (res?.ok) setResult({ ...res, name: fd.get('name'), phone: fd.get('phone') });
  }

  if (result) return <Success result={result} onAnother={() => { setResult(null); setCount(1); }} />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/licenses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink"><ArrowLeft className="size-4" /> Licenses</Link>
      <h1 className="text-2xl font-bold tracking-tight">New license</h1>
      <p className="mt-1 text-sm text-mute">Add the shop, then send the key on WhatsApp in one click.</p>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <section className="card p-6">
          <h2 className="mb-5 flex items-center gap-2 font-semibold"><UserRound className="size-4 text-gold-ink" /> Shop</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="name">Shop or owner name *</label>
              <input id="name" name="name" required maxLength={120} className="input" placeholder="e.g. Atelier Phone Bab Ezzouar" autoFocus />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone (WhatsApp)</label>
              <input id="phone" name="phone" type="tel" className="input" placeholder="0555 12 34 56" />
            </div>
            <div>
              <label className="label" htmlFor="address">City / address</label>
              <input id="address" name="address" className="input" placeholder="Alger, Bab Ezzouar" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">Private notes</label>
              <textarea id="notes" name="notes" rows={3} className="input" placeholder="How they found you, what they asked for…" />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-5 flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-gold-ink" /> License</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className="label">Number of PCs</span>
              <div className="flex h-10 items-center rounded-xl border border-line">
                <button type="button" className="icon-btn ml-1" onClick={() => setCount(Math.max(1, count - 1))} aria-label="Fewer"><Minus className="size-4" /></button>
                <span className="flex-1 text-center font-semibold tnum">{count}</span>
                <button type="button" className="icon-btn mr-1" onClick={() => setCount(Math.min(10, count + 1))} aria-label="More"><Plus className="size-4" /></button>
              </div>
              <p className="mt-1.5 text-xs text-faint">One key per computer.</p>
            </div>
            <div>
              <label className="label" htmlFor="price">Price paid per key (DA)</label>
              <input id="price" name="price" inputMode="numeric" className="input tnum" placeholder="15 000" />
            </div>
            <div>
              <label className="label" htmlFor="license_note">Key note</label>
              <input id="license_note" name="license_note" className="input" placeholder="e.g. Counter PC" />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <Link href="/dashboard/licenses" className="btn btn-ghost">Cancel</Link>
          <button type="submit" disabled={pending} className="btn btn-gold min-w-44">
            {pending ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : `Create ${count > 1 ? `${count} keys` : 'key'}`}
          </button>
        </div>
      </form>
    </div>
  );
}

function Success({ result, onAnother }) {
  const message = licenseMessage(result.name, result.keys);
  return (
    <div className="mx-auto max-w-2xl" style={{ animation: 'pop-in .25s ease-out' }}>
      <div className="card overflow-hidden">
        <div className="bg-navy px-6 py-8 text-center text-white">
          <CheckCircle2 className="mx-auto size-12 text-gold-hi" />
          <h1 className="mt-3 text-xl font-bold">{result.keys.length > 1 ? `${result.keys.length} keys are ready` : 'The key is ready'}</h1>
          <p className="mt-1 text-sm text-white/60">for {result.name}</p>
        </div>
        <div className="space-y-3 p-6">
          {result.keys.map((k) => (
            <div key={k} className="flex items-center gap-3 rounded-xl border border-dashed border-gold/50 bg-gold/5 px-4 py-3">
              <code className="flex-1 font-mono text-lg font-semibold tracking-wide break-all">{k}</code>
              <CopyButton text={k} />
            </div>
          ))}

          <details className="rounded-xl border border-line">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-mute">Message preview</summary>
            <pre className="whitespace-pre-wrap border-t border-line px-4 py-3 font-sans text-sm text-mute" dir="auto">{message}</pre>
          </details>

          <div className="flex flex-wrap gap-2 pt-2">
            <WhatsAppKeyButton phone={result.phone} name={result.name} keys={result.keys} label="Send on WhatsApp" className="btn btn-ghost" />
            <CopyButton text={message} label="Copy message" className="btn btn-ghost" />
            <div className="flex-1" />
            <button onClick={onAnother} className="btn btn-ghost">Create another</button>
            <Link href={`/dashboard/customer/${result.customerId}`} className="btn btn-gold">Open customer</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
