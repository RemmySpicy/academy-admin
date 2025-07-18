export default function FacilitiesLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="flex space-x-2">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="flex space-x-1">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-14"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}