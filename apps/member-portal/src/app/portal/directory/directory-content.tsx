'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Users, ArrowLeft } from 'lucide-react'

interface DirectoryMember {
  id: string
  firstName: string
  lastInitial: string
  avatarUrl: string | null
  memberSince: number
  membershipType: string
}

export function DirectoryContent({
  members,
  initialSearch,
}: {
  members: DirectoryMember[]
  initialSearch: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    setSearch(value)
    startTransition(() => {
      const params = value ? `?q=${encodeURIComponent(value)}` : ''
      router.replace(`/portal/directory${params}`)
    })
  }

  // Group by first letter of first name
  const grouped = new Map<string, DirectoryMember[]>()
  for (const m of members) {
    const letter = m.firstName[0]?.toUpperCase() ?? '#'
    const list = grouped.get(letter) ?? []
    list.push(m)
    grouped.set(letter, list)
  }
  const sortedLetters = Array.from(grouped.keys()).sort()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </button>
          <h1 className="text-base font-semibold text-stone-900">Member Directory</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-4 pb-36">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Member count */}
        <p className="text-xs text-stone-500 mb-4">{members.length} member{members.length !== 1 ? 's' : ''}</p>

        {/* Member List */}
        {sortedLetters.map((letter) => (
          <div key={letter} className="mb-4">
            <p className="text-xs font-semibold text-stone-400 mb-2 px-1">{letter}</p>
            <div className="space-y-1">
              {grouped.get(letter)!.map((member) => (
                <Link
                  key={member.id}
                  href={`/portal/directory/${member.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 active:opacity-70 transition-all"
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-stone-500">
                        {member.firstName[0]}{member.lastInitial}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-stone-900">
                      {member.firstName} {member.lastInitial}.
                    </p>
                    <p className="text-xs text-stone-500">{member.membershipType}</p>
                  </div>
                  <span className="text-xs text-stone-400">Since {member.memberSince}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {members.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">
              {search ? 'No members found' : 'No members available'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
