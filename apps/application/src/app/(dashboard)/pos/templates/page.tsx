'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Copy, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import {
  useGetPosTemplatesQuery,
  useClonePosTemplateMutation,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

export default function POSTemplatesPage() {
  const queryClient = useQueryClient()
  const [cloningId, setCloningId] = useState<string | null>(null)

  // Fetch templates from API
  const { data, isLoading, error } = useGetPosTemplatesQuery()
  const templates = data?.posTemplates ?? []

  // Clone mutation
  const cloneMutation = useClonePosTemplateMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetPosTemplates'] })
      setCloningId(null)
    },
    onError: (error) => {
      console.error('Failed to clone template:', error)
      setCloningId(null)
    },
  })

  const handleClone = async (templateId: string, templateName: string) => {
    setCloningId(templateId)
    const newName = `${templateName} (Copy)`
    await cloneMutation.mutateAsync({ id: templateId, newName })
  }

  const handleEdit = (templateId: string) => {
    // TODO: Navigate to template editor or open modal
    console.log('Edit template:', templateId)
    alert('Template editor coming soon!')
  }

  const handleDelete = (templateId: string) => {
    // TODO: Implement delete with confirmation
    console.log('Delete template:', templateId)
    alert('Delete functionality coming soon!')
  }

  const handleCreate = () => {
    // TODO: Navigate to create template or open modal
    console.log('Create new template')
    alert('Create template coming soon!')
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="py-12">
          <div className="text-center">
            <p className="text-red-500">Failed to load templates</p>
            <p className="text-sm text-stone-500 mt-1">{String(error)}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">POS Templates</h1>
          <p className="text-sm text-stone-500 mt-1">
            Configure button layouts and actions for your POS outlets
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-stone-500 mt-1">
                      {template.description || `${template.outletType} template`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {template.isDefault && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div>
                    <p className="text-lg font-semibold text-stone-900 capitalize">
                      {template.outletType}
                    </p>
                    <p className="text-xs text-stone-500">Type</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-stone-900">
                      {typeof template.actionBarConfig === 'object'
                        ? (template.actionBarConfig as any)?.buttons?.length ?? 0
                        : 0}
                    </p>
                    <p className="text-xs text-stone-500">Buttons</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-stone-400">
                    Updated {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleClone(template.id, template.name)}
                      disabled={cloningId === template.id}
                      title="Clone template"
                    >
                      {cloningId === template.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(template.id)}
                      title="Edit template"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(template.id)}
                      title="Delete template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900">No templates yet</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              Create your first POS template to configure button layouts for your outlets.
            </p>
            <Button
              onClick={handleCreate}
              className="mt-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
