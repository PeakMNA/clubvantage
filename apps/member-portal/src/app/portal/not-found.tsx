import Link from 'next/link'

export default function PortalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
      <p className="text-6xl font-bold text-stone-200 mb-4">404</p>
      <h2 className="text-lg font-semibold text-stone-900 mb-2">Page not found</h2>
      <p className="text-sm text-stone-500 text-center mb-6 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/portal"
        className="px-6 py-3 rounded-xl text-sm font-semibold bg-stone-900 text-white"
      >
        Back to Home
      </Link>
    </div>
  )
}
