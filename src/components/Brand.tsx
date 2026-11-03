export function BrandMark({ size = 34, tone = 'dark' }: { size?: number; tone?: 'dark' | 'light' }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill={tone === 'dark' ? '#14130F' : '#F4F1EA'} />
      <path d="M14 15h30v8H24v6h14v7H24v7h20v8H14z" fill={tone === 'dark' ? '#F4F1EA' : '#14130F'} />
      <circle cx="50" cy="17" r="5" fill="#D8F55A" />
    </svg>
  );
}

export function Logo({ size = 32, tone = 'dark', wordmark = true }: { size?: number; tone?: 'dark' | 'light'; wordmark?: boolean }) {
  return (
    <span className={`logo tone-${tone}`}>
      <BrandMark size={size} tone={tone} />
      {wordmark && <span className="logo-word">Editrim</span>}
    </span>
  );
}
