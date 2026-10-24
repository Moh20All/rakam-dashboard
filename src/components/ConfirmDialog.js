'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Confirmation dialog. `typeToConfirm` makes the user type a word first (for deletes).
 * onConfirm may be async; the dialog stays open with a spinner until it finishes.
 */
export default function ConfirmDialog({ open, title, body, confirmLabel = 'Confirm', danger, typeToConfirm, onConfirm, onClose }) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { setTyped(''); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open]);

  const blocked = typeToConfirm && typed.trim().toLowerCase() !== typeToConfirm.toLowerCase();

  async function confirm() {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
    onClose();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current && !busy) onClose(); }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-line bg-card p-0 text-ink shadow-dialog backdrop:bg-overlay"
    >
      <div className="p-6" style={{ animation: 'pop-in .15s ease-out' }}>
        <h2 className="text-lg font-bold">{title}</h2>
        {body && <div className="mt-2 text-sm text-mute leading-relaxed">{body}</div>}
        {typeToConfirm && (
          <div className="mt-4">
            <label className="label">Type <b className="text-ink">{typeToConfirm}</b> to confirm</label>
            <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={confirm} disabled={busy || blocked}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
