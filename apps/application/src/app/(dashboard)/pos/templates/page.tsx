import { Plus, MoreHorizontal, Copy, Pencil, Trash2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'

// Mock template data
const mockTemplates = [
  {
    id: '1',
    name: 'Golf Pro Shop',
    description: 'Default template for the pro shop POS',
    outlets: 1,
    categories: 5,
    products: 48,
    lastModified: '2024-01-15',
  },
  {
    id: '2',
    name: 'Restaurant & Bar',
    description: 'F&B template with dining modifiers',
    outlets: 2,
    categories: 8,
    products: 124,
    lastModified: '2024-01-12',
  },
  {
    id: '3',
    name: 'Fitness Center',
    description: 'Template for gym and spa services',
    outlets: 1,
    categories: 3,
    products: 22,
    lastModified: '2024-01-10',
  },
]

export default function POSTemplatesPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">POS Templates</h1>
          <p className="text-sm text-stone-500 mt-1">
            Configure product layouts and categories for your POS outlets
          </p>
        </div>
        <Button className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-stone-500 mt-1">{template.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-semibold text-stone-900">{template.outlets}</p>
                  <p className="text-xs text-stone-500">Outlets</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-stone-900">{template.categories}</p>
                  <p className="text-xs text-stone-500">Categories</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-stone-900">{template.products}</p>
                  <p className="text-xs text-stone-500">Products</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-stone-400">
                  Modified {template.lastModified}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (shown when no templates) */}
      {mockTemplates.length === 0 && (
        <Card className="py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900">No templates yet</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              Create your first POS template to configure products and categories for your outlets.
            </p>
            <Button className="mt-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
