import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function CouponsLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Loading */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
            </div>
            <div className="flex space-x-2">
              <div className="h-9 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-9 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Loading */}
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
            </div>

            {/* Table Loading */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-4 py-3 border-b">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-4 py-3 border-b">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}