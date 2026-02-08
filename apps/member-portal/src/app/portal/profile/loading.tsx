export default function ProfileLoading() {
  return (
    <div className="px-5 py-6 pb-36 animate-pulse">
      <div className="flex flex-col items-center mb-8">
        <div className="h-20 w-20 rounded-full bg-stone-200 mb-3" />
        <div className="h-6 w-40 bg-stone-200 rounded-lg" />
        <div className="h-4 w-28 bg-stone-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-3 gap-3 py-5 border-y border-stone-100 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-6 w-10 bg-stone-200 rounded mx-auto" />
            <div className="h-3 w-14 bg-stone-100 rounded mx-auto mt-2" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-4">
            <div className="h-5 w-5 bg-stone-200 rounded" />
            <div className="h-4 flex-1 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
