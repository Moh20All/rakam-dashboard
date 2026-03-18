'use client';

import { useState } from 'react';
import { toggleLicenseStatus } from './actions';

export default function LicenseToggleBtn({ licenseId, isActive }) {
  const [isPending, setIsPending] = useState(false);

  async function handleToggle() {
    setIsPending(true);
    await toggleLicenseStatus(licenseId, isActive);
    setIsPending(false);
  }

  if (isActive) {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`text-red-600 hover:text-red-700 font-bold text-sm transition-colors flex items-center justify-end gap-1 ml-auto ${isPending ? 'opacity-50' : ''}`}
      >
        <span className="material-symbols-outlined text-sm">block</span>
        Revoke
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`text-primary hover:underline font-bold text-sm transition-colors flex items-center justify-end gap-1 ml-auto ${isPending ? 'opacity-50' : ''}`}
    >
      <span className="material-symbols-outlined text-sm">refresh</span>
      Reactivate
    </button>
  );
}
