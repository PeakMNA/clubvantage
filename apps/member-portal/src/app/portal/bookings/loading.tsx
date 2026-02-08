export default function BookingsLoading() {
  return (
    <div className="px-5 py-6 pb-36 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-7 w-36 bg-stone-200 rounded-lg" />
        <div className="h-10 w-24 bg-stone-200 rounded-full" />
      </div>
      <div className="flex gap-6 border-b border-stone-100 mb-5">
        <div className="h-5 w-28 bg-stone-200 rounded pb-3" />
        <div className="h-5 w-20 bg-stone-100 rounded pb-3" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-stone-100 p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-stone-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-stone-200 rounded" />
                <div className="h-3 w-1/2 bg-stone-100 rounded mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
