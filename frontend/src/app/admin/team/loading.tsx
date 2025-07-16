export default function TeamLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-72"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-2 border-b border-gray-200">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-t w-32"></div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}