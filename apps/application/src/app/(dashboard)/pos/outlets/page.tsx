'use client'

import { useState } from 'react'
import { Plus, Settings, MapPin, Monitor, Loader2, Link2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import {
  useGetPosOutletsQuery,
  useGetPosTemplatesQuery,
  useAssignPosTemplateMutation,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mr-1.5" />
      Inactive
    </span>
  )
}

export default function POSOutletsPage() {
  const queryClient = useQueryClient()
  const [assigningOutletId, setAssigningOutletId] = useState<string | null>(null)

  // Fetch outlets and templates
  const { data: outletsData, isLoading: outletsLoading, error: outletsError } = useGetPosOutletsQuery()
  const { data: templatesData } = useGetPosTemplatesQuery()

  const outlets = outletsData?.posOutlets ?? []
  const templates = templatesData?.posTemplates ?? []

  // Assign template mutation
  const assignMutation = useAssignPosTemplateMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetPosOutlets'] })
      setAssigningOutletId(null)
    },
    onError: (error) => {
      console.error('Failed to assign template:', error)
      setAssigningOutletId(null)
    },
  })

  const handleAssignTemplate = async (outletId: string, templateId: string) => {
    setAssigningOutletId(outletId)
    await assignMutation.mutateAsync({
      input: { outletId, templateId },
    })
  }

  const handleSettings = (outletId: string) => {
    // TODO: Open outlet settings modal
    console.log('Settings for outlet:', outletId)
    alert('Outlet settings coming soon!')
  }

  const handleAddOutlet = () => {
    // TODO: Open create outlet modal
    console.log('Add new outlet')
    alert('Create outlet coming soon!')
  }

  if (outletsLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (outletsError) {
    return (
      <div className="p-6">
        <Card className="py-12">
          <div className="text-center">
            <p className="text-red-500">Failed to load outlets</p>
            <p className="text-sm text-stone-500 mt-1">{String(outletsError)}</p>
          </div>
        </Card>
      </div>
    )
  }

  const activeCount = outlets.filter((o) => o.isActive).length

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">POS Outlets</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage outlet locations and their assigned templates
          </p>
        </div>
        <Button
          onClick={handleAddOutlet}
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Outlet
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900">{outlets.length}</div>
            <p className="text-sm text-stone-500">Total Outlets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
            <p className="text-sm text-stone-500">Active Outlets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900">{templates.length}</div>
            <p className="text-sm text-stone-500">Available Templates</p>
          </CardContent>
        </Card>
      </div>

      {/* Outlets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Outlets</CardTitle>
        </CardHeader>
        <CardContent>
          {outlets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-stone-500">
                    <th className="pb-3 font-medium">Outlet</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Template</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Role Configs</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {outlets.map((outlet) => (
                    <tr key={outlet.id} className="hover:bg-stone-50">
                      <td className="py-4">
                        <div className="font-medium text-stone-900">{outlet.name}</div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-stone-600 capitalize">{outlet.outletType}</span>
                      </td>
                      <td className="py-4">
                        {outlet.template ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-stone-600">
                            <Link2 className="h-3.5 w-3.5" />
                            {outlet.template.name}
                          </span>
                        ) : (
                          <select
                            className="text-sm border rounded px-2 py-1 text-stone-600"
                            value=""
                            onChange={(e) => handleAssignTemplate(outlet.id, e.target.value)}
                            disabled={assigningOutletId === outlet.id}
                          >
                            <option value="" disabled>
                              {assigningOutletId === outlet.id ? 'Assigning...' : 'Select template'}
                            </option>
                            {templates
                              .filter((t) => t.outletType === outlet.outletType)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                      <td className="py-4">
                        <StatusBadge isActive={outlet.isActive} />
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-stone-600">
                          {/* Role configs count would come from outlet.roleConfigs if included in query */}
                          —
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSettings(outlet.id)}
                            title="Outlet settings"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-stone-400" />
              </div>
              <h3 className="text-lg font-medium text-stone-900">No outlets configured</h3>
              <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                Add your first POS outlet to start configuring point of sale locations.
              </p>
              <Button
                onClick={handleAddOutlet}
                className="mt-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Outlet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
