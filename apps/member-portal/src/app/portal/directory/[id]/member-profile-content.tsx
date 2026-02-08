'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, User } from 'lucide-react'

interface MemberProfile {
  id: string
  firstName: string
  lastInitial: string
  avatarUrl: string | null
  memberSince: number
  membershipType: string
  interests: string[]
}

export function MemberProfileContent({ member }: { member: MemberProfile }) {
  const router = useRouter()

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
          <h1 className="text-base font-semibold text-stone-900">Profile</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-8 pb-36">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center mb-8">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt=""
              className="h-24 w-24 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-stone-400" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-stone-900">
            {member.firstName} {member.lastInitial}.
          </h2>
          <p className="text-sm text-stone-500 mt-1">{member.membershipType}</p>
          <p className="text-xs text-stone-400 mt-0.5">Member since {member.memberSince}</p>
        </div>

        {/* Interests */}
        {member.interests.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-stone-700 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {member.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
