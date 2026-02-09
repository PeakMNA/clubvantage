'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { WifiOff, ChevronRight, Maximize2 } from 'lucide-react'

const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false, loading: () => <div className="w-[120px] h-[120px] bg-stone-100 animate-pulse rounded" /> }
)

interface MemberData {
  id: string
  name: string
  type: string
  memberSince: string
  dependentCount: number
  status: string
}

export function MemberIdContent({ member, clubName }: { member: MemberData; clubName: string }) {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    setIsOffline(!navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const qrData = JSON.stringify({
    memberId: member.id,
    timestamp: Math.floor(Date.now() / 30000),
  })

  return (
    <div className="min-h-[calc(100vh-8rem)] px-5 py-6 pb-36 bg-white">
      {/* Offline banner */}
      {isOffline && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-stone-50 rounded-xl">
          <WifiOff className="h-4 w-4 text-stone-600" />
          <span className="text-sm font-medium text-stone-600">Available Offline</span>
        </div>
      )}

      {/* Member Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl mx-auto max-w-sm" style={{ aspectRatio: '1.6' }}>
        <div className="absolute inset-0 bg-stone-900">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-48 h-48 border border-white/20 rounded-full -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-36 h-36 border border-white/20 rounded-full translate-y-8 -translate-x-8" />
          </div>
        </div>

        <div className="relative h-full flex flex-col justify-between p-5">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <span className="text-sm font-bold text-white">
                {clubName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-[11px] font-medium text-white/60 tracking-[0.2em]">
              {clubName.toUpperCase()}
            </span>
          </div>

          {/* QR Code */}
          <div className="flex justify-center py-2">
            <div className="bg-white rounded-lg p-3">
              <QRCodeSVG
                value={qrData}
                size={120}
                level="H"
                includeMargin={false}
                bgColor="transparent"
                fgColor="#1c1917"
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{member.name}</p>
              <p className="text-xs text-white/50">{member.type}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/40">ID: {member.id}</p>
              <p className="text-[10px] text-white/30">Since {member.memberSince}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scan hint */}
      <p className="text-xs text-stone-400 text-center mt-3">
        Scan for check-in & charges
      </p>

      <button className="flex items-center justify-center gap-1.5 mx-auto mt-3 text-xs text-stone-400">
        <Maximize2 className="h-3.5 w-3.5" />
        Tap to enlarge
      </button>

      {/* Info Section */}
      <div className="mt-8 max-w-sm mx-auto divide-y divide-stone-100">
        <InfoRow label="Membership" value={member.type} />
        <InfoRow label="Status">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[15px] text-stone-900">{member.status === 'ACTIVE' ? 'Active' : member.status}</span>
          </div>
        </InfoRow>
        <InfoRow label="Dependents" value={String(member.dependentCount)} hasChevron />
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  children,
  hasChevron,
}: {
  label: string
  value?: string
  children?: React.ReactNode
  hasChevron?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-[15px] text-stone-500">{label}</span>
      <div className="flex items-center gap-2">
        {children || (
          <span className="text-[15px] font-medium text-stone-900">{value}</span>
        )}
        {hasChevron && <ChevronRight className="h-4 w-4 text-stone-300" />}
      </div>
    </div>
  )
}
