'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { ScheduleConfigPage } from '@/components/golf/schedule-config/schedule-config-page'
import { useCourses, useScheduleConfig } from '@/hooks/use-golf'
import type { ScheduleConfig } from '@/components/golf/schedule-config/types'

export default function ScheduleConfigRoutePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch real courses from the API
  const { courses, isLoading: coursesLoading } = useCourses()

  // Get course from query param or default to first
  const courseId = searchParams.get('courseId') || courses[0]?.id || ''
  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === courseId) ?? courses[0],
    [courseId, courses]
  )

  // Fetch schedule config for selected course
  const { scheduleConfig, isLoading: configLoading } = useScheduleConfig({
    courseId: selectedCourse?.id || '',
    autoCreate: true,
    enabled: !!selectedCourse?.id,
  })

  const handleBack = useCallback(() => {
    router.push('/golf')
  }, [router])

  const handleSave = useCallback(async (config: ScheduleConfig) => {
    // TODO: Call the updateScheduleConfig mutation
    console.log('Saving schedule config:', config)
    // For now, simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
  }, [])

  // Loading state
  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading courses...</span>
        </div>
      </div>
    )
  }

  // No courses available
  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-stone-900">No Courses Found</h2>
          <p className="text-stone-600 mt-2">Please create a course first.</p>
          <button
            onClick={() => router.push('/golf')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Go to Golf
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Course selector for multi-course clubs */}
      {courses.length > 1 && (
        <div className="bg-white border-b px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <label className="text-sm font-medium text-stone-600">
              Select Course:
            </label>
            <select
              value={courseId}
              onChange={(e) => router.push(`/golf/schedule-config?courseId=${e.target.value}`)}
              className="px-3 py-1.5 text-sm border rounded-lg bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {configLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-stone-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading schedule configuration...</span>
          </div>
        </div>
      ) : (
        <ScheduleConfigPage
          courseId={selectedCourse?.id || ''}
          courseName={selectedCourse?.name || 'Course'}
          initialConfig={scheduleConfig || undefined}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
