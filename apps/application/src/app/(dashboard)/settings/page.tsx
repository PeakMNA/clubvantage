'use client'

import { useState, useEffect, useRef } from 'react'
import {
  SettingsNav,
  ClubProfileSection,
  OrganizationSection,
  BillingDefaultsSection,
  BillingCycleSection,
  ARPeriodSection,
  CreditLimitSection,
  StatementConfigSection,
  ChecklistConfigSection,
  LocalizationSection,
  NotificationsSection,
  BrandingSection,
  IntegrationsSection,
  LookupsSection,
  GLMappingSection,
  AuditTrailSection,
  type SettingsSection,
} from '@/components/settings'

const sectionIds: SettingsSection[] = [
  'club-profile',
  'organization',
  'billing-defaults',
  'billing-cycle',
  'ar-period',
  'credit-limits',
  'statement-config',
  'checklist-config',
  'localization',
  'notifications',
  'branding',
  'integrations',
  'lookups',
  'gl-mapping',
  'audit-trail',
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('club-profile')
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Scroll spy using Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -66% 0px',
      threshold: 0,
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as SettingsSection)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    sectionRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleNavClick = (sectionId: SettingsSection) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const setSectionRef = (id: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el)
    } else {
      sectionRefs.current.delete(id)
    }
  }

  return (
    <div className="flex gap-8">
      {/* Sticky sidebar navigation */}
      <div className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24">
          <SettingsNav
            activeSection={activeSection}
            onSectionClick={handleNavClick}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-8 pb-24">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your club management system</p>
        </div>

        <div ref={(el) => setSectionRef('club-profile', el)}>
          <ClubProfileSection id="club-profile" />
        </div>

        <div ref={(el) => setSectionRef('organization', el)}>
          <OrganizationSection id="organization" />
        </div>

        <div ref={(el) => setSectionRef('billing-defaults', el)}>
          <BillingDefaultsSection id="billing-defaults" />
        </div>

        <div ref={(el) => setSectionRef('billing-cycle', el)}>
          <BillingCycleSection id="billing-cycle" />
        </div>

        <div ref={(el) => setSectionRef('ar-period', el)}>
          <ARPeriodSection id="ar-period" />
        </div>

        <div ref={(el) => setSectionRef('credit-limits', el)}>
          <CreditLimitSection id="credit-limits" />
        </div>

        <div ref={(el) => setSectionRef('statement-config', el)}>
          <StatementConfigSection id="statement-config" />
        </div>

        <div ref={(el) => setSectionRef('localization', el)}>
          <LocalizationSection id="localization" />
        </div>

        <div ref={(el) => setSectionRef('notifications', el)}>
          <NotificationsSection id="notifications" />
        </div>

        <div ref={(el) => setSectionRef('branding', el)}>
          <BrandingSection id="branding" />
        </div>

        <div ref={(el) => setSectionRef('integrations', el)}>
          <IntegrationsSection id="integrations" />
        </div>

        <div ref={(el) => setSectionRef('lookups', el)}>
          <LookupsSection id="lookups" />
        </div>

        <div ref={(el) => setSectionRef('gl-mapping', el)}>
          <GLMappingSection id="gl-mapping" />
        </div>

        <div ref={(el) => setSectionRef('audit-trail', el)}>
          <AuditTrailSection id="audit-trail" />
        </div>
      </div>
    </div>
  )
}
