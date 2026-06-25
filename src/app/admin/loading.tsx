export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-[#e8dcc8] dark:bg-[#2a3a5c] rounded animate-pulse" />
        <div className="h-10 w-20 bg-[#e8dcc8] dark:bg-[#2a3a5c] rounded animate-pulse" />
      </div>

      {/* Form skeleton */}
      <div className="h-[500px] bg-[#e8dcc8] dark:bg-[#2a3a5c] rounded-lg animate-pulse" />
    </div>
  );
}
