export default function Loading() {
  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#e8dcc8] dark:bg-[#2a3a5c] rounded animate-pulse" />
          <div className="h-4 w-96 bg-[#e8dcc8] dark:bg-[#2a3a5c] rounded animate-pulse" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-[#e8dcc8] dark:bg-[#2a3a5c] rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-[400px] bg-[#e8dcc8] dark:bg-[#2a3a5c] rounded-lg animate-pulse" />
    </div>
  );
}
