'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Mail, Lock, Fingerprint } from 'lucide-react'
import { cn } from '@clubvantage/ui'
export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        setIsSubmitting(false)
        return
      }

      // Get redirect URL from query params or default to /portal
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect') ?? '/portal'
      router.push(redirect)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
      {/* Background Image */}
      <img src="/mockup/club-entrance.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-stone-50/85 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25 mb-6">
          <span className="text-2xl font-bold text-white tracking-wider">RC</span>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Welcome Back
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Sign in to your member account
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
              className={cn(
                'w-full h-13 pl-12 pr-4 rounded-xl border border-stone-200 bg-white',
                'text-stone-900 placeholder:text-stone-400',
                'focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500',
                'transition-all disabled:opacity-50'
              )}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
              className={cn(
                'w-full h-13 pl-12 pr-12 rounded-xl border border-stone-200 bg-white',
                'text-stone-900 placeholder:text-stone-400',
                'focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500',
                'transition-all disabled:opacity-50'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-stone-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full h-14 rounded-xl font-semibold text-base transition-all',
              'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700',
              'shadow-lg shadow-amber-500/25',
              'disabled:opacity-70 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Face ID */}
        <button
          className={cn(
            'w-full h-14 rounded-xl font-semibold text-sm transition-all',
            'border-2 border-stone-200 text-stone-700 bg-white',
            'hover:border-stone-300 hover:bg-stone-50',
            'flex items-center justify-center gap-3'
          )}
        >
          <Fingerprint className="h-5 w-5 text-stone-500" />
          Sign in with Face ID
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-stone-400 pt-4">
          Need help? Contact your club
        </p>
      </div>
      </div>
    </div>
  )
}
