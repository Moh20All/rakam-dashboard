'use client';

import { useActionState, useState } from 'react';
import { Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { loginAction } from './actions';
import { LogoMark } from '@/components/Logo';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Brand side */}
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-navy p-12 text-white">
        <div className="absolute -right-32 -top-32 size-[28rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-gold/5 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <LogoMark className="size-11 text-xl" />
          <span className="text-lg font-bold">Warshati <span className="text-gold-hi" style={{ fontFamily: 'Tahoma, sans-serif' }}>ورشتي</span></span>
        </div>
        <div className="relative max-w-md">
          <p className="text-4xl font-bold leading-tight tracking-tight">
            Every shop, every key,<br /><span className="text-gold-hi">in one place.</span>
          </p>
          <p className="mt-4 text-white/60 leading-relaxed">
            Issue licenses, see which shops are open today, and read what your users tell you.
          </p>
        </div>
        <p className="relative text-xs text-white/40">warshatidz.com</p>
      </section>

      {/* Form side */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm" style={{ animation: 'pop-in .3s ease-out' }}>
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <LogoMark className="size-12 text-2xl lg:hidden mb-5" />
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-mute">Sign in to the Warshati admin.</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
                <input
                  id="password" name="password" type={show ? 'text' : 'password'} required autoFocus
                  autoComplete="current-password" className="input h-12 pl-10 pr-11" placeholder="••••••••••"
                />
                <button type="button" onClick={() => setShow(!show)} className="icon-btn absolute right-2 top-1/2 -translate-y-1/2" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn-gold btn w-full h-12">
              {pending ? <><Loader2 className="size-4 animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
