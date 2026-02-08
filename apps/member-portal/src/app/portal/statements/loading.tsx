export default function StatementsLoading() {
  return (
    <div className="px-5 py-6 pb-36 space-y-8 animate-pulse">
      <div className="h-7 w-32 bg-stone-200 rounded-lg" />
      <div className="rounded-2xl bg-stone-200 h-40" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-stone-200 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-stone-200 rounded" />
              <div className="h-3 w-1/4 bg-stone-100 rounded mt-2" />
            </div>
            <div className="h-4 w-16 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
