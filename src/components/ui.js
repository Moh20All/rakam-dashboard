'use client';

import { useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { useToast } from './Toaster';
import { licenseMessage, waLink, waNumber } from '@/lib/format';

export function CopyButton({ text, label, className = 'icon-btn' }) {
  const [done, setDone] = useState(false);
  const toast = useToast();
  async function copy(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      toast('Could not copy. Select the text and copy it by hand.', 'error');
    }
  }
  return (
    <button type="button" onClick={copy} className={className} title={label || 'Copy'} aria-label={label || 'Copy'}>
      {done ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
      {label && <span>{done ? 'Copied' : label}</span>}
    </button>
  );
}

/** Opens WhatsApp with the key(s) and download link, in French and Arabic */
export function WhatsAppKeyButton({ phone, name, keys, label, className = 'icon-btn' }) {
  if (!waNumber(phone)) return null;
  return (
    <a
      href={waLink(phone, licenseMessage(name || '', keys))}
      target="_blank" rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`${className} text-emerald-600 dark:text-emerald-400`}
      title="Send on WhatsApp" aria-label="Send on WhatsApp"
    >
      <MessageCircle className="size-4" />
      {label && <span>{label}</span>}
    </a>
  );
}

const STATE_STYLES = {
  active: ['Activated', 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', 'bg-emerald-500'],
  waiting: ['Waiting', 'bg-amber-500/10 text-amber-700 dark:text-amber-400', 'bg-amber-500'],
  revoked: ['Revoked', 'bg-slate-500/10 text-slate-600 dark:text-slate-400', 'bg-slate-400'],
  quiet: ['Quiet', 'bg-orange-500/10 text-orange-700 dark:text-orange-400', 'bg-orange-500'],
  new: ['New', 'bg-sky-500/10 text-sky-700 dark:text-sky-400', 'bg-sky-500'],
  seen: ['Seen', 'bg-violet-500/10 text-violet-700 dark:text-violet-400', 'bg-violet-500'],
  done: ['Done', 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', 'bg-emerald-500'],
  open: ['Open', 'bg-red-500/10 text-red-700 dark:text-red-400', 'bg-red-500'],
  resolved: ['Resolved', 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', 'bg-emerald-500'],
};

export function StatusBadge({ state, label }) {
  const [text, cls, dot] = STATE_STYLES[state] || STATE_STYLES.revoked;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label || text}
    </span>
  );
}

export function Avatar({ name, muted }) {
  const letters = (name || '?').trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${muted ? 'bg-raised text-faint' : 'bg-gold/15 text-gold-ink'}`}>
      {letters}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-raised text-faint"><Icon className="size-6" /></span>}
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-mute">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
