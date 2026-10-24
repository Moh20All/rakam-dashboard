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
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-inverse p-12 text-inverse-foreground">
        {/* Lime disc and a grid of solder pads, as in the design (A01 Login) */}
        <div className="absolute -right-16 -top-24 size-80 rounded-full bg-flux" />
        <div className="absolute right-24 bottom-28 grid grid-cols-6 gap-4" aria-hidden="true">
          {Array.from({ length: 30 }, (_, i) => <span key={i} className="size-2 rounded-full bg-inverse-raised" />)}
        </div>
        <div className="relative flex items-center gap-3">
          <LogoMark className="size-11" />
          <div>
            <span className="block text-lg font-bold leading-6">Warshati <span className="text-flux font-arabic">ورشتي</span></span>
            <span className="block text-xs opacity-75">Admin</span>
          </div>
        </div>
        <div className="relative max-w-md">
          <p className="text-[40px] font-bold leading-[48px]">
            Every shop, every key, in one place.
          </p>
          <p className="mt-4 text-inverse-foreground/75 leading-relaxed">
            Issue licenses, see which shops are open today, and read what your users tell you.
          </p>
          <p className="mt-3 text-sm text-inverse-foreground/75">warshatydz.com</p>
        </div>
      </section>

      {/* Form side */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm" style={{ animation: 'pop-in .3s ease-out' }}>
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <LogoMark className="size-12 lg:hidden mb-5" />
            <h1 className="text-[26px] leading-8 font-bold">Welcome back</h1>
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
              <p role="alert" className="rounded-md border border-transparent bg-destructive-soft px-3.5 py-2.5 text-sm font-medium text-destructive">
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn btn-flux w-full h-10 text-sm">
              {pending ? <><Loader2 className="size-4 animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
