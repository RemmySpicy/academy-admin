export default function PaymentsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 bg-gray-200 rounded w-56 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-80"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-2 border-b border-gray-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-t w-32"></div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}