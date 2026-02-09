/**
 * ClubVantage Multi-Tenancy Seed Script
 * Creates a second club, corporate members, households, dependents,
 * additional portal users, and cross-referenced sample data.
 *
 * Run standalone: cd database && npx tsx prisma/seed-multitenancy.ts
 * Also called at the end of seed.ts
 */

import {
  PrismaClient,
  Region,
  SubscriptionTier,
  MemberStatus,
  UserRole,
  BookingStatus,
  PlayerType,
  BookingType,
  BookingPaymentMethod,
  BookingPaymentStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

// Allow passing an existing prisma client or create one
let _prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!_prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    _prisma = new PrismaClient({ adapter });
  }
  return _prisma;
}

export async function seedMultitenancy(prismaArg?: PrismaClient) {
  const prisma = prismaArg || getPrisma();

  console.log('');
  console.log('🏢 Starting multi-tenancy seed...');

  const memberPasswordHash = await bcrypt.hash('Member123!', 12);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);

  // ============================================================================
  // LOOKUP: Royal Bangkok Club (must exist from main seed)
  // ============================================================================
  const rbClub = await prisma.club.findFirst({ where: { slug: 'royal-bangkok-club' } });
  if (!rbClub) {
    console.error('❌ Royal Bangkok Club not found. Run the main seed first.');
    process.exit(1);
  }

  // ============================================================================
  // 1. CORPORATE MEMBERSHIP TYPE (Royal Bangkok)
  // ============================================================================
  console.log('Creating corporate membership type...');

  const corporateType = await prisma.membershipType.upsert({
    where: { clubId_code: { clubId: rbClub.id, code: 'CORPORATE' } },
    update: {},
    create: {
      clubId: rbClub.id,
      name: 'Corporate Member',
      code: 'CORPORATE',
      description: 'Corporate membership with enhanced guest privileges',
      monthlyFee: 25000,
      joiningFee: 1000000,
      allowGuests: true,
      maxGuestsPerBooking: 4,
      bookingAdvanceDays: 14,
      priorityBooking: true,
      sortOrder: 5,
    },
  });

  console.log(`✅ Created corporate membership type: ${corporateType.name}`);

  // ============================================================================
  // 2. HOUSEHOLD & DEPENDENTS FOR SOMCHAI (M-0001)
  // ============================================================================
  console.log('Creating household and dependents for Somchai...');

  const somchai = await prisma.member.findFirst({
    where: { clubId: rbClub.id, memberId: 'M-0001' },
  });

  if (!somchai) {
    console.error('❌ Somchai (M-0001) not found. Run the main seed first.');
    process.exit(1);
  }

  // Create household
  let household = await prisma.household.findFirst({
    where: { clubId: rbClub.id, name: 'Tanaka Family' },
  });

  if (!household) {
    household = await prisma.household.create({
      data: {
        clubId: rbClub.id,
        name: 'Tanaka Family',
        phone: '+66 81 555 0001',
        email: 'tanaka.family@example.com',
      },
    });
  }

  // Link Somchai as primary member
  await prisma.member.update({
    where: { id: somchai.id },
    data: { householdId: household.id, isPrimaryMember: true },
  });

  // Create dependents
  const dependentData = [
    { firstName: 'Mayumi', lastName: 'Tanaka', relationship: 'Spouse', dateOfBirth: new Date(1987, 3, 15) },
    { firstName: 'Kenji', lastName: 'Tanaka', relationship: 'Son', dateOfBirth: new Date(2010, 7, 22) },
  ];

  const dependents = await Promise.all(
    dependentData.map(async (d) => {
      const existing = await prisma.dependent.findFirst({
        where: { memberId: somchai.id, firstName: d.firstName, lastName: d.lastName },
      });
      if (existing) return existing;

      return prisma.dependent.create({
        data: {
          memberId: somchai.id,
          firstName: d.firstName,
          lastName: d.lastName,
          relationship: d.relationship,
          dateOfBirth: d.dateOfBirth,
          isActive: true,
        },
      });
    }),
  );

  const kenjiDependent = dependents.find((d) => d.firstName === 'Kenji')!;

  console.log(`✅ Created household "${household.name}" with ${dependents.length} dependents`);

  // ============================================================================
  // 3. ADDITIONAL MEMBER PORTAL USERS (Royal Bangkok)
  // ============================================================================
  console.log('Creating additional member portal users...');

  const portalUserData = [
    { email: 'nattaya@demo.com', memberId: 'M-0002' },
    { email: 'thaksin@demo.com', memberId: 'M-0006' },
    { email: 'chaiwat@demo.com', memberId: 'M-0010' },
  ];

  for (const pu of portalUserData) {
    const member = await prisma.member.findFirst({
      where: { clubId: rbClub.id, memberId: pu.memberId },
    });
    if (!member) {
      console.warn(`⚠️ Member ${pu.memberId} not found, skipping portal user ${pu.email}`);
      continue;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { clubId: rbClub.id, email: pu.email },
    });
    if (existingUser) continue;

    // Check if member already has a user
    const existingMemberUser = await prisma.user.findFirst({
      where: { memberId: member.id },
    });
    if (existingMemberUser) continue;

    await prisma.user.create({
      data: {
        clubId: rbClub.id,
        memberId: member.id,
        email: pu.email,
        passwordHash: memberPasswordHash,
        firstName: member.firstName,
        lastName: member.lastName,
        role: UserRole.MEMBER,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        permissions: ['member:read', 'member:portal', 'bookings:create', 'invoices:view'],
      },
    });
  }

  console.log(`✅ Created ${portalUserData.length} additional portal users`);

  // ============================================================================
  // 4. CORPORATE MEMBERS (Royal Bangkok)
  // ============================================================================
  console.log('Creating corporate members...');

  const corporateMembers = [
    { memberId: 'M-0021', firstName: 'Tanawat', lastName: 'Srivichai', email: 'tanawat@example.com', company: 'Siam Cement Group' },
    { memberId: 'M-0022', firstName: 'Preecha', lastName: 'Lertpanya', email: 'preecha@example.com', company: 'Bangkok Bank' },
    { memberId: 'M-0023', firstName: 'Kanya', lastName: 'Rattanakorn', email: 'kanya@example.com', company: 'PTT Group' },
  ];

  const createdCorpMembers = await Promise.all(
    corporateMembers.map(async (cm) => {
      return prisma.member.upsert({
        where: { clubId_memberId: { clubId: rbClub.id, memberId: cm.memberId } },
        update: {},
        create: {
          clubId: rbClub.id,
          memberId: cm.memberId,
          firstName: cm.firstName,
          lastName: cm.lastName,
          email: cm.email,
          membershipTypeId: corporateType.id,
          status: MemberStatus.ACTIVE,
          joinDate: new Date(2025, 5, 1),
          notes: `Corporate member — ${cm.company}`,
          tags: ['corporate', cm.company.toLowerCase().replace(/\s+/g, '-')],
        },
      });
    }),
  );

  // Portal user for Tanawat (M-0021)
  const tanawat = createdCorpMembers[0]!;
  const existingCorpUser = await prisma.user.findFirst({
    where: { clubId: rbClub.id, email: 'corporate@demo.com' },
  });
  if (!existingCorpUser) {
    const existingTanawatUser = await prisma.user.findFirst({
      where: { memberId: tanawat.id },
    });
    if (!existingTanawatUser) {
      await prisma.user.create({
        data: {
          clubId: rbClub.id,
          memberId: tanawat.id,
          email: 'corporate@demo.com',
          passwordHash: memberPasswordHash,
          firstName: tanawat.firstName,
          lastName: tanawat.lastName,
          role: UserRole.MEMBER,
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          permissions: ['member:read', 'member:portal', 'bookings:create', 'invoices:view'],
        },
      });
    }
  }

  console.log(`✅ Created ${createdCorpMembers.length} corporate members with portal user`);

  // ============================================================================
  // 5. DEMO MEMBER BOOKINGS (Somchai — visible in portal)
  // ============================================================================
  console.log('Creating demo member bookings for Somchai...');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Helper: date offset from today
  const dayOffset = (days: number, hours: number, minutes: number = 0): Date => {
    const d = new Date(todayStart);
    d.setDate(d.getDate() + days);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // Get facilities and resources
  const tennisFacility = await prisma.facility.findFirst({ where: { clubId: rbClub.id, code: 'TENNIS' } });
  const gymFacility = await prisma.facility.findFirst({ where: { clubId: rbClub.id, code: 'GYM' } });
  const poolFacility = await prisma.facility.findFirst({ where: { clubId: rbClub.id, code: 'POOL' } });
  const verandahFacility = await prisma.facility.findFirst({ where: { clubId: rbClub.id, code: 'CLUBHOUSE_DINING' } });

  const tc1Resource = await prisma.resource.findFirst({ where: { clubId: rbClub.id, code: 'TC1' } });
  const tc2Resource = await prisma.resource.findFirst({ where: { clubId: rbClub.id, code: 'TC2' } });
  const gymResource = await prisma.resource.findFirst({ where: { clubId: rbClub.id, code: 'GYM1' } });
  const lapPoolResource = await prisma.resource.findFirst({ where: { clubId: rbClub.id, code: 'LAP1' } });
  const verandahResource = await prisma.resource.findFirst({ where: { clubId: rbClub.id, code: 'VRD3' } });

  // Facility bookings for Somchai
  const facilityBookings = [
    {
      bookingNumber: 'BK-MT-0001',
      bookingType: BookingType.FACILITY,
      facilityId: tennisFacility?.id,
      resourceId: tc1Resource?.id,
      startTime: dayOffset(1, 10, 0),
      endTime: dayOffset(1, 11, 0),
      durationMinutes: 60,
      basePrice: 500,
      status: BookingStatus.CONFIRMED,
    },
    {
      bookingNumber: 'BK-MT-0002',
      bookingType: BookingType.FACILITY,
      facilityId: gymFacility?.id,
      resourceId: gymResource?.id,
      startTime: dayOffset(2, 14, 0),
      endTime: dayOffset(2, 16, 0),
      durationMinutes: 120,
      basePrice: 0,
      status: BookingStatus.CONFIRMED,
    },
    {
      bookingNumber: 'BK-MT-0003',
      bookingType: BookingType.FACILITY,
      facilityId: poolFacility?.id,
      resourceId: lapPoolResource?.id,
      startTime: dayOffset(3, 9, 0),
      endTime: dayOffset(3, 10, 0),
      durationMinutes: 60,
      basePrice: 0,
      status: BookingStatus.PENDING,
    },
    {
      bookingNumber: 'BK-MT-0004',
      bookingType: BookingType.FACILITY,
      facilityId: verandahFacility?.id,
      resourceId: verandahResource?.id,
      startTime: dayOffset(-1, 11, 0),
      endTime: dayOffset(-1, 12, 30),
      durationMinutes: 90,
      basePrice: 0,
      status: BookingStatus.COMPLETED,
    },
    {
      bookingNumber: 'BK-MT-0005',
      bookingType: BookingType.FACILITY,
      facilityId: tennisFacility?.id,
      resourceId: tc2Resource?.id,
      startTime: dayOffset(-3, 10, 0),
      endTime: dayOffset(-3, 11, 0),
      durationMinutes: 60,
      basePrice: 500,
      status: BookingStatus.COMPLETED,
    },
  ];

  for (const fb of facilityBookings) {
    const existing = await prisma.booking.findFirst({
      where: { clubId: rbClub.id, bookingNumber: fb.bookingNumber },
    });
    if (existing) continue;

    await prisma.booking.create({
      data: {
        clubId: rbClub.id,
        bookingNumber: fb.bookingNumber,
        bookingType: fb.bookingType,
        memberId: somchai.id,
        facilityId: fb.facilityId,
        resourceId: fb.resourceId,
        startTime: fb.startTime,
        endTime: fb.endTime,
        durationMinutes: fb.durationMinutes,
        basePrice: fb.basePrice,
        totalAmount: fb.basePrice,
        status: fb.status,
        bookingPaymentMethod: BookingPaymentMethod.ON_ACCOUNT,
        bookingPaymentStatus: fb.status === BookingStatus.COMPLETED ? BookingPaymentStatus.PAID : BookingPaymentStatus.PENDING,
      },
    });
  }

  console.log(`✅ Created ${facilityBookings.length} facility bookings for Somchai`);

  // ============================================================================
  // 5b. GOLF TEE TIMES FOR SOMCHAI
  // ============================================================================
  console.log('Creating golf tee times for Somchai...');

  const golfCourse = await prisma.golfCourse.findFirst({ where: { clubId: rbClub.id, code: 'MAIN' } });
  if (!golfCourse) {
    console.error('❌ Golf course not found. Run the main seed first.');
    process.exit(1);
  }

  // Lookup other members for player groups
  const prasit = await prisma.member.findFirst({ where: { clubId: rbClub.id, memberId: 'M-0003' } });
  const wichai = await prisma.member.findFirst({ where: { clubId: rbClub.id, memberId: 'M-0005' } });
  const thaksin = await prisma.member.findFirst({ where: { clubId: rbClub.id, memberId: 'M-0006' } });
  const pimchanok = await prisma.member.findFirst({ where: { clubId: rbClub.id, memberId: 'M-0007' } });

  // Find highest existing tee time number to avoid conflicts
  const existingTT = await prisma.teeTime.findMany({
    where: { clubId: rbClub.id, teeTimeNumber: { startsWith: 'TT-MT-' } },
    select: { teeTimeNumber: true },
  });
  let ttCounter = existingTT.length > 0
    ? Math.max(...existingTT.map((t) => parseInt(t.teeTimeNumber.replace('TT-MT-', '')) || 0))
    : 0;
  const nextTTNumber = () => `TT-MT-${String(++ttCounter).padStart(4, '0')}`;

  // Tee time 1: Tomorrow 07:00 — CONFIRMED, 4 players
  const tt1Number = nextTTNumber();
  let tt1 = await prisma.teeTime.findFirst({ where: { clubId: rbClub.id, teeTimeNumber: tt1Number } });
  if (!tt1) {
    const teeDate1 = dayOffset(1, 0);
    tt1 = await prisma.teeTime.create({
      data: {
        clubId: rbClub.id,
        courseId: golfCourse.id,
        teeTimeNumber: tt1Number,
        teeDate: teeDate1,
        teeTime: '07:00',
        holes: 18,
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        players: {
          create: [
            { position: 1, playerType: PlayerType.MEMBER, memberId: somchai.id },
            { position: 2, playerType: PlayerType.MEMBER, memberId: prasit?.id },
            { position: 3, playerType: PlayerType.MEMBER, memberId: wichai?.id },
            { position: 4, playerType: PlayerType.GUEST, guestName: 'James Wilson' },
          ],
        },
      },
    });
  }

  // Tee time 2: Tomorrow+4 08:16 — PENDING, 2 players (Somchai + dependent Kenji)
  const tt2Number = nextTTNumber();
  let tt2 = await prisma.teeTime.findFirst({ where: { clubId: rbClub.id, teeTimeNumber: tt2Number } });
  if (!tt2) {
    const teeDate2 = dayOffset(4, 0);
    tt2 = await prisma.teeTime.create({
      data: {
        clubId: rbClub.id,
        courseId: golfCourse.id,
        teeTimeNumber: tt2Number,
        teeDate: teeDate2,
        teeTime: '08:16',
        holes: 18,
        status: BookingStatus.PENDING,
        players: {
          create: [
            { position: 1, playerType: PlayerType.MEMBER, memberId: somchai.id },
            { position: 2, playerType: PlayerType.DEPENDENT, memberId: somchai.id, dependentId: kenjiDependent.id, guestName: 'Kenji Tanaka' },
          ],
        },
      },
    });
  }

  // Tee time 3: 2 days ago 06:32 — COMPLETED, 3 players
  const tt3Number = nextTTNumber();
  let tt3 = await prisma.teeTime.findFirst({ where: { clubId: rbClub.id, teeTimeNumber: tt3Number } });
  if (!tt3) {
    const teeDate3 = dayOffset(-2, 0);
    tt3 = await prisma.teeTime.create({
      data: {
        clubId: rbClub.id,
        courseId: golfCourse.id,
        teeTimeNumber: tt3Number,
        teeDate: teeDate3,
        teeTime: '06:32',
        holes: 18,
        status: BookingStatus.COMPLETED,
        confirmedAt: dayOffset(-3, 10),
        checkedInAt: dayOffset(-2, 6, 15),
        completedAt: dayOffset(-2, 11, 30),
        players: {
          create: [
            { position: 1, playerType: PlayerType.MEMBER, memberId: somchai.id, checkedIn: true, checkedInAt: dayOffset(-2, 6, 15) },
            { position: 2, playerType: PlayerType.MEMBER, memberId: thaksin?.id, checkedIn: true, checkedInAt: dayOffset(-2, 6, 20) },
            { position: 3, playerType: PlayerType.MEMBER, memberId: pimchanok?.id, checkedIn: true, checkedInAt: dayOffset(-2, 6, 18) },
          ],
        },
      },
    });
  }

  console.log('✅ Created 3 golf tee times for Somchai');

  // ============================================================================
  // 5c. EVENT REGISTRATIONS FOR SOMCHAI
  // ============================================================================
  console.log('Creating event registrations for Somchai...');

  const sundayBrunch = await prisma.event.findFirst({
    where: { clubId: rbClub.id, title: 'Sunday Brunch Buffet' },
  });
  const interClubGolf = await prisma.event.findFirst({
    where: { clubId: rbClub.id, title: 'Inter-Club Golf Championship' },
  });

  if (sundayBrunch) {
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId: sundayBrunch.id, memberId: somchai.id },
    });
    if (!existing) {
      await prisma.eventRegistration.create({
        data: { eventId: sundayBrunch.id, memberId: somchai.id, guestCount: 2, status: 'REGISTERED' },
      });
    }
  }

  if (interClubGolf) {
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId: interClubGolf.id, memberId: somchai.id },
    });
    if (!existing) {
      await prisma.eventRegistration.create({
        data: { eventId: interClubGolf.id, memberId: somchai.id, guestCount: 0, status: 'REGISTERED' },
      });
    }
  }

  console.log('✅ Created event registrations for Somchai');

  // ============================================================================
  // 6. SECOND CLUB: PHUKET OCEAN CLUB
  // ============================================================================
  console.log('');
  console.log('🏝️ Creating Phuket Ocean Club...');

  const phuketClub = await prisma.club.upsert({
    where: { slug: 'phuket-ocean-club' },
    update: {},
    create: {
      name: 'Phuket Ocean Club',
      slug: 'phuket-ocean-club',
      region: Region.TH,
      timezone: 'Asia/Bangkok',
      currency: 'THB',
      taxRate: 7,
      taxType: 'VAT',
      address: '88 Kamala Beach Road, Kathu, Phuket 83150',
      phone: '+66 76 385 000',
      email: 'info@phuketoceanclub.com',
      subscriptionTier: SubscriptionTier.STARTER,
      maxMembers: 500,
      maxUsers: 10,
      features: {
        golf: false,
        facility: true,
        billing: true,
        leads: false,
        reports: false,
      },
    },
  });

  console.log(`✅ Created club: ${phuketClub.name}`);

  // ============================================================================
  // 6a. PHUKET — MEMBERSHIP TYPES
  // ============================================================================
  console.log('Creating Phuket membership types...');

  const phuketMembershipTypes = await Promise.all([
    prisma.membershipType.upsert({
      where: { clubId_code: { clubId: phuketClub.id, code: 'FULL' } },
      update: {},
      create: {
        clubId: phuketClub.id,
        name: 'Full Member',
        code: 'FULL',
        description: 'Full access to all club facilities',
        monthlyFee: 8000,
        joiningFee: 200000,
        allowGuests: true,
        maxGuestsPerBooking: 3,
        bookingAdvanceDays: 7,
        priorityBooking: true,
        sortOrder: 1,
      },
    }),
    prisma.membershipType.upsert({
      where: { clubId_code: { clubId: phuketClub.id, code: 'SOCIAL' } },
      update: {},
      create: {
        clubId: phuketClub.id,
        name: 'Social Member',
        code: 'SOCIAL',
        description: 'Access to dining and social facilities',
        monthlyFee: 3000,
        joiningFee: 50000,
        allowGuests: true,
        maxGuestsPerBooking: 2,
        bookingAdvanceDays: 3,
        priorityBooking: false,
        sortOrder: 2,
      },
    }),
  ]);

  const phuketFullType = phuketMembershipTypes[0]!;
  const phuketSocialType = phuketMembershipTypes[1]!;

  console.log(`✅ Created ${phuketMembershipTypes.length} Phuket membership types`);

  // ============================================================================
  // 6b. PHUKET — MEMBERS
  // ============================================================================
  console.log('Creating Phuket members...');

  const phuketMemberData = [
    { memberId: 'P-0001', firstName: 'Anan', lastName: 'Kittikhun', email: 'anan@example.com', type: phuketFullType, status: MemberStatus.ACTIVE },
    { memberId: 'P-0002', firstName: 'Laddawan', lastName: 'Sriphai', email: 'laddawan@example.com', type: phuketFullType, status: MemberStatus.ACTIVE },
    { memberId: 'P-0003', firstName: 'Suphot', lastName: 'Chaiyasit', email: 'suphot@example.com', type: phuketSocialType, status: MemberStatus.ACTIVE },
    { memberId: 'P-0004', firstName: 'Wipada', lastName: 'Thongdee', email: 'wipada@example.com', type: phuketSocialType, status: MemberStatus.ACTIVE },
    { memberId: 'P-0005', firstName: 'Krit', lastName: 'Jantarawong', email: 'krit@example.com', type: phuketFullType, status: MemberStatus.SUSPENDED },
    { memberId: 'P-0006', firstName: 'Naree', lastName: 'Boonmee', email: 'naree@example.com', type: phuketFullType, status: MemberStatus.ACTIVE },
  ];

  const phuketMembers = await Promise.all(
    phuketMemberData.map(async (m) => {
      return prisma.member.upsert({
        where: { clubId_memberId: { clubId: phuketClub.id, memberId: m.memberId } },
        update: {},
        create: {
          clubId: phuketClub.id,
          memberId: m.memberId,
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email,
          membershipTypeId: m.type.id,
          status: m.status,
          joinDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        },
      });
    }),
  );

  const anan = phuketMembers[0]!;

  console.log(`✅ Created ${phuketMembers.length} Phuket members`);

  // ============================================================================
  // 6c. PHUKET — USERS
  // ============================================================================
  console.log('Creating Phuket users...');

  // Admin
  const phuketAdminExisting = await prisma.user.findFirst({
    where: { clubId: phuketClub.id, email: 'admin@phuketoceanclub.com' },
  });
  if (!phuketAdminExisting) {
    await prisma.user.create({
      data: {
        clubId: phuketClub.id,
        email: 'admin@phuketoceanclub.com',
        passwordHash: adminPasswordHash,
        firstName: 'Phuket',
        lastName: 'Admin',
        role: UserRole.TENANT_ADMIN,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  }

  // Portal user for Anan
  const phuketPortalExisting = await prisma.user.findFirst({
    where: { clubId: phuketClub.id, email: 'phuket@demo.com' },
  });
  if (!phuketPortalExisting) {
    const existingAnanUser = await prisma.user.findFirst({ where: { memberId: anan.id } });
    if (!existingAnanUser) {
      await prisma.user.create({
        data: {
          clubId: phuketClub.id,
          memberId: anan.id,
          email: 'phuket@demo.com',
          passwordHash: memberPasswordHash,
          firstName: anan.firstName,
          lastName: anan.lastName,
          role: UserRole.MEMBER,
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          permissions: ['member:read', 'member:portal', 'bookings:create', 'invoices:view'],
        },
      });
    }
  }

  console.log('✅ Created Phuket admin and portal users');

  // ============================================================================
  // 6d. PHUKET — FACILITIES & RESOURCES
  // ============================================================================
  console.log('Creating Phuket facilities...');

  const phuketFacilities = await Promise.all([
    prisma.facility.upsert({
      where: { clubId_code: { clubId: phuketClub.id, code: 'POOL' } },
      update: {},
      create: {
        clubId: phuketClub.id,
        name: 'Swimming Pool',
        code: 'POOL',
        category: 'POOL',
        description: 'Oceanview infinity pool and lap pool',
        capacity: 40,
        bookingDuration: 60,
        maxAdvanceDays: 3,
        memberRate: 0,
        guestRate: 300,
        operatingHours: {
          monday: { open: '06:00', close: '20:00' },
          tuesday: { open: '06:00', close: '20:00' },
          wednesday: { open: '06:00', close: '20:00' },
          thursday: { open: '06:00', close: '20:00' },
          friday: { open: '06:00', close: '20:00' },
          saturday: { open: '06:00', close: '21:00' },
          sunday: { open: '06:00', close: '21:00' },
        },
        amenities: ['infinity_pool', 'lap_pool', 'sun_loungers'],
      },
    }),
    prisma.facility.upsert({
      where: { clubId_code: { clubId: phuketClub.id, code: 'GYM' } },
      update: {},
      create: {
        clubId: phuketClub.id,
        name: 'Fitness Center',
        code: 'GYM',
        category: 'STUDIO',
        description: 'Air-conditioned gym with ocean views',
        capacity: 30,
        bookingDuration: 90,
        maxAdvanceDays: 1,
        memberRate: 0,
        guestRate: 500,
        operatingHours: {
          monday: { open: '06:00', close: '21:00' },
          tuesday: { open: '06:00', close: '21:00' },
          wednesday: { open: '06:00', close: '21:00' },
          thursday: { open: '06:00', close: '21:00' },
          friday: { open: '06:00', close: '21:00' },
          saturday: { open: '07:00', close: '20:00' },
          sunday: { open: '07:00', close: '20:00' },
        },
        amenities: ['cardio', 'weights', 'yoga_studio'],
      },
    }),
    prisma.facility.upsert({
      where: { clubId_code: { clubId: phuketClub.id, code: 'RESTAURANT' } },
      update: {},
      create: {
        clubId: phuketClub.id,
        name: 'Beachside Restaurant',
        code: 'RESTAURANT',
        category: 'DINING',
        description: 'Thai and international cuisine with beachfront seating',
        capacity: 60,
        bookingDuration: 90,
        maxAdvanceDays: 14,
        memberRate: 0,
        guestRate: 0,
        operatingHours: {
          monday: { open: '07:00', close: '22:00' },
          tuesday: { open: '07:00', close: '22:00' },
          wednesday: { open: '07:00', close: '22:00' },
          thursday: { open: '07:00', close: '22:00' },
          friday: { open: '07:00', close: '23:00' },
          saturday: { open: '07:00', close: '23:00' },
          sunday: { open: '07:00', close: '22:00' },
        },
        amenities: ['beachfront', 'bar', 'live_music_weekend'],
      },
    }),
  ]);

  console.log(`✅ Created ${phuketFacilities.length} Phuket facilities`);

  // Resources
  console.log('Creating Phuket resources...');

  const phuketPoolFacility = phuketFacilities[0]!;
  const phuketGymFacility = phuketFacilities[1]!;
  const phuketRestaurant = phuketFacilities[2]!;

  const phuketResourceData = [
    { facilityId: phuketPoolFacility.id, name: 'Infinity Pool', code: 'POOL1', capacity: 25 },
    { facilityId: phuketPoolFacility.id, name: 'Lap Pool', code: 'POOL2', capacity: 15 },
    { facilityId: phuketGymFacility.id, name: 'Main Gym Floor', code: 'GYM1', capacity: 30 },
    { facilityId: phuketRestaurant.id, name: 'Beachfront Table 1', code: 'REST1', capacity: 4 },
    { facilityId: phuketRestaurant.id, name: 'Beachfront Table 2', code: 'REST2', capacity: 4 },
    { facilityId: phuketRestaurant.id, name: 'Indoor Table 1', code: 'REST3', capacity: 6 },
  ];

  const phuketResources = await Promise.all(
    phuketResourceData.map(async (r, i) => {
      const existing = await prisma.resource.findFirst({
        where: { facilityId: r.facilityId, code: r.code },
      });
      if (existing) return existing;

      return prisma.resource.create({
        data: {
          clubId: phuketClub.id,
          facilityId: r.facilityId,
          name: r.name,
          code: r.code,
          capacity: r.capacity,
          sortOrder: i,
        },
      });
    }),
  );

  console.log(`✅ Created ${phuketResources.length} Phuket resources`);

  // ============================================================================
  // 6e. PHUKET — CHARGE TYPES
  // ============================================================================
  console.log('Creating Phuket charge types...');

  await Promise.all([
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: phuketClub.id, code: 'MONTHLY_FEE' } },
      update: {},
      create: {
        clubId: phuketClub.id,
        name: 'Monthly Membership Fee',
        code: 'MONTHLY_FEE',
        category: 'membership',
        taxable: true,
        glCode: '4100',
      },
    }),
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: phuketClub.id, code: 'FB_CHARGE' } },
      update: {},
      create: {
        clubId: phuketClub.id,
        name: 'Food & Beverage',
        code: 'FB_CHARGE',
        category: 'fb',
        taxable: true,
        glCode: '4400',
      },
    }),
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: phuketClub.id, code: 'FACILITY_FEE' } },
      update: {},
      create: {
        clubId: phuketClub.id,
        name: 'Facility Fee',
        code: 'FACILITY_FEE',
        category: 'facility',
        defaultPrice: 300,
        taxable: true,
        glCode: '4300',
      },
    }),
  ]);

  console.log('✅ Created Phuket charge types');

  // ============================================================================
  // 6f. PHUKET — BOOKINGS FOR ANAN
  // ============================================================================
  console.log('Creating Phuket bookings for Anan...');

  const phuketPool1 = phuketResources.find((r) => r.code === 'POOL1');
  const phuketGym1 = phuketResources.find((r) => r.code === 'GYM1');
  const phuketRest1 = phuketResources.find((r) => r.code === 'REST1');
  const phuketRest2 = phuketResources.find((r) => r.code === 'REST2');

  const phuketBookings = [
    {
      bookingNumber: 'BK-PH-0001',
      bookingType: BookingType.FACILITY,
      facilityId: phuketPoolFacility.id,
      resourceId: phuketPool1?.id,
      startTime: dayOffset(1, 8, 0),
      endTime: dayOffset(1, 9, 0),
      durationMinutes: 60,
      basePrice: 0,
      status: BookingStatus.CONFIRMED,
    },
    {
      bookingNumber: 'BK-PH-0002',
      bookingType: BookingType.FACILITY,
      facilityId: phuketGymFacility.id,
      resourceId: phuketGym1?.id,
      startTime: dayOffset(2, 7, 0),
      endTime: dayOffset(2, 8, 30),
      durationMinutes: 90,
      basePrice: 0,
      status: BookingStatus.CONFIRMED,
    },
    {
      bookingNumber: 'BK-PH-0003',
      bookingType: BookingType.FACILITY,
      facilityId: phuketRestaurant.id,
      resourceId: phuketRest1?.id,
      startTime: dayOffset(3, 19, 0),
      endTime: dayOffset(3, 20, 30),
      durationMinutes: 90,
      basePrice: 0,
      status: BookingStatus.PENDING,
    },
    {
      bookingNumber: 'BK-PH-0004',
      bookingType: BookingType.FACILITY,
      facilityId: phuketRestaurant.id,
      resourceId: phuketRest2?.id,
      startTime: dayOffset(-2, 19, 0),
      endTime: dayOffset(-2, 20, 30),
      durationMinutes: 90,
      basePrice: 0,
      status: BookingStatus.COMPLETED,
    },
  ];

  for (const pb of phuketBookings) {
    const existing = await prisma.booking.findFirst({
      where: { clubId: phuketClub.id, bookingNumber: pb.bookingNumber },
    });
    if (existing) continue;

    await prisma.booking.create({
      data: {
        clubId: phuketClub.id,
        bookingNumber: pb.bookingNumber,
        bookingType: pb.bookingType,
        memberId: anan.id,
        facilityId: pb.facilityId,
        resourceId: pb.resourceId,
        startTime: pb.startTime,
        endTime: pb.endTime,
        durationMinutes: pb.durationMinutes,
        basePrice: pb.basePrice,
        totalAmount: pb.basePrice,
        status: pb.status,
        bookingPaymentMethod: BookingPaymentMethod.ON_ACCOUNT,
        bookingPaymentStatus: pb.status === BookingStatus.COMPLETED ? BookingPaymentStatus.PAID : BookingPaymentStatus.PENDING,
      },
    });
  }

  console.log(`✅ Created ${phuketBookings.length} Phuket bookings for Anan`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('');
  console.log('🎉 Multi-tenancy seed completed successfully!');
  console.log('');
  console.log('New demo credentials:');
  console.log('');
  console.log('  Staff App (Phuket Ocean Club):');
  console.log('    admin@phuketoceanclub.com / Admin123!');
  console.log('');
  console.log('  Member Portal:');
  console.log('    nattaya@demo.com / Member123!     (Full Member, Royal Bangkok)');
  console.log('    thaksin@demo.com / Member123!     (Golf Member, Royal Bangkok)');
  console.log('    chaiwat@demo.com / Member123!     (Social Member, Royal Bangkok)');
  console.log('    corporate@demo.com / Member123!   (Corporate Member, Royal Bangkok)');
  console.log('    phuket@demo.com / Member123!      (Full Member, Phuket Ocean)');
  console.log('');
}

// Standalone execution
if (require.main === module) {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  seedMultitenancy(prisma)
    .catch((e) => {
      console.error('❌ Multi-tenancy seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
