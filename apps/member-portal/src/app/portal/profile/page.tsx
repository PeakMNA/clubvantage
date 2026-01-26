'use client'

import { cn } from '@clubvantage/ui'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  FileText,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/portal/status-badge'
import { useGetMyMemberQuery, useAuth } from '@clubvantage/api-client'

interface MenuItemProps {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
  badge?: string
  danger?: boolean
}

function MenuItem({ icon: Icon, label, href, onClick, badge, danger }: MenuItemProps) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            danger
              ? 'bg-red-50 dark:bg-red-950/30'
              : 'bg-stone-100 dark:bg-stone-800'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              danger
                ? 'text-red-500'
                : 'text-stone-600 dark:text-stone-400'
            )}
          />
        </div>
        <span
          className={cn(
            'font-medium',
            danger
              ? 'text-red-600 dark:text-red-400'
              : 'text-stone-900 dark:text-stone-100'
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className="h-5 w-5 text-stone-400" />
      </div>
    </>
  )

  const className = cn(
    'flex items-center justify-between w-full p-3 rounded-xl',
    'hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors'
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  )
}

// Map member status to badge status
function mapStatusToBadge(status: string | undefined): 'verified' | 'pending' | 'suspended' {
  switch (status) {
    case 'ACTIVE':
      return 'verified'
    case 'SUSPENDED':
      return 'suspended'
    default:
      return 'pending'
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { data, isLoading, error } = useGetMyMemberQuery()

  const member = data?.myMember

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="px-4 py-6 pb-24">
        <div className="text-center py-12">
          <p className="text-stone-500">Unable to load profile. Please try again.</p>
        </div>
      </div>
    )
  }

  const fullName = `${member.firstName} ${member.lastName}`
  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div className="px-4 py-6 pb-24">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={fullName}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1">
            <StatusBadge status={mapStatusToBadge(member.status)} size="sm" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {fullName}
          </h1>
          <p className="text-stone-500">
            {member.membershipType?.name || 'Member'} • #{member.memberId}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-stone-500 mb-3">
          Contact Information
        </h2>
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          <div className="p-4 flex items-center gap-3 border-b border-border/60">
            <Mail className="h-5 w-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Email</p>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {member.email || 'Not provided'}
              </p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3 border-b border-border/60">
            <Phone className="h-5 w-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Phone</p>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {member.phone || 'Not provided'}
              </p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Address</p>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {member.address || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Info */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-stone-500 mb-3">
          Membership Details
        </h2>
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          <div className="p-4 flex items-center gap-3 border-b border-border/60">
            <Calendar className="h-5 w-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Member Since</p>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {member.joinDate
                  ? new Date(member.joinDate).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Not recorded'}
              </p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3 border-b border-border/60">
            <Shield className="h-5 w-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Membership Valid Until</p>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {member.expiryDate
                  ? new Date(member.expiryDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Lifetime'}
              </p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-stone-400" />
            <div className="flex-1">
              <p className="text-xs text-stone-500">Dependents</p>
              {member.dependents && member.dependents.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {member.dependents.map((dep) => (
                    <span
                      key={dep.id}
                      className="px-2 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-full"
                    >
                      {dep.firstName} {dep.lastName} ({dep.relationship})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-stone-500">No dependents</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-stone-500 mb-3">Account</h2>
        <div className="rounded-2xl bg-card border border-border/60 p-2">
          <MenuItem
            icon={CreditCard}
            label="Payment Methods"
            href="/portal/profile/payment-methods"
          />
          <MenuItem
            icon={FileText}
            label="WHT Certificates"
            href="/portal/profile/wht-certificates"
          />
          <MenuItem
            icon={Bell}
            label="Notifications"
            href="/portal/profile/notifications"
          />
          <MenuItem
            icon={Settings}
            label="Settings"
            href="/portal/profile/settings"
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-stone-500 mb-3">Support</h2>
        <div className="rounded-2xl bg-card border border-border/60 p-2">
          <MenuItem
            icon={HelpCircle}
            label="Help & Support"
            href="/portal/help"
          />
        </div>
      </section>

      <section>
        <div className="rounded-2xl bg-card border border-border/60 p-2">
          <MenuItem icon={LogOut} label="Sign Out" onClick={handleLogout} danger />
        </div>
      </section>

      {/* App Version */}
      <p className="text-center text-xs text-stone-400 mt-8">
        ClubVantage Member Portal v1.0.0
      </p>
    </div>
  )
}
