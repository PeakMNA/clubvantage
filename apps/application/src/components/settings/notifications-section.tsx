'use client'

import { useState } from 'react'
import { Edit } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { mockNotificationTemplates } from './mock-data'
import type { NotificationTemplate } from './types'

interface NotificationsSectionProps {
  id: string
}

export function NotificationsSection({ id }: NotificationsSectionProps) {
  const [templates, setTemplates] = useState(mockNotificationTemplates)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleTemplate = (templateId: string) => {
    setTemplates(templates.map((t) =>
      t.id === templateId ? { ...t, enabled: !t.enabled } : t
    ))
  }

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Configure email and SMS templates</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Template</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Channel</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{template.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">{template.channel}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Checkbox
                    checked={template.enabled}
                    onCheckedChange={() => toggleTemplate(template.id)}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Channel: {editingTemplate.channel}</p>
              {editingTemplate.channel === 'email' && (
                <div>
                  <Label>Subject</Label>
                  <Input defaultValue={editingTemplate.subject} />
                </div>
              )}
              <div>
                <Label>Body</Label>
                <textarea
                  className="w-full h-48 p-3 border rounded-lg text-sm font-mono"
                  defaultValue={editingTemplate.body}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Available merge fields: {'{{member_name}}'}, {'{{amount}}'}, {'{{due_date}}'}, {'{{club_name}}'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="outline">Preview</Button>
            <Button variant="outline">Test Send</Button>
            <Button className="bg-gradient-to-br from-amber-500 to-amber-600">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
