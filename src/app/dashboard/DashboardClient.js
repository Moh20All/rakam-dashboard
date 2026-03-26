'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, AlertCircle, FileWarning, Bug, CheckCircle2, Zap, XCircle, FileText } from 'lucide-react';
import LicenseToggleBtn from './LicenseToggleBtn';

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardClient({ licenses, stats, monitoringStats }) {
  const [query, setQuery] = useState('');

  const filtered = licenses.filter(lic => {
    const q = query.toLowerCase();
    const nameMatch = lic.customers?.name?.toLowerCase().includes(q);
    const phoneMatch = lic.customers?.phone?.toLowerCase().includes(q);
    const keyMatch = lic.key.toLowerCase().includes(q);
    return nameMatch || phoneMatch || keyMatch;
  });

  return (
    <>
      {/* Page Header & Action */}
      <div className="flex flex-wrap justify-between items-end gap-4 pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight">License Dashboard</h1>
          <p className="text-slate-500 text-lg font-normal">Manage and monitor your enterprise product licenses.</p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-accent hover:bg-opacity-90 text-primary text-sm font-bold leading-normal tracking-wide transition-all shadow-lg shadow-accent/20"
        >
          <span className="material-symbols-outlined mr-2">add_circle</span>
          <span>Create New License</span>
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-4">
        <StatCard icon={BadgeCheck} iconColor="text-primary" label="Total Licenses" value={stats.total} />
        <StatCard icon={CheckCircle2} iconColor="text-green-600" label="Active" value={stats.active} />
        <StatCard icon={Zap} iconColor="text-blue-500" label="Activated" value={stats.activated} />
        <StatCard icon={XCircle} iconColor="text-red-500" label="Revoked" value={stats.revoked} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 border-b border-slate-200 mb-8">
        <StatCard icon={FileText} iconColor="text-primary" label="Total Feedback" value={monitoringStats?.totalFeedback || 0} />
        <StatCard icon={Bug} iconColor="text-orange-500" label="Open Bugs" value={monitoringStats?.openBugs || 0} />
        <StatCard icon={FileWarning} iconColor="text-red-500" label="Total Crashes" value={monitoringStats?.totalCrashes || 0} />
        <StatCard icon={AlertCircle} iconColor="text-rose-600" label="Unresolved Crashes" value={monitoringStats?.unresolvedCrashes || 0} />
      </div>

      {/* Search Bar */}
      <div className="pb-6">
        <label className="flex flex-col w-full">
          <div className="flex w-full items-stretch rounded-xl h-14 bg-white border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-accent/30 transition-all">
            <div className="text-slate-400 flex items-center justify-center pl-4">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="flex w-full border-none bg-transparent focus:ring-0 text-slate-900 placeholder:text-slate-400 text-base font-medium px-4 outline-none"
              placeholder="Search by customer name, phone, or license key..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </label>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Customer Name</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest">License Key</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Activation Date</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No matching licenses found.</td>
                </tr>
              ) : null}
              {filtered.map(lic => {
                const name = lic.customers?.name || 'Unknown';
                const initials = getInitials(name);
                const isRevoked = !lic.is_active;

                return (
                  <tr key={lic.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <Link href={`/dashboard/customer/${lic.customer_id}`} className="flex items-center gap-3 group">
                        <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${isRevoked ? 'bg-slate-200 text-slate-500' : 'bg-primary/10 text-primary'}`}>
                          {initials}
                        </div>
                        <span className="text-slate-900 font-semibold group-hover:underline">{name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <code className={`bg-slate-100 px-2 py-1 rounded font-mono text-sm tracking-tight ${isRevoked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                        {lic.key}
                      </code>
                    </td>
                    <td className="px-6 py-5">
                      {lic.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <span className="size-1.5 rounded-full bg-green-600"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          <span className="size-1.5 rounded-full bg-slate-400"></span>
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-5 text-sm ${isRevoked ? 'text-slate-400 italic' : 'text-slate-500'}`}>
                      {lic.activated_at
                        ? new Date(lic.activated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : <span className="text-slate-400 italic">Pending</span>}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <LicenseToggleBtn licenseId={lic.id} isActive={lic.is_active} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination strip */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
          <p className="text-sm text-slate-500">
            Showing {filtered.length} of {stats.total} results
          </p>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, iconColor, label, value }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-slate-900 tracking-tight text-3xl font-black">{value.toLocaleString()}</p>
    </div>
  );
}
