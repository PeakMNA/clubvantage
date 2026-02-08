import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Member Portal',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Reset Password</h1>
        <p className="text-stone-500 text-sm">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        <p className="text-stone-400 text-xs italic">Coming soon</p>
      </div>
    </div>
  )
}
