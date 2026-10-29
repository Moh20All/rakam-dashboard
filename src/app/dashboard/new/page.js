'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ClipboardList, Loader2, Minus, Plus, Sparkles, UserRound } from 'lucide-react';
import { createCustomerWithLicenses } from '../actions';
import { CopyButton, WhatsAppKeyButton } from '@/components/ui';
import { useRunAction } from '@/components/Toaster';
import { licenseMessage } from '@/lib/format';

export default function NewLicensePage() {
  const run = useRunAction();
  // Opened from Sign-ups > Create license: the form comes filled in (?reg=…&name=…)
  const params = useSearchParams();
  const pre = (k) => params.get(k) || '';
  const fromSignup = pre('reg');
  const [pending, setPending] = useState(false);
  const [count, setCount] = useState(Math.min(10, Math.max(1, Number(pre('count')) || 1)));
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
        {fromSignup && (
          <div className="flex items-center gap-2 rounded-md bg-primary-soft px-4 py-3 text-sm text-primary-soft-foreground">
            <ClipboardList className="size-4" /> Filled in from a sign-up. It will be marked as a customer once the key is created.
            <input type="hidden" name="registration_id" value={fromSignup} />
          </div>
        )}
        <section className="card p-6">
          <h2 className="mb-5 flex items-center gap-2 font-semibold"><UserRound className="size-4 text-primary" /> Shop</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="name">Shop or owner name *</label>
              <input id="name" name="name" required maxLength={120} className="input" placeholder="e.g. Atelier Phone Bab Ezzouar" autoFocus defaultValue={pre('name')} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone (WhatsApp)</label>
              <input id="phone" name="phone" type="tel" className="input" placeholder="0555 12 34 56" defaultValue={pre('phone')} />
            </div>
            <div>
              <label className="label" htmlFor="address">City / address</label>
              <input id="address" name="address" className="input" placeholder="Alger, Bab Ezzouar" defaultValue={pre('address')} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">Private notes</label>
              <textarea id="notes" name="notes" rows={3} className="input" placeholder="How they found you, what they asked for…" defaultValue={pre('notes')} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-5 flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-primary" /> License</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className="label">Number of PCs</span>
              <div className="flex h-10 items-center rounded-md border border-line">
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
          <button type="submit" disabled={pending} className="btn btn-flux min-w-44">
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
        <div className="flex items-center gap-3.5 bg-inverse px-6 py-5 text-inverse-foreground">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-flux text-flux-foreground"><CheckCircle2 className="size-6" /></span>
          <div>
            <h1 className="text-xl font-bold">{result.keys.length > 1 ? `${result.keys.length} keys are ready` : 'The key is ready'}</h1>
            <p className="text-sm text-inverse-foreground/80">for {result.name}</p>
          </div>
        </div>
        <div className="space-y-3 p-6">
          {result.keys.map((k) => (
            <div key={k} className="flex min-h-11 items-center gap-3 rounded-sm border-2 border-dashed border-flux-soft-foreground bg-flux-soft ps-3.5 pe-1 text-flux-soft-foreground">
              <code className="flex-1 font-mono text-base font-semibold tracking-[.04em] break-all">{k}</code>
              <CopyButton text={k} />
            </div>
          ))}

          <details className="rounded-md border border-line bg-muted">
            <summary className="cursor-pointer px-3.5 py-2.5 text-[13px] font-medium">Message preview</summary>
            <pre className="whitespace-pre-wrap border-t border-line px-3.5 py-2.5 font-sans text-[13px] leading-5" dir="auto">{message}</pre>
          </details>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
            <WhatsAppKeyButton phone={result.phone} name={result.name} keys={result.keys} label="Send on WhatsApp" className="btn btn-whatsapp" />
            <CopyButton text={message} label="Copy message" className="btn btn-ghost" />
            <div className="hidden flex-1 sm:block" />
            <button onClick={onAnother} className="btn btn-ghost">Create another</button>
            <Link href={`/dashboard/customer/${result.customerId}`} className="btn btn-primary">Open customer</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
