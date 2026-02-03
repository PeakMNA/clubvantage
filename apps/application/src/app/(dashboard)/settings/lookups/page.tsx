import { PageHeader } from '@clubvantage/ui';
import { LookupCategoriesList } from '@/components/settings/lookups/lookup-categories-list';

export default function LookupsSettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-6 pb-0">
        <PageHeader
          title="Lookups"
          description="Manage configurable dropdown values and system options"
          breadcrumbs={[
            { label: 'Settings', href: '/settings' },
            { label: 'Lookups' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        <LookupCategoriesList />
      </div>
    </div>
  );
}
