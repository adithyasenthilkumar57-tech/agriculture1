import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <span className="text-6xl select-none">🌾</span>
      <h2 className="text-2xl font-bold font-display text-neutral-900">Page Not Found</h2>
      <p className="text-xs text-neutral-500 max-w-sm">
        The agricultural resource or page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard" className="btn btn-primary btn-sm text-xs font-bold">
        Return to Dashboard 🌾
      </Link>
    </div>
  );
}
