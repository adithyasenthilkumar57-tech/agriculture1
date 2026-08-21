import Link from 'next/link';

export default function EmptyState({
  icon = '🌾',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default',
}) {
  return (
    <div className="card p-8 text-center flex flex-col items-center justify-center my-4 bg-white/70 backdrop-blur-sm border-dashed border-2 border-neutral-200">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3" role="img" aria-label="icon">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
      </div>
      <h3 className="text-lg font-bold text-neutral-800 font-display mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-500 max-w-md mb-5 leading-relaxed">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={`btn ${
            variant === 'transport'
              ? 'btn-transport'
              : variant === 'ai'
              ? 'btn-ai'
              : 'btn-primary'
          }`}
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className={`btn ${
            variant === 'transport'
              ? 'btn-transport'
              : variant === 'ai'
              ? 'btn-ai'
              : 'btn-primary'
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
