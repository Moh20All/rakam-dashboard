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
      {done ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
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
      className={className.includes('btn-whatsapp') ? className : `${className} text-whatsapp`}
      title="Send on WhatsApp" aria-label="Send on WhatsApp"
    >
      <MessageCircle className="size-4" />
      {label && <span>{label}</span>}
    </a>
  );
}

const STATE_STYLES = {
  // Design system status tokens (status.md: Admin portal statuses)
  active: ['Activated', 'bg-license-activated-bg text-license-activated-fg'],
  waiting: ['Waiting', 'bg-license-waiting-bg text-license-waiting-fg'],
  revoked: ['Revoked', 'bg-license-revoked-bg text-license-revoked-fg'],
  quiet: ['Quiet', 'bg-license-quiet-bg text-license-quiet-fg'],
  new: ['New', 'bg-feedback-new-bg text-feedback-new-fg'],
  seen: ['Seen', 'bg-feedback-seen-bg text-feedback-seen-fg'],
  done: ['Done', 'bg-feedback-done-bg text-feedback-done-fg'],
  open: ['Open', 'bg-crash-open-bg text-crash-open-fg'],
  resolved: ['Resolved', 'bg-crash-fixed-bg text-crash-fixed-fg'],
};

export function StatusBadge({ state, label }) {
  const [text, cls] = STATE_STYLES[state] || STATE_STYLES.revoked;
  return (
    <span className={`inline-flex items-center gap-[5px] h-[22px] rounded-full px-[9px] text-xs leading-4 font-semibold whitespace-nowrap ${cls}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label || text}
    </span>
  );
}

export function Avatar({ name, muted }) {
  const letters = (name || '?').trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${muted ? 'bg-muted text-muted-foreground' : 'bg-primary-soft text-primary-soft-foreground'}`}>
      {letters}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && <span className="mb-3 inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground"><Icon className="size-5" /></span>}
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
