export default function SourceLabel({ source = 'Live API', updated = 'Just now', status = 'live' }) {
  const isLive = status === 'live';
  const isWarning = status === 'cached' || status === 'delayed';

  return (
    <div className="source-label text-xs">
      <span
        className={`source-dot ${
          isLive ? 'bg-green-500' : isWarning ? 'source-dot-warning' : 'source-dot-error'
        }`}
      />
      <span className="font-semibold text-neutral-600">{source}</span>
      <span className="text-neutral-400">•</span>
      <span className="text-neutral-500">{updated}</span>
      <span className="text-neutral-400">•</span>
      <span className={`capitalize font-medium ${isLive ? 'text-green-700' : 'text-amber-700'}`}>
        {status}
      </span>
    </div>
  );
}
