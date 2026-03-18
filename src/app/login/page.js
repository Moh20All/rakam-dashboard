'use client';

import { useState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const formData = new FormData(e.target);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-light relative">
      {/* Top gradient bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50"></div>

      <div className="w-full max-w-[440px] flex flex-col gap-8">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="size-16 bg-primary text-accent rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined !text-4xl">security</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-primary text-3xl font-black tracking-tight">Rakam Dashboard</h1>
            <p className="text-primary/60 text-sm font-medium uppercase tracking-widest">License Management System</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl border border-primary/10 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="text-center">
              <p className="text-primary/70 text-sm leading-relaxed">
                Please enter your dashboard password to access the license management terminal.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-primary text-xs font-bold uppercase tracking-wider" htmlFor="password">
                Dashboard Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/40 group-focus-within:text-primary">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input
                  className="w-full pl-11 pr-4 py-4 rounded-lg bg-background-light border-2 border-primary/5 focus:border-primary focus:ring-0 text-primary placeholder:text-primary/30 transition-all outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••••••"
                  type="password"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-primary py-4 rounded-lg font-bold text-base tracking-wide shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span className="truncate">{isLoading ? 'Authenticating...' : 'Access Dashboard'}</span>
                {!isLoading && <span className="material-symbols-outlined">login</span>}
              </button>
              <span className="text-primary/50 text-xs text-center font-medium">
                Forgot password? Contact Support
              </span>
            </div>
          </form>
        </div>

        {/* Footer Icons */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 text-primary/30">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
            <span className="material-symbols-outlined text-2xl">encrypted</span>
            <span className="material-symbols-outlined text-2xl">shield_with_heart</span>
          </div>
          <p className="text-primary/40 text-[10px] uppercase font-bold tracking-[0.2em]">
            © 2024 Rakam Technologies. Secure Environment.
          </p>
        </div>
      </div>

      {/* Decorative bg icon */}
      <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-5">
        <span className="material-symbols-outlined !text-[12rem] text-primary">analytics</span>
      </div>
    </div>
  );
}
