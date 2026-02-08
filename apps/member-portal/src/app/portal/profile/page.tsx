import type { Metadata } from 'next'
import { cn } from '@clubvantage/ui'

export const metadata: Metadata = {
  title: 'Profile | Member Portal',
}
import {
  User,
  Users,
  Shield,
  Bell,
  Globe,
  Moon,
  CreditCard,
  Receipt,
  HelpCircle,
  MessageSquare,
  Info,
  ChevronRight,
  Camera,
} from 'lucide-react'
import Link from 'next/link'
import { getMemberProfile, getMemberStats } from '@/lib/data'
import { SignOutButton } from '@/components/portal/sign-out-button'

interface MenuItemProps {
  icon: React.ElementType
  label: string
  href?: string
  value?: string
  toggle?: boolean
  toggleOn?: boolean
  danger?: boolean
}

function MenuItem({ icon: Icon, label, href, value, toggle, toggleOn, danger }: MenuItemProps) {
  const content = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Icon className={cn('h-5 w-5', danger ? 'text-red-500' : 'text-stone-500')} />
        <span className={cn('text-[15px]', danger ? 'text-red-600 font-medium' : 'text-stone-900')}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-stone-500">{value}</span>}
        {toggle !== undefined && (
          <div className={cn('relative w-11 h-6 rounded-full transition-colors', toggleOn ? 'bg-stone-900' : 'bg-stone-300')}>
            <div className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', toggleOn ? 'translate-x-5.5' : 'translate-x-0.5')} />
          </div>
        )}
        {!toggle && !danger && <ChevronRight className="h-5 w-5 text-stone-300" />}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block py-4 border-b border-stone-50 last:border-0 active:opacity-70 transition-opacity">
        {content}
      </Link>
    )
  }

  return (
    <button className="w-full py-4 border-b border-stone-50 last:border-0 active:opacity-70 transition-opacity text-left">
      {content}
    </button>
  )
}

export default async function ProfilePage() {
  const [member, stats] = await Promise.all([
    getMemberProfile(),
    getMemberStats(),
  ])

  const initials = `${member.firstName[0]}${member.lastName[0]}`

  return (
    <div className="px-5 py-6 pb-36">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-3">
          <div className="h-20 w-20 rounded-full bg-stone-900 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-stone-200 shadow-sm">
            <Camera className="h-3.5 w-3.5 text-stone-600" />
          </button>
        </div>
        <h1 className="text-[22px] font-semibold text-stone-900">
          {member.firstName} {member.lastName}
        </h1>
        <p className="text-sm text-stone-500">{member.membershipType}</p>
        <p className="text-xs text-stone-400 mt-0.5">ID: {member.memberId}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 py-5 border-y border-stone-100 mb-8">
        <div className="text-center">
          <p className="text-xl font-bold text-stone-900">{stats.rounds}</p>
          <p className="text-xs text-stone-500">Rounds</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-stone-900">{stats.bookings}</p>
          <p className="text-xs text-stone-500">Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-stone-900">{stats.memberSince}</p>
          <p className="text-xs text-stone-500">Member Since</p>
        </div>
      </div>

      {/* Account Section */}
      <section className="mb-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Account</p>
        <MenuItem icon={User} label="Personal Information" href="/portal/profile/edit" />
        <MenuItem icon={Users} label={`Dependents (${member.dependentCount})`} href="/portal/profile/dependents" />
        <MenuItem icon={Shield} label="Privacy & Security" href="/portal/profile/security" />
      </section>

      {/* Preferences Section */}
      <section className="mb-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Preferences</p>
        <MenuItem icon={Bell} label="Notifications" href="/portal/profile/preferences" />
        <MenuItem icon={Globe} label="Language" value="English" />
        <MenuItem icon={Moon} label="Dark Mode" toggle toggleOn={false} />
      </section>

      {/* Billing Section */}
      <section className="mb-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Billing</p>
        <MenuItem icon={CreditCard} label="Payment Methods" href="/portal/profile/payment-methods" />
        <MenuItem icon={Receipt} label="Billing Address" href="/portal/profile/billing-address" />
      </section>

      {/* Support Section */}
      <section className="mb-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Support</p>
        <MenuItem icon={HelpCircle} label="Help & FAQ" href="/portal/help" />
        <MenuItem icon={MessageSquare} label="Contact Club" href="/portal/contact" />
        <MenuItem icon={Info} label="About" value="v1.0.0" />
      </section>

      {/* Sign Out */}
      <SignOutButton />
    </div>
  )
}
