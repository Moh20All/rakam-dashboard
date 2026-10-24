'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function DashboardError({ error, reset }) {
  return (
    <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
      <AlertTriangle className="mx-auto size-10 text-destructive" />
      <h1 className="mt-4 text-lg font-bold">This page could not load</h1>
      <p className="mt-2 text-sm text-mute">{error?.message || 'Something went wrong.'}</p>
      <p className="mt-1 text-xs text-faint">Check the Supabase environment variables if this keeps happening.</p>
      <button onClick={reset} className="btn btn-primary mt-6"><RotateCcw className="size-4" /> Try again</button>
    </div>
  );
}
