const STAGES = [
  { key: 'planning', label: 'Planning', emoji: '📝' },
  { key: 'planting', label: 'Planting', emoji: '🌱' },
  { key: 'growth', label: 'Growth', emoji: '🌿' },
  { key: 'flowering', label: 'Flowering', emoji: '🌸' },
  { key: 'fruiting', label: 'Fruiting', emoji: '🍅' },
  { key: 'harvest', label: 'Harvest', emoji: '🌾' },
];

export default function CropTimeline({ currentStage = 'planting' }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center min-w-[520px] justify-between relative px-4">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center relative group">
              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-1 -z-0 transition-colors ${
                    idx < currentIndex ? 'bg-primary-500' : 'bg-neutral-200'
                  }`}
                />
              )}

              {/* Dot */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-md scale-110'
                    : isCompleted
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-400 border border-neutral-300'
                }`}
              >
                {stage.emoji}
              </div>

              {/* Label */}
              <span
                className={`text-xs mt-2 font-medium tracking-tight ${
                  isActive
                    ? 'text-primary-700 font-bold'
                    : isCompleted
                    ? 'text-neutral-700'
                    : 'text-neutral-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
