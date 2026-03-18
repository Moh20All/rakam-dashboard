import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import LicenseToggleBtn from '../../LicenseToggleBtn';
import ResetMachineBtn from './ResetMachineBtn';
import { updateCustomerDetails } from './actions';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailsPage({ params }) {
  const { id } = await params;

  const { data: customer, error } = await supabase
    .from('customers')
    .select(`*, licenses (*)`)
    .eq('id', id)
    .single();

  if (error || !customer) {
    return (
      <div className="p-8">
        <h2 className="text-xl text-red-600 mb-4">Customer not found</h2>
        <Link href="/dashboard" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const updateCustomerWithId = updateCustomerDetails.bind(null, id);
  const lic = customer.licenses?.[0]; // Primary license

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Breadcrumbs & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">home</span> Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-primary font-semibold">{customer.name}</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-bold text-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-accent/20 bg-slate-100 flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-5xl text-slate-400">person</span>
            </div>
            {lic?.is_active && <div className="absolute bottom-0 right-0 size-6 bg-green-500 border-2 border-white rounded-full"></div>}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-slate-500">Customer ID: <span className="font-mono text-primary">#{id.slice(0, 8).toUpperCase()}</span></p>
            <div className="flex flex-wrap gap-2 mt-3">
              {lic?.is_active ? (
                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Active Member</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">Revoked</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Information */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-primary px-6 py-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">person</span>
                Customer Info
              </h3>
            </div>
            <form action={updateCustomerWithId} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label>
                <input name="name" type="text" defaultValue={customer.name} required className="w-full mt-1 rounded-lg border-slate-300 bg-slate-50 focus:ring-accent focus:border-accent text-slate-900 p-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                <input name="phone" type="tel" defaultValue={customer.phone || ''} className="w-full mt-1 rounded-lg border-slate-300 bg-slate-50 focus:ring-accent focus:border-accent text-slate-900 p-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
                <input name="address" type="text" defaultValue={customer.address || ''} className="w-full mt-1 rounded-lg border-slate-300 bg-slate-50 focus:ring-accent focus:border-accent text-slate-900 p-2.5 text-sm outline-none" />
              </div>
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Notes</label>
                <textarea name="notes" rows="3" defaultValue={customer.notes || ''} className="w-full mt-1 rounded-lg border-slate-300 bg-slate-50 focus:ring-accent focus:border-accent text-slate-900 p-2.5 text-sm resize-none outline-none" />
              </div>
              <button type="submit" className="w-full flex items-center gap-2 justify-center px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all shadow-md font-bold text-sm">
                <span className="material-symbols-outlined text-lg">edit</span>
                Save Changes
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: License Information */}
        <div className="lg:col-span-2 space-y-6">
          {lic ? (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-primary px-6 py-3 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">key</span>
                  License Management
                </h3>
                <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/30 uppercase">System Online</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">License Key</label>
                    <code className="text-primary font-bold text-lg">{lic.key}</code>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${lic.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className={`font-bold uppercase text-sm ${lic.is_active ? 'text-green-600' : 'text-red-600'}`}>{lic.is_active ? 'Active' : 'Revoked'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">computer</span>
                      <span className="text-slate-500 text-sm font-medium">Machine ID</span>
                    </div>
                    <span className="text-slate-900 font-mono text-sm">{lic.machine_id || <span className="text-slate-400 italic">Unbound</span>}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">calendar_today</span>
                      <span className="text-slate-500 text-sm font-medium">Activation Date</span>
                    </div>
                    <span className="text-slate-900 text-sm font-medium">
                      {lic.activated_at ? new Date(lic.activated_at).toLocaleString() : <span className="text-slate-400 italic">Not activated</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">history</span>
                      <span className="text-slate-500 text-sm font-medium">Created</span>
                    </div>
                    <span className="text-slate-900 text-sm font-medium">{new Date(lic.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <LicenseToggleBtn licenseId={lic.id} isActive={lic.is_active} />
                  </div>
                </div>

                {/* Reset Machine Binding — Task 1 */}
                {lic.machine_id && (
                  <div className="mt-4">
                    <ResetMachineBtn licenseId={lic.id} />
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div className="text-center p-8 bg-white rounded-xl border border-dashed border-slate-300">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">key_off</span>
              <p className="text-slate-500 text-sm">No licenses assigned to this customer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
