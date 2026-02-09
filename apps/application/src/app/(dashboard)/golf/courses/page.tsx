'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'
import { useCourses } from '@/hooks/use-golf'
import { CoursesTab } from '@/components/golf/courses-tab'
import { DynamicCourseModal as CourseModal } from '@/components/golf/dynamic-modals'
import type { Course } from '@/components/golf/types'

export default function GolfCoursesPage() {
  const { courses: apiCourses, isLoading: isCoursesLoading } = useCourses()

  const [courses, setCourses] = useState<Course[]>([])
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Sync courses from API
  if (apiCourses.length > 0 && courses.length === 0) {
    const transformedCourses: Course[] = apiCourses.map(c => ({
      id: c.id,
      name: c.name,
      holes: (c.holes === 9 || c.holes === 18 || c.holes === 27 || c.holes === 36 ? c.holes : 18) as 9 | 18 | 27 | 36,
      par: c.par,
      rating: c.rating ?? 72.0,
      slope: c.slope ?? 113,
      interval: c.teeInterval,
      status: c.isActive ? 'ACTIVE' as const : 'CLOSED' as const,
      firstTeeTime: c.firstTeeTime,
      lastTeeTime: c.lastTeeTime,
      enable18HoleBooking: c.holes === 18,
    }))
    setCourses(transformedCourses)
  }

  const handleSaveCourse = async (data: Omit<Course, 'id'>) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...data, id: editingCourse.id } : c))
    } else {
      setCourses([...courses, { ...data, id: `course-${Date.now()}` }])
    }
  }

  const handleDeleteCourse = async () => {
    if (editingCourse) {
      setCourses(courses.filter(c => c.id !== editingCourse.id))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Golf Management"
        description="Manage courses"
        breadcrumbs={[{ label: 'Golf' }, { label: 'Courses' }]}
        actions={
          <Button onClick={() => { setEditingCourse(null); setShowCourseModal(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        }
      />

      <CoursesTab
        courses={courses}
        isLoading={isCoursesLoading}
        onAddCourse={() => {
          setEditingCourse(null)
          setShowCourseModal(true)
        }}
        onEditCourse={(course: Course) => {
          setEditingCourse(course)
          setShowCourseModal(true)
        }}
      />

      <CourseModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false)
          setEditingCourse(null)
        }}
        course={editingCourse}
        onSave={handleSaveCourse}
        onDelete={editingCourse ? handleDeleteCourse : undefined}
      />
    </div>
  )
}
