export default function GolfLoading() {
  return (
    <div className="px-5 py-6 pb-36 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-20 bg-stone-200 rounded-lg" />
        <div className="h-10 w-36 bg-stone-200 rounded-xl" />
      </div>
      <div className="flex gap-2 mb-6">
        <div className="flex-1 h-12 bg-stone-200 rounded-xl" />
        <div className="flex-1 h-12 bg-stone-100 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-stone-200" />
        ))}
      </div>
    </div>
  )
}
