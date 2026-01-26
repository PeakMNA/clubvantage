'use client';

import { Search } from 'lucide-react';
import { Input, Button } from '@clubvantage/ui';

export function MembersFilter() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, phone, email..."
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <option value="">All Types</option>
          <option value="full">Full Member</option>
          <option value="social">Social Member</option>
          <option value="golf">Golf Member</option>
          <option value="junior">Junior Member</option>
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="lapsed">Lapsed</option>
          <option value="resigned">Resigned</option>
        </select>
      </div>
    </div>
  );
}
