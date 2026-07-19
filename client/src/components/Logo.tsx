export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Dataset Explorer logo"
      data-testid="logo-app"
    >
      <rect x="2" y="2" width="22" height="22" rx="5" stroke="currentColor" strokeWidth="2" />
      <rect x="7" y="14" width="3.4" height="7" rx="1" fill="currentColor" />
      <rect x="12.3" y="9" width="3.4" height="12" rx="1" fill="currentColor" />
      <rect x="17.6" y="12" width="3.4" height="9" rx="1" fill="currentColor" />
      <circle cx="24" cy="24" r="5.5" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="2" />
      <line x1="27.8" y1="27.8" x2="30.5" y2="30.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
