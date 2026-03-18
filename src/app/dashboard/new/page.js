'use client';

import { useState } from 'react';
import { createCustomerAndLicense } from './actions';
import Link from 'next/link';

export default function NewLicensePage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsPending(true);
    setError('');
    const formData = new FormData(e.target);
    const result = await createCustomerAndLicense(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccessData({ key: result.key, id: result.customerId });
    }
    setIsPending(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(successData.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 uppercase tracking-wider font-semibold">
        <Link href="/dashboard" className="hover:text-accent transition-colors">Licenses</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-accent">Create New</span>
      </div>

      <div className="mb-8">
        <h1 className="text-primary text-3xl font-bold leading-tight">Create New License</h1>
        <p className="text-slate-500 mt-2">Generate a unique authorization key for a new customer account.</p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">person_add</span>
            Customer Details
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Customer Full Name</label>
              <input name="name" type="text" required className="w-full rounded-lg border-slate-300 bg-slate-50 focus:ring-accent focus:border-accent text-slate-900 p-3 outline-none" placeholder="e.g. Acme Corporation" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <input name="phone" type="tel" className="w-full rounded-lg border-slate-300 bg-slate-50 focus:ring-accent focus:border-accent text-slate-900 p-3 outline-none" placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Office Address</label>
            <input name="address" type="text" className="w-full rounded-lg border-slate-300 bg-slate-50 focus:ring-accent focus:border-accent text-slate-900 p-3 outline-none" placeholder="Street Address, City, Country" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Notes & Internal Comments</label>
            <textarea name="notes" rows="4" className="w-full rounded-lg border-slate-300 bg-slate-50 focus:ring-accent focus:border-accent text-slate-900 p-3 outline-none resize-none" placeholder="Add any special instructions or billing notes..." />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
            <Link href="/dashboard" className="px-6 py-3 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-center">
              Cancel
            </Link>
            <button type="submit" disabled={isPending} className="px-10 py-3 rounded-lg bg-primary text-accent font-bold shadow-lg hover:shadow-xl transition-all border border-primary hover:border-accent disabled:opacity-60">
              {isPending ? 'Generating...' : 'Generate License Key'}
            </button>
          </div>
        </form>
      </div>

      {/* Success State */}
      {successData && (
        <div className="mt-12 bg-white rounded-xl shadow-xl border-2 border-accent p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-40 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="size-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">License Successfully Generated</h2>
            <p className="text-slate-500 mb-8 max-w-md">The license key is now active. Share this key with the customer to activate their product.</p>
            <div className="w-full max-w-2xl bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Your Activation Key</p>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <code className="text-2xl md:text-3xl font-mono font-black text-primary tracking-tighter break-all">{successData.key}</code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-accent rounded-lg font-bold hover:bg-accent hover:text-primary transition-all shadow-md active:scale-95"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href={`/dashboard/customer/${successData.id}`} className="text-slate-500 font-medium hover:text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">person</span>
                View Customer Profile
              </Link>
              <div className="w-px h-6 bg-slate-300"></div>
              <Link href="/dashboard" className="text-slate-500 font-medium hover:text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">home</span>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
