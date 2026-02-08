export default function MemberIdLoading() {
  return (
    <div className="min-h-[calc(100vh-8rem)] px-5 py-6 pb-36 bg-white animate-pulse">
      <div className="rounded-2xl bg-stone-200 mx-auto max-w-sm" style={{ aspectRatio: '1.6' }} />
      <div className="h-3 w-40 bg-stone-100 rounded mx-auto mt-3" />
      <div className="mt-8 max-w-sm mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <div className="h-4 w-24 bg-stone-200 rounded" />
            <div className="h-4 w-32 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
