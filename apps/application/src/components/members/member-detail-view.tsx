'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  Edit,
  MoreHorizontal,
  FileText,
  Clock,
  AlertCircle,
  Heart,
} from 'lucide-react';

import {
  PageHeader,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from '@clubvantage/ui';

import { EngagementTab } from './tabs/engagement-tab';
import type { Member as EngagementMember, MemberStatus } from './types';

interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'lapsed';
  membershipType: string;
  joinDate: string;
  expiryDate: string;
  avatar?: string;
  household?: {
    id: string;
    name: string;
    members: { id: string; name: string; relation: string }[];
  };
  balance: number;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

interface MemberDetailViewProps {
  member: Member;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Mock billing data
const mockInvoices = [
  { id: 'INV-2024-001', date: '2024-01-15', amount: 25000, status: 'paid' },
  { id: 'INV-2024-002', date: '2024-02-15', amount: 25000, status: 'paid' },
  { id: 'INV-2024-003', date: '2024-03-15', amount: 25000, status: 'pending' },
];

// Mock booking data
const mockBookings = [
  { id: '1', facility: 'Tennis Court 1', date: '2024-03-20', time: '09:00 - 10:00', status: 'confirmed' },
  { id: '2', facility: 'Golf - Main Course', date: '2024-03-22', time: '07:00', status: 'confirmed' },
  { id: '3', facility: 'Swimming Pool', date: '2024-03-25', time: '15:00 - 16:00', status: 'pending' },
];

// Mock activity data
const mockActivity = [
  { id: '1', action: 'Booking created', description: 'Tennis Court 1 for March 20', date: '2024-03-18 14:30' },
  { id: '2', action: 'Payment received', description: 'Invoice INV-2024-002 paid via card', date: '2024-02-15 10:15' },
  { id: '3', action: 'Profile updated', description: 'Phone number changed', date: '2024-02-10 09:00' },
  { id: '4', action: 'Membership renewed', description: 'Extended to March 2025', date: '2024-01-15 11:30' },
];

export function MemberDetailView({ member }: MemberDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        description={member.memberId}
        breadcrumbs={[
          { label: 'Members', href: '/members' },
          { label: `${member.firstName} ${member.lastName}` },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/members">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Member Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
              <AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {member.firstName} {member.lastName}
                  </h2>
                  <p className="text-muted-foreground">{member.membershipType}</p>
                </div>
                <StatusBadge status={member.status.toUpperCase() as 'ACTIVE' | 'SUSPENDED' | 'LAPSED'} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(member.joinDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{member.address.city}, {member.address.country}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Account Balance</p>
              <p className={`text-2xl font-semibold ${member.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                {formatCurrency(member.balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="engagement">
            <Heart className="h-4 w-4 mr-1" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{member.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{member.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{member.address.line1}</p>
                  {member.address.line2 && <p>{member.address.line2}</p>}
                  <p>{member.address.city}, {member.address.postalCode}</p>
                  <p>{member.address.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Membership Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Membership Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Member ID</p>
                  <p>{member.memberId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membership Type</p>
                  <p>{member.membershipType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p>{formatDate(member.joinDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p>{formatDate(member.expiryDate)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Household */}
            {member.household && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Household
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{member.household.name}</p>
                  <div className="space-y-3">
                    {member.household.members.map((hm) => (
                      <div key={hm.id} className="flex items-center justify-between">
                        <Link
                          href={`/members/${hm.id}`}
                          className="text-sm hover:underline"
                        >
                          {hm.name}
                        </Link>
                        <Badge variant="outline">{hm.relation}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-semibold">12</p>
                    <p className="text-sm text-muted-foreground">Bookings (YTD)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">4</p>
                    <p className="text-sm text-muted-foreground">Guest Visits</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">24</p>
                    <p className="text-sm text-muted-foreground">Rounds of Golf</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">98%</p>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Invoices</CardTitle>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Upcoming Bookings</CardTitle>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{booking.facility}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.date)} at {booking.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <EngagementTab
            member={{
              id: member.id,
              memberNumber: member.memberId,
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              phone: member.phone,
              photoUrl: member.avatar,
              dateOfBirth: '',
              nationality: '',
              membershipTypeId: '',
              membershipTypeName: member.membershipType,
              status: member.status.toUpperCase() as MemberStatus,
              joinDate: member.joinDate,
              balance: member.balance,
              autoPay: false,
              addresses: [],
              dependents: [],
            } as EngagementMember}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4 py-2 border-b last:border-0">
                    <div className="mt-1">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
