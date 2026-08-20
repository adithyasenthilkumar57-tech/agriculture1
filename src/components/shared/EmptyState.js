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
      <div className="text-5xl mb-3 select-none" role="img" aria-label="icon">
        {icon}
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
