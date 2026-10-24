/* eslint-disable @next/next/no-img-element -- a tiny static SVG, no optimisation needed */

// Trace app tile (design system assets/mark-trace-tile.svg). Sized by the className.
export function LogoMark({ className = 'size-9' }) {
  return <img src="/mark-trace-tile.svg" alt="" className={`${className} shrink-0`} />;
}

// For graphite (inverse) grounds: sidebar, phone top bar, login panel
export function Logo({ sub }) {
  return (
    <span className="flex items-center gap-2.5 text-inverse-foreground">
      <LogoMark className="size-[34px]" />
      <span className="leading-tight">
        <span className="block font-bold text-[15px] leading-[18px]">
          Warshati <span className="text-flux font-arabic">ورشتي</span>
        </span>
        {sub && <span className="block text-[11px] leading-[14px] opacity-75">{sub}</span>}
      </span>
    </span>
  );
}
