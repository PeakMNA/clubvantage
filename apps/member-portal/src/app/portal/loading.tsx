export default function PortalLoading() {
  return (
    <div className="px-5 py-6 pb-36 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div>
          <div className="h-7 w-48 bg-stone-200 rounded-lg" />
          <div className="h-4 w-32 bg-stone-100 rounded mt-2" />
        </div>
        <div className="h-10 w-10 rounded-full bg-stone-200" />
      </div>

      {/* Card skeleton */}
      <div className="rounded-2xl bg-stone-200 h-36" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-2xl bg-stone-200" />
            <div className="h-3 w-12 bg-stone-100 rounded" />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-stone-200 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-stone-200 rounded" />
              <div className="h-3 w-1/2 bg-stone-100 rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
