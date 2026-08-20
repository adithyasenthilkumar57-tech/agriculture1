const TRIP_STAGES = [
  { key: 'booking_confirmed', label: 'Booking Confirmed', icon: '📋' },
  { key: 'transporter_assigned', label: 'Transporter Assigned', icon: '🚜' },
  { key: 'en_route_to_farm', label: 'En Route', icon: '🛣️' },
  { key: 'pickup_completed', label: 'Pickup Completed', icon: '📦' },
  { key: 'in_transit', label: 'In Transit', icon: '🚚' },
  { key: 'arrived', label: 'Arrived', icon: '📍' },
  { key: 'delivery_completed', label: 'Delivered', icon: '✅' },
];

export default function TripTimeline({ currentStatus = 'booking_confirmed' }) {
  const currentIndex = TRIP_STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-3 overflow-x-auto">
      <div className="flex items-center min-w-[620px] justify-between relative px-2">
        {TRIP_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center relative">
              {/* Line */}
              {idx < TRIP_STAGES.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-1 -z-0 transition-colors ${
                    idx < currentIndex ? 'bg-transport-500' : 'bg-neutral-200'
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-all ${
                  isActive
                    ? 'bg-transport-500 text-white ring-4 ring-transport-100 shadow-sm scale-110'
                    : isCompleted
                    ? 'bg-transport-600 text-white'
                    : 'bg-neutral-100 text-neutral-400 border border-neutral-300'
                }`}
              >
                {stage.icon}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1.5 text-center leading-tight px-1 font-medium ${
                  isActive
                    ? 'text-transport-700 font-bold'
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
