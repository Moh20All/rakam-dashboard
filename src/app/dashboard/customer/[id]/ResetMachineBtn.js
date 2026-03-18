'use client';

import { useState } from 'react';
import { resetMachineBinding } from './actions';

export default function ResetMachineBtn({ licenseId }) {
  const [isPending, setIsPending] = useState(false);
  const [showResult, setShowResult] = useState('');

  async function handleReset() {
    const confirmed = window.confirm(
      'Are you sure? This will allow the key to be activated on a new machine.'
    );
    if (!confirmed) return;

    setIsPending(true);
    const result = await resetMachineBinding(licenseId);
    if (result?.error) {
      setShowResult('error');
    } else {
      setShowResult('success');
    }
    setIsPending(false);
    setTimeout(() => setShowResult(''), 4000);
  }

  return (
    <div>
      <button
        onClick={handleReset}
        disabled={isPending}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all font-bold text-sm ${isPending ? 'opacity-50' : ''}`}
      >
        <span className="material-symbols-outlined text-lg">device_reset</span>
        {isPending ? 'Resetting...' : 'Reset Machine Binding'}
      </button>
      {showResult === 'success' && (
        <p className="text-green-600 text-xs font-semibold mt-2">✓ Machine reset. Customer can now activate on a new device.</p>
      )}
      {showResult === 'error' && (
        <p className="text-red-600 text-xs font-semibold mt-2">✗ Failed to reset. Try again.</p>
      )}
    </div>
  );
}
