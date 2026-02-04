'use client'

import {
  Building2,
  Landmark,
  Receipt,
  Calendar,
  Globe,
  Bell,
  Palette,
  Plug,
  List,
  FileSpreadsheet,
  ClipboardCheck,
} from 'lucide-react'
import { cn } from '@clubvantage/ui'
import type { SettingsSection } from './types'

interface SettingsNavProps {
  activeSection: SettingsSection
  onSectionClick: (section: SettingsSection) => void
  unsavedSections?: Set<SettingsSection>
}

const sections: Array<{
  id: SettingsSection
  label: string
  icon: typeof Building2
}> = [
  { id: 'club-profile', label: 'Club Profile', icon: Building2 },
  { id: 'organization', label: 'Organization', icon: Landmark },
  { id: 'gl-mapping', label: 'GL Mapping', icon: FileSpreadsheet },
  { id: 'billing-defaults', label: 'Billing Defaults', icon: Receipt },
  { id: 'billing-cycle', label: 'Billing Cycle', icon: Calendar },
  { id: 'localization', label: 'Localization', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'lookups', label: 'Lookups', icon: List },
  { id: 'audit-trail', label: 'Audit Trail', icon: ClipboardCheck },
]

export function SettingsNav({
  activeSection,
  onSectionClick,
  unsavedSections = new Set(),
}: SettingsNavProps) {
  return (
    <nav className="w-52 shrink-0 sticky top-20 h-fit">
      <ul className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          const hasUnsaved = unsavedSections.has(section.id)

          return (
            <li key={section.id}>
              <button
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                  'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-muted font-medium text-foreground border-l-3 border-amber-500'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                {hasUnsaved && (
                  <span className="h-2 w-2 rounded-full bg-amber-500" title="Unsaved changes" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
