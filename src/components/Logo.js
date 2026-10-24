export function LogoMark({ className = 'size-9' }) {
  return (
    <span className={`${className} relative inline-flex shrink-0 items-center justify-center rounded-xl bg-navy ring-1 ring-gold/40`}>
      <span className="font-bold text-gold-hi leading-none" style={{ fontFamily: 'Tahoma, "Segoe UI", sans-serif', fontSize: '1.15em' }}>و</span>
    </span>
  );
}

export function Logo({ sub }) {
  return (
    <span className="flex items-center gap-3 text-white">
      <LogoMark />
      <span className="leading-tight">
        <span className="block font-bold tracking-tight text-[15px]">
          Warshati <span className="text-gold-hi font-semibold" style={{ fontFamily: 'Tahoma, sans-serif' }}>ورشتي</span>
        </span>
        {sub && <span className="block text-[11px] text-white/50">{sub}</span>}
      </span>
    </span>
  );
}
