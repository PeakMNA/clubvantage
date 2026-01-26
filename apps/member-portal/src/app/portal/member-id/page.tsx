'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@clubvantage/ui'
import { Sun, Moon, WifiOff, RefreshCw, Shield } from 'lucide-react'

// Mock member data - will be replaced with real data
const mockMember = {
  id: 'M-2024-0892',
  name: 'John Smith',
  memberNumber: '0892',
  type: 'Principal',
  photo: null,
  validUntil: '2026-12-31',
  clubName: 'Royal Palm Country Club',
}

export default function MemberIdPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date>(new Date())

  useEffect(() => {
    // Check online status
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleRefresh = () => {
    if (!isOffline) {
      setLastSynced(new Date())
    }
  }

  // Generate QR code data (member ID + timestamp for dynamic validation)
  const qrData = JSON.stringify({
    memberId: mockMember.id,
    memberNumber: mockMember.memberNumber,
    timestamp: Math.floor(Date.now() / 30000), // Rotates every 30 seconds
  })

  return (
    <div
      className={cn(
        'min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8 transition-colors duration-300',
        isDarkMode ? 'bg-stone-950' : 'bg-white'
      )}
    >
      {/* Offline indicator */}
      {isOffline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Offline Mode
          </span>
        </div>
      )}

      {/* Club name */}
      <p
        className={cn(
          'text-sm font-medium mb-2 transition-colors',
          isDarkMode ? 'text-stone-500' : 'text-stone-400'
        )}
      >
        {mockMember.clubName}
      </p>

      {/* Member name */}
      <h1
        className={cn(
          'text-2xl font-bold mb-1 transition-colors',
          isDarkMode ? 'text-white' : 'text-stone-900'
        )}
      >
        {mockMember.name}
      </h1>

      {/* Member type and number */}
      <p
        className={cn(
          'text-base mb-8 transition-colors',
          isDarkMode ? 'text-stone-400' : 'text-stone-500'
        )}
      >
        {mockMember.type} Member • #{mockMember.memberNumber}
      </p>

      {/* QR Code Container */}
      <div
        className={cn(
          'relative p-6 rounded-3xl shadow-2xl mb-8 transition-all duration-300',
          isDarkMode
            ? 'bg-white shadow-white/10'
            : 'bg-white shadow-stone-300/50'
        )}
      >
        <QRCodeSVG
          value={qrData}
          size={220}
          level="H"
          includeMargin={false}
          bgColor="transparent"
          fgColor={isDarkMode ? '#1c1917' : '#1c1917'}
        />

        {/* Security indicator */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-emerald-500 rounded-full">
          <Shield className="h-3 w-3 text-white" />
          <span className="text-xs font-semibold text-white">Verified</span>
        </div>
      </div>

      {/* Valid until */}
      <p
        className={cn(
          'text-sm mb-2 transition-colors',
          isDarkMode ? 'text-stone-500' : 'text-stone-400'
        )}
      >
        Valid until{' '}
        <span className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>
          {new Date(mockMember.validUntil).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </p>

      {/* Last synced */}
      <p
        className={cn(
          'text-xs transition-colors',
          isDarkMode ? 'text-stone-600' : 'text-stone-400'
        )}
      >
        Last synced:{' '}
        {lastSynced.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </p>

      {/* Control buttons */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center gap-4 px-4">
        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isOffline}
          className={cn(
            'flex items-center justify-center h-12 w-12 rounded-full transition-all',
            isDarkMode
              ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
            isOffline && 'opacity-50 cursor-not-allowed'
          )}
        >
          <RefreshCw className="h-5 w-5" />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            'flex items-center justify-center h-12 w-12 rounded-full transition-all',
            isDarkMode
              ? 'bg-stone-800 text-amber-400 hover:bg-stone-700'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Instructions */}
      <p
        className={cn(
          'fixed bottom-32 left-0 right-0 text-center text-xs px-4 transition-colors',
          isDarkMode ? 'text-stone-600' : 'text-stone-400'
        )}
      >
        Show this QR code at the gate for entry
      </p>
    </div>
  )
}
