'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  ReportsTabsLayout,
  ManagerDashboardTab,
  FinancialDashboardTab,
  RevenueReportsTab,
  AccountsReceivableTab,
  WhtReconciliationTab,
  CollectionPerformanceTab,
  MembershipAnalyticsTab,
  ExportMenu,
  DateRangePicker,
  type ReportsTab,
} from '@/components/reports'

const validTabs: ReportsTab[] = ['dashboard', 'financial', 'revenue', 'receivables', 'wht', 'collections', 'membership']

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as ReportsTab | null
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'dashboard'
  const [activeTab, setActiveTab] = useState<ReportsTab>(initialTab)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date; preset?: string }>({
    start: new Date(new Date().setDate(1)),
    end: new Date(),
    preset: 'this-month',
  })
  const [showComparison, setShowComparison] = useState(false)

  // Sync tab state with URL param
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam, activeTab])

  // Update URL when tab changes
  const handleTabChange = useCallback((tab: ReportsTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'dashboard') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    const queryString = params.toString()
    router.push(queryString ? `/reports?${queryString}` : '/reports', { scroll: false })
  }, [router, searchParams])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [])

  const handleExport = useCallback((format: 'csv' | 'pdf' | 'gl') => {
    console.log(`Exporting ${activeTab} data as ${format}`)
  }, [activeTab])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ManagerDashboardTab
            isLoading={isLoading}
            onAlertClick={(alertId) => {
              console.log('Alert clicked:', alertId)
            }}
          />
        )
      case 'financial':
        return (
          <FinancialDashboardTab
            isLoading={isLoading}
          />
        )
      case 'revenue':
        return (
          <RevenueReportsTab
            isLoading={isLoading}
            showComparison={showComparison}
            onShowComparisonChange={setShowComparison}
          />
        )
      case 'receivables':
        return (
          <AccountsReceivableTab
            isLoading={isLoading}
            canOverrideSuspension={true}
            onMemberClick={(memberId) => {
              router.push(`/members/${memberId}`)
            }}
            onSendReminder={(memberId) => {
              console.log('Send reminder to:', memberId)
            }}
            onOverrideSuspension={(memberId) => {
              console.log('Override suspension for:', memberId)
            }}
          />
        )
      case 'wht':
        return (
          <WhtReconciliationTab
            isLoading={isLoading}
            onVerify={(certificateId) => {
              console.log('Verify certificate:', certificateId)
            }}
            onReject={(certificateId) => {
              console.log('Reject certificate:', certificateId)
            }}
            onViewDocument={(certificateId) => {
              console.log('View document:', certificateId)
            }}
          />
        )
      case 'collections':
        return (
          <CollectionPerformanceTab
            isLoading={isLoading}
            showComparison={showComparison}
            onShowComparisonChange={setShowComparison}
          />
        )
      case 'membership':
        return (
          <MembershipAnalyticsTab
            isLoading={isLoading}
            onStageClick={(stage) => {
              console.log('Stage clicked:', stage)
            }}
            onTypeClick={(typeId) => {
              console.log('Type clicked:', typeId)
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <ReportsTabsLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      actions={
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <ExportMenu
            dateRange={dateRange}
            onExport={handleExport}
          />
        </div>
      }
    >
      {renderTabContent()}
    </ReportsTabsLayout>
  )
}
