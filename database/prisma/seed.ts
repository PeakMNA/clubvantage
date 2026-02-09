/**
 * ClubVantage Database Seed Script
 * Creates sample data for development and testing
 */

import { PrismaClient, Region, SubscriptionTier, MemberStatus, UserRole, InvoiceStatus, PaymentMethod, BookingStatus, PlayerType, CartType, SkillLevel, BookingType, BookingPaymentMethod, BookingPaymentStatus, VariationPriceType, WaitlistStatus, ApplicationStatus, LineItemType, TaxType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { seedLookups } from './seed-lookups';
import { seedMultitenancy } from './seed-multitenancy';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // DEMO CLUB (Thailand)
  // ============================================================================
  console.log('Creating demo club...');

  const demoClub = await prisma.club.upsert({
    where: { slug: 'royal-bangkok-club' },
    update: {},
    create: {
      name: 'Royal Bangkok Sports Club',
      slug: 'royal-bangkok-club',
      region: Region.TH,
      timezone: 'Asia/Bangkok',
      currency: 'THB',
      taxRate: 7,
      taxType: 'VAT',
      address: '1 Henri Dunant Street, Pathum Wan, Bangkok 10330',
      phone: '+66 2 652 0000',
      email: 'info@royalbangkokclub.com',
      subscriptionTier: SubscriptionTier.PROFESSIONAL,
      maxMembers: 2000,
      maxUsers: 50,
      features: {
        golf: true,
        facility: true,
        billing: true,
        leads: true,
        reports: true,
      },
    },
  });

  console.log(`✅ Created club: ${demoClub.name}`);

  // ============================================================================
  // MEMBERSHIP TYPES
  // ============================================================================
  console.log('Creating membership types...');

  const membershipTypes = await Promise.all([
    prisma.membershipType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'FULL' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Full Member',
        code: 'FULL',
        description: 'Full access to all club facilities and benefits',
        monthlyFee: 15000,
        annualFee: 150000,
        joiningFee: 500000,
        allowGuests: true,
        maxGuestsPerBooking: 3,
        allowFamilyMembers: true,
        maxFamilyMembers: 4,
        bookingAdvanceDays: 14,
        priorityBooking: true,
        sortOrder: 1,
      },
    }),
    prisma.membershipType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'SOCIAL' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Social Member',
        code: 'SOCIAL',
        description: 'Access to dining and social facilities',
        monthlyFee: 5000,
        annualFee: 50000,
        joiningFee: 100000,
        allowGuests: true,
        maxGuestsPerBooking: 2,
        allowFamilyMembers: true,
        maxFamilyMembers: 2,
        bookingAdvanceDays: 7,
        priorityBooking: false,
        sortOrder: 2,
      },
    }),
    prisma.membershipType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'GOLF' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Golf Member',
        code: 'GOLF',
        description: 'Golf course access and facilities',
        monthlyFee: 12000,
        annualFee: 120000,
        joiningFee: 300000,
        allowGuests: true,
        maxGuestsPerBooking: 3,
        allowFamilyMembers: false,
        maxFamilyMembers: 0,
        bookingAdvanceDays: 7,
        priorityBooking: true,
        sortOrder: 3,
      },
    }),
    prisma.membershipType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'JUNIOR' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Junior Member',
        code: 'JUNIOR',
        description: 'For members under 30 years old',
        monthlyFee: 3000,
        annualFee: 30000,
        joiningFee: 50000,
        minAge: 18,
        maxAge: 30,
        allowGuests: true,
        maxGuestsPerBooking: 1,
        allowFamilyMembers: false,
        maxFamilyMembers: 0,
        bookingAdvanceDays: 3,
        priorityBooking: false,
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${membershipTypes.length} membership types`);

  // ============================================================================
  // CHARGE TYPES
  // ============================================================================
  console.log('Creating charge types...');

  const chargeTypes = await Promise.all([
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'MONTHLY_FEE' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Monthly Membership Fee',
        code: 'MONTHLY_FEE',
        category: 'membership',
        taxable: true,
        glCode: '4100',
      },
    }),
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'GREEN_FEE' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Green Fee',
        code: 'GREEN_FEE',
        category: 'golf',
        defaultPrice: 2500,
        taxable: true,
        glCode: '4200',
      },
    }),
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'CART_FEE' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Cart Fee',
        code: 'CART_FEE',
        category: 'golf',
        defaultPrice: 800,
        taxable: true,
        glCode: '4210',
      },
    }),
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'CADDY_FEE' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Caddy Fee',
        code: 'CADDY_FEE',
        category: 'golf',
        defaultPrice: 450,
        taxable: false,
        glCode: '4220',
      },
    }),
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'TENNIS_COURT' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Tennis Court Rental',
        code: 'TENNIS_COURT',
        category: 'facility',
        defaultPrice: 500,
        taxable: true,
        glCode: '4300',
      },
    }),
    prisma.chargeType.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'FB_CHARGE' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Food & Beverage',
        code: 'FB_CHARGE',
        category: 'fb',
        taxable: true,
        glCode: '4400',
      },
    }),
  ]);

  console.log(`✅ Created ${chargeTypes.length} charge types`);

  // ============================================================================
  // FACILITIES
  // ============================================================================
  console.log('Creating facilities...');

  const facilities = await Promise.all([
    prisma.facility.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'TENNIS' } },
      update: { imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80' },
      create: {
        clubId: demoClub.id,
        name: 'Tennis Courts',
        code: 'TENNIS',
        category: 'COURT',
        description: 'Professional tennis courts with floodlighting',
        imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
        capacity: 4,
        bookingDuration: 60,
        maxAdvanceDays: 7,
        memberRate: 500,
        guestRate: 800,
        operatingHours: {
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '06:00', close: '22:00' },
          sunday: { open: '06:00', close: '20:00' },
        },
        amenities: ['floodlights', 'equipment_rental', 'coaching'],
      },
    }),
    prisma.facility.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'GYM' } },
      update: { imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
      create: {
        clubId: demoClub.id,
        name: 'Fitness Center',
        code: 'GYM',
        category: 'STUDIO',
        description: 'State-of-the-art fitness equipment',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        capacity: 50,
        bookingDuration: 120,
        maxAdvanceDays: 1,
        memberRate: 0,
        guestRate: 500,
        requiresApproval: false,
        allowGuests: true,
        maxGuests: 1,
        operatingHours: {
          monday: { open: '05:00', close: '23:00' },
          tuesday: { open: '05:00', close: '23:00' },
          wednesday: { open: '05:00', close: '23:00' },
          thursday: { open: '05:00', close: '23:00' },
          friday: { open: '05:00', close: '23:00' },
          saturday: { open: '06:00', close: '22:00' },
          sunday: { open: '06:00', close: '20:00' },
        },
        amenities: ['cardio', 'weights', 'personal_training', 'lockers'],
      },
    }),
    prisma.facility.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'POOL' } },
      update: { imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80' },
      create: {
        clubId: demoClub.id,
        name: 'Swimming Pool',
        code: 'POOL',
        category: 'POOL',
        description: 'Olympic-size swimming pool',
        imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
        capacity: 30,
        bookingDuration: 60,
        maxAdvanceDays: 1,
        memberRate: 0,
        guestRate: 300,
        operatingHours: {
          monday: { open: '06:00', close: '21:00' },
          tuesday: { open: '06:00', close: '21:00' },
          wednesday: { open: '06:00', close: '21:00' },
          thursday: { open: '06:00', close: '21:00' },
          friday: { open: '06:00', close: '21:00' },
          saturday: { open: '06:00', close: '21:00' },
          sunday: { open: '06:00', close: '20:00' },
        },
        amenities: ['lap_lanes', 'kids_pool', 'jacuzzi'],
      },
    }),
    prisma.facility.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'CLUBHOUSE_DINING' } },
      update: { imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' },
      create: {
        clubId: demoClub.id,
        name: 'The Verandah',
        code: 'CLUBHOUSE_DINING',
        category: 'DINING',
        description: 'Fine dining restaurant overlooking the 18th green. Thai and international cuisine.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        capacity: 80,
        bookingDuration: 90,
        minAdvanceHours: 2,
        maxAdvanceDays: 30,
        cancellationHours: 4,
        memberRate: 0,
        guestRate: 0,
        operatingHours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '10:00', close: '21:00' },
        },
        amenities: ['outdoor_terrace', 'private_dining', 'wine_bar'],
      },
    }),
    prisma.facility.upsert({
      where: { clubId_code: { clubId: demoClub.id, code: 'POOLSIDE_BAR' } },
      update: { imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80' },
      create: {
        clubId: demoClub.id,
        name: 'Poolside Bar & Grill',
        code: 'POOLSIDE_BAR',
        category: 'DINING',
        description: 'Casual dining by the pool. Light bites, grilled specialties, and refreshing cocktails.',
        imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
        capacity: 40,
        bookingDuration: 60,
        minAdvanceHours: 1,
        maxAdvanceDays: 14,
        cancellationHours: 2,
        memberRate: 0,
        guestRate: 0,
        operatingHours: {
          monday: { open: '10:00', close: '20:00' },
          tuesday: { open: '10:00', close: '20:00' },
          wednesday: { open: '10:00', close: '20:00' },
          thursday: { open: '10:00', close: '20:00' },
          friday: { open: '10:00', close: '21:00' },
          saturday: { open: '09:00', close: '21:00' },
          sunday: { open: '09:00', close: '20:00' },
        },
        amenities: ['poolside_seating', 'live_music_fri', 'kids_menu'],
      },
    }),
  ]);

  console.log(`✅ Created ${facilities.length} facilities`);

  // ============================================================================
  // RESOURCES (Individual bookable units within facilities)
  // ============================================================================
  console.log('Creating resources...');

  const tennisCourtFacilityForRes = facilities.find(f => f.code === 'TENNIS')!;
  const gymFacilityForRes = facilities.find(f => f.code === 'GYM')!;
  const poolFacilityForRes = facilities.find(f => f.code === 'POOL')!;
  const verandahFacilityForRes = facilities.find(f => f.code === 'CLUBHOUSE_DINING')!;
  const poolsideBarFacilityForRes = facilities.find(f => f.code === 'POOLSIDE_BAR')!;

  const resourceData = [
    // Tennis Courts
    { facilityId: tennisCourtFacilityForRes.id, name: 'Tennis Court 1', code: 'TC1', capacity: 4 },
    { facilityId: tennisCourtFacilityForRes.id, name: 'Tennis Court 2', code: 'TC2', capacity: 4 },
    { facilityId: tennisCourtFacilityForRes.id, name: 'Tennis Court 3', code: 'TC3', capacity: 4 },
    { facilityId: tennisCourtFacilityForRes.id, name: 'Tennis Court 4', code: 'TC4', capacity: 4 },
    // Gym Studios
    { facilityId: gymFacilityForRes.id, name: 'Main Gym Floor', code: 'GYM1', capacity: 50 },
    { facilityId: gymFacilityForRes.id, name: 'Yoga Studio', code: 'YOGA1', capacity: 20 },
    { facilityId: gymFacilityForRes.id, name: 'Spinning Room', code: 'SPIN1', capacity: 15 },
    // Swimming Pool
    { facilityId: poolFacilityForRes.id, name: 'Olympic Pool', code: 'POOL1', capacity: 30 },
    { facilityId: poolFacilityForRes.id, name: 'Kids Pool', code: 'POOL2', capacity: 15 },
    { facilityId: poolFacilityForRes.id, name: 'Lap Pool', code: 'LAP1', capacity: 10 },
    // Dining - The Verandah
    { facilityId: verandahFacilityForRes.id, name: 'Table 1 (Window)', code: 'VRD1', capacity: 4 },
    { facilityId: verandahFacilityForRes.id, name: 'Table 2 (Window)', code: 'VRD2', capacity: 4 },
    { facilityId: verandahFacilityForRes.id, name: 'Table 3 (Terrace)', code: 'VRD3', capacity: 6 },
    { facilityId: verandahFacilityForRes.id, name: 'Private Dining Room', code: 'VRD-PDR', capacity: 12 },
    // Dining - Poolside Bar
    { facilityId: poolsideBarFacilityForRes.id, name: 'Poolside Table 1', code: 'PSB1', capacity: 4 },
    { facilityId: poolsideBarFacilityForRes.id, name: 'Poolside Table 2', code: 'PSB2', capacity: 4 },
    { facilityId: poolsideBarFacilityForRes.id, name: 'Bar Counter', code: 'PSB-BAR', capacity: 6 },
  ];

  const resources = await Promise.all(
    resourceData.map(async (r, i) => {
      const existing = await prisma.resource.findFirst({
        where: { facilityId: r.facilityId, code: r.code }
      });

      if (existing) return existing;

      return prisma.resource.create({
        data: {
          clubId: demoClub.id,
          facilityId: r.facilityId,
          name: r.name,
          code: r.code,
          capacity: r.capacity,
          sortOrder: i,
        }
      });
    })
  );

  console.log(`✅ Created ${resources.length} resources`);

  // ============================================================================
  // GOLF COURSE
  // ============================================================================
  console.log('Creating golf course...');

  const golfCourse = await prisma.golfCourse.upsert({
    where: { clubId_code: { clubId: demoClub.id, code: 'MAIN' } },
    update: { imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80' },
    create: {
      clubId: demoClub.id,
      name: 'Championship Course',
      code: 'MAIN',
      description: 'Par 72 championship golf course',
      imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
      holes: 18,
      par: 72,
      yardage: 7200,
      rating: 74.5,
      slope: 138,
      firstTeeTime: '06:00',
      lastTeeTime: '15:00',
      teeInterval: 8,
      maxPlayers: 4,
      memberAdvanceDays: 7,
      guestAdvanceDays: 3,
      cancellationHours: 24,
    },
  });

  console.log(`✅ Created golf course: ${golfCourse.name}`);

  // ============================================================================
  // CLUB GOLF SETTINGS
  // ============================================================================
  console.log('Creating club golf settings...');

  const golfSettings = await prisma.clubGolfSettings.upsert({
    where: { clubId: demoClub.id },
    update: {},
    create: {
      clubId: demoClub.id,
      cartPolicy: 'OPTIONAL',
      rentalPolicy: 'OPTIONAL',
      caddyDrivesCart: true, // Asian mode default
      maxGuestsPerMember: 3,
      requireGuestContact: false,
    },
  });

  console.log(`✅ Created golf settings for club: ${demoClub.name}`);

  // ============================================================================
  // CHECK-IN PAYMENT METHODS
  // ============================================================================
  console.log('Creating check-in payment methods...');

  const cashPaymentMethod = await prisma.checkInPaymentMethod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      clubId: demoClub.id,
      name: 'Cash',
      icon: 'banknote',
      type: 'CASH',
      isEnabled: true,
      requiresRef: false,
      opensPOS: false,
      sortOrder: 0,
    },
  });

  const cardPaymentMethod = await prisma.checkInPaymentMethod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      clubId: demoClub.id,
      name: 'Card',
      icon: 'credit-card',
      type: 'CARD',
      isEnabled: true,
      requiresRef: true,
      opensPOS: true,
      sortOrder: 1,
    },
  });

  const memberAccountMethod = await prisma.checkInPaymentMethod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      clubId: demoClub.id,
      name: 'Member Account',
      icon: 'user',
      type: 'MEMBER_ACCOUNT',
      isEnabled: true,
      requiresRef: false,
      opensPOS: false,
      sortOrder: 2,
    },
  });

  console.log('✅ Created check-in payment methods');

  // ============================================================================
  // GOLF SCHEDULE CONFIGURATION
  // ============================================================================
  console.log('Creating golf schedule configuration...');

  // Delete existing schedule config and related data to ensure clean state
  const existingConfig = await prisma.golfScheduleConfig.findUnique({ where: { courseId: golfCourse.id } });
  if (existingConfig) {
    await prisma.golfScheduleSpecialDay.deleteMany({ where: { scheduleId: existingConfig.id } });
    await prisma.golfScheduleSeason.deleteMany({ where: { scheduleId: existingConfig.id } });
    await prisma.golfScheduleTimePeriod.deleteMany({ where: { scheduleId: existingConfig.id } });
    await prisma.golfScheduleConfig.delete({ where: { id: existingConfig.id } });
  }

  const scheduleConfig = await prisma.golfScheduleConfig.upsert({
    where: { courseId: golfCourse.id },
    update: {},
    create: {
      courseId: golfCourse.id,
      weekdayFirstTee: '06:00',
      weekdayLastTee: '17:00',
      weekendFirstTee: '06:00',  // Same as weekday
      weekendLastTee: '17:30',
      twilightMode: 'FIXED',
      twilightMinutesBeforeSunset: 90,
      twilightFixedDefault: '16:00',
      defaultBookingWindowDays: 7,
      timePeriods: {
        create: [
          {
            name: 'Early Bird',
            startTime: '06:00',
            endTime: '07:00',
            intervalMinutes: 8,
            isPrimeTime: false,
            applicableDays: 'ALL',
            sortOrder: 0,
          },
          {
            name: 'Prime Morning',
            startTime: '07:00',
            endTime: '10:00',
            intervalMinutes: 8,
            isPrimeTime: true,
            applicableDays: 'ALL',
            sortOrder: 1,
          },
          {
            name: 'Midday',
            startTime: '10:00',
            endTime: '14:00',
            intervalMinutes: 8,
            isPrimeTime: false,
            applicableDays: 'ALL',
            sortOrder: 2,
          },
          {
            name: 'Prime Afternoon',
            startTime: '14:00',
            endTime: '16:00',
            intervalMinutes: 8,
            isPrimeTime: true,
            applicableDays: 'ALL',
            sortOrder: 3,
          },
          {
            name: 'Twilight',
            startTime: '16:00',
            endTime: null,
            intervalMinutes: 8,
            isPrimeTime: false,
            applicableDays: 'ALL',
            sortOrder: 4,
          },
        ],
      },
      seasons: {
        create: [
          {
            name: 'High Season',
            startMonth: 11,
            startDay: 1,
            endMonth: 2,
            endDay: 28,
            isRecurring: true,
            priority: 2,
            overrideFirstTee: '06:00',
            overrideLastTee: '18:00',
            overrideTimePeriods: false,
          },
          {
            name: 'Low Season',
            startMonth: 5,
            startDay: 1,
            endMonth: 9,
            endDay: 30,
            isRecurring: true,
            priority: 1,
            overrideFirstTee: '06:30',
            overrideLastTee: '16:30',
            overrideTimePeriods: false,
          },
        ],
      },
      specialDays: {
        create: [
          {
            name: 'New Year\'s Day',
            startDate: '01-01',
            endDate: '01-01',
            isRecurring: true,
            type: 'HOLIDAY',
          },
          {
            name: 'Songkran',
            startDate: '04-13',
            endDate: '04-15',
            isRecurring: true,
            type: 'HOLIDAY',
          },
          {
            name: 'Course Maintenance',
            startDate: '2025-03-15',
            endDate: '2025-03-16',
            isRecurring: false,
            type: 'CLOSED',
            notes: 'Annual aeration and overseeding',
          },
        ],
      },
    },
  });

  console.log(`✅ Created schedule config with ${scheduleConfig.id}`);

  // ============================================================================
  // PRO SHOP CATEGORIES & PRODUCTS
  // ============================================================================
  console.log('Creating pro shop categories and products...');

  // Create pro shop categories
  const proshopCategories = await Promise.all([
    prisma.proshopCategory.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        clubId: demoClub.id,
        name: 'Apparel',
        description: 'Golf clothing and accessories',
        defaultTaxRate: 7,
        defaultTaxType: 'ADD',
        sortOrder: 1,
      },
    }),
    prisma.proshopCategory.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        clubId: demoClub.id,
        name: 'Equipment',
        description: 'Golf balls, tees, and accessories',
        defaultTaxRate: 7,
        defaultTaxType: 'ADD',
        sortOrder: 2,
      },
    }),
    prisma.proshopCategory.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        clubId: demoClub.id,
        name: 'Beverages',
        description: 'Drinks and refreshments',
        defaultTaxRate: 7,
        defaultTaxType: 'ADD',
        sortOrder: 3,
      },
    }),
    prisma.proshopCategory.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        clubId: demoClub.id,
        name: 'Snacks',
        description: 'Food and snacks',
        defaultTaxRate: 7,
        defaultTaxType: 'ADD',
        sortOrder: 4,
      },
    }),
    prisma.proshopCategory.upsert({
      where: { id: '00000000-0000-0000-0000-000000000005' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000005',
        clubId: demoClub.id,
        name: 'Rentals',
        description: 'Equipment rentals',
        defaultTaxRate: 7,
        defaultTaxType: 'ADD',
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${proshopCategories.length} pro shop categories`);

  // Create pro shop products
  const proshopProducts = await Promise.all([
    // Apparel
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'APP-POLO-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[0].id,
        name: 'Club Logo Polo Shirt',
        description: 'Premium cotton polo with embroidered club logo',
        sku: 'APP-POLO-001',
        price: 1800,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: false,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'APP-HAT-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[0].id,
        name: 'Club Logo Cap',
        description: 'Adjustable golf cap with club logo',
        sku: 'APP-HAT-001',
        price: 650,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'APP-GLOVE-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[0].id,
        name: 'Golf Glove - Leather',
        description: 'Premium leather golf glove',
        sku: 'APP-GLOVE-001',
        price: 450,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),

    // Equipment
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'EQP-BALL-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[1].id,
        name: 'Golf Balls (Sleeve of 3)',
        description: 'Premium golf balls - pack of 3',
        sku: 'EQP-BALL-001',
        price: 180,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'EQP-BALL-002' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[1].id,
        name: 'Golf Balls (Dozen)',
        description: 'Premium golf balls - box of 12',
        sku: 'EQP-BALL-002',
        price: 650,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: false,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'EQP-TEE-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[1].id,
        name: 'Wooden Tees (Pack of 50)',
        description: 'Natural wood tees',
        sku: 'EQP-TEE-001',
        price: 80,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'EQP-TOWEL-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[1].id,
        name: 'Golf Towel',
        description: 'Microfiber golf towel with club logo',
        sku: 'EQP-TOWEL-001',
        price: 350,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'EQP-MARKER-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[1].id,
        name: 'Ball Marker (Club Logo)',
        description: 'Metal ball marker with magnetic clip',
        sku: 'EQP-MARKER-001',
        price: 150,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),

    // Beverages
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'BEV-WATER-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[2].id,
        name: 'Bottled Water',
        description: 'Cold mineral water 500ml',
        sku: 'BEV-WATER-001',
        price: 40,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'BEV-SPORT-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[2].id,
        name: 'Sports Drink',
        description: 'Electrolyte sports drink 500ml',
        sku: 'BEV-SPORT-001',
        price: 60,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'BEV-BEER-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[2].id,
        name: 'Beer (Domestic)',
        description: 'Cold domestic beer 330ml',
        sku: 'BEV-BEER-001',
        price: 120,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'BEV-BEER-002' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[2].id,
        name: 'Beer (Premium Import)',
        description: 'Cold premium imported beer 330ml',
        sku: 'BEV-BEER-002',
        price: 180,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'BEV-SODA-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[2].id,
        name: 'Soft Drink',
        description: 'Cold soft drink 330ml',
        sku: 'BEV-SODA-001',
        price: 50,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),

    // Snacks
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'SNK-SAND-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[3].id,
        name: 'Club Sandwich',
        description: 'Fresh club sandwich with chips',
        sku: 'SNK-SAND-001',
        price: 250,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: false,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'SNK-NUTS-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[3].id,
        name: 'Mixed Nuts',
        description: 'Salted mixed nuts pack',
        sku: 'SNK-NUTS-001',
        price: 80,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'SNK-CHOC-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[3].id,
        name: 'Chocolate Bar',
        description: 'Premium chocolate bar',
        sku: 'SNK-CHOC-001',
        price: 65,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'SNK-ENERGY-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[3].id,
        name: 'Energy Bar',
        description: 'High-protein energy bar',
        sku: 'SNK-ENERGY-001',
        price: 90,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),

    // Rentals
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'RNT-CLUB-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[4].id,
        name: 'Club Set Rental',
        description: 'Full set of premium clubs rental',
        sku: 'RNT-CLUB-001',
        price: 800,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: false,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'RNT-SHOE-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[4].id,
        name: 'Golf Shoes Rental',
        description: 'Golf shoes rental',
        sku: 'RNT-SHOE-001',
        price: 300,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: false,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'RNT-RANGE-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[4].id,
        name: 'Range Finder Rental',
        description: 'GPS range finder rental',
        sku: 'RNT-RANGE-001',
        price: 400,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: false,
      },
    }),
    prisma.proshopProduct.upsert({
      where: { clubId_sku: { clubId: demoClub.id, sku: 'RNT-UMBRELLA-001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        categoryId: proshopCategories[4].id,
        name: 'Umbrella Rental',
        description: 'Golf umbrella rental',
        sku: 'RNT-UMBRELLA-001',
        price: 150,
        taxRate: 7,
        taxType: 'ADD',
        isQuickAdd: true,
      },
    }),
  ]);

  console.log(`✅ Created ${proshopProducts.length} pro shop products`);

  // Create some product variants (sizes for polo shirts and gloves)
  const poloProduct = proshopProducts.find(p => p.sku === 'APP-POLO-001');
  const gloveProduct = proshopProducts.find(p => p.sku === 'APP-GLOVE-001');

  if (poloProduct) {
    await Promise.all([
      prisma.proshopVariant.upsert({
        where: { id: '00000000-0000-0000-0001-000000000001' },
        update: {},
        create: {
          id: '00000000-0000-0000-0001-000000000001',
          productId: poloProduct.id,
          name: 'Small',
          sku: 'APP-POLO-001-S',
          priceAdjustment: 0,
        },
      }),
      prisma.proshopVariant.upsert({
        where: { id: '00000000-0000-0000-0001-000000000002' },
        update: {},
        create: {
          id: '00000000-0000-0000-0001-000000000002',
          productId: poloProduct.id,
          name: 'Medium',
          sku: 'APP-POLO-001-M',
          priceAdjustment: 0,
        },
      }),
      prisma.proshopVariant.upsert({
        where: { id: '00000000-0000-0000-0001-000000000003' },
        update: {},
        create: {
          id: '00000000-0000-0000-0001-000000000003',
          productId: poloProduct.id,
          name: 'Large',
          sku: 'APP-POLO-001-L',
          priceAdjustment: 0,
        },
      }),
      prisma.proshopVariant.upsert({
        where: { id: '00000000-0000-0000-0001-000000000004' },
        update: {},
        create: {
          id: '00000000-0000-0000-0001-000000000004',
          productId: poloProduct.id,
          name: 'X-Large',
          sku: 'APP-POLO-001-XL',
          priceAdjustment: 100,
        },
      }),
    ]);
    console.log('✅ Created polo shirt variants');
  }

  if (gloveProduct) {
    await Promise.all([
      prisma.proshopVariant.upsert({
        where: { id: '00000000-0000-0000-0002-000000000001' },
        update: {},
        create: {
          id: '00000000-0000-0000-0002-000000000001',
          productId: gloveProduct.id,
          name: 'S/M Left Hand',
          sku: 'APP-GLOVE-001-SML',
          priceAdjustment: 0,
        },
      }),
      prisma.proshopVariant.upsert({
        where: { id: '00000000-0000-0000-0002-000000000002' },
        update: {},
        create: {
          id: '00000000-0000-0000-0002-000000000002',
          productId: gloveProduct.id,
          name: 'M/L Left Hand',
          sku: 'APP-GLOVE-001-MLL',
          priceAdjustment: 0,
        },
      }),
      prisma.proshopVariant.upsert({
        where: { id: '00000000-0000-0000-0002-000000000003' },
        update: {},
        create: {
          id: '00000000-0000-0000-0002-000000000003',
          productId: gloveProduct.id,
          name: 'S/M Right Hand',
          sku: 'APP-GLOVE-001-SMR',
          priceAdjustment: 0,
        },
      }),
      prisma.proshopVariant.upsert({
        where: { id: '00000000-0000-0000-0002-000000000004' },
        update: {},
        create: {
          id: '00000000-0000-0000-0002-000000000004',
          productId: gloveProduct.id,
          name: 'M/L Right Hand',
          sku: 'APP-GLOVE-001-MLR',
          priceAdjustment: 0,
        },
      }),
    ]);
    console.log('✅ Created golf glove variants');
  }

  // ============================================================================
  // CADDIES
  // ============================================================================
  console.log('Creating caddies...');

  const caddyNames = [
    { firstName: 'สมชาย', lastName: 'ใจดี', phone: '+66 81 111 0001' },
    { firstName: 'สมหญิง', lastName: 'รักดี', phone: '+66 81 111 0002' },
    { firstName: 'ประยุทธ์', lastName: 'มั่นคง', phone: '+66 81 111 0003' },
    { firstName: 'นภา', lastName: 'สุขใจ', phone: '+66 81 111 0004' },
    { firstName: 'วิชัย', lastName: 'เก่งกล้า', phone: '+66 81 111 0005' },
    { firstName: 'สุดา', lastName: 'น่ารัก', phone: '+66 81 111 0006' },
    { firstName: 'ธนา', lastName: 'รุ่งเรือง', phone: '+66 81 111 0007' },
    { firstName: 'พรทิพย์', lastName: 'งามตา', phone: '+66 81 111 0008' },
    { firstName: 'อนุชา', lastName: 'แข็งแรง', phone: '+66 81 111 0009' },
    { firstName: 'มาลี', lastName: 'สดใส', phone: '+66 81 111 0010' },
    { firstName: 'สมศักดิ์', lastName: 'ภักดี', phone: '+66 81 111 0011' },
    { firstName: 'รัตนา', lastName: 'ประเสริฐ', phone: '+66 81 111 0012' },
    { firstName: 'ชัยวัฒน์', lastName: 'พัฒนา', phone: '+66 81 111 0013' },
    { firstName: 'วันดี', lastName: 'โชคดี', phone: '+66 81 111 0014' },
    { firstName: 'ประสิทธิ์', lastName: 'สำเร็จ', phone: '+66 81 111 0015' },
    { firstName: 'ศิริพร', lastName: 'มงคล', phone: '+66 81 111 0016' },
    { firstName: 'อภิชาติ', lastName: 'เจริญ', phone: '+66 81 111 0017' },
    { firstName: 'กัลยา', lastName: 'สว่าง', phone: '+66 81 111 0018' },
    { firstName: 'วรพจน์', lastName: 'ยิ่งใหญ่', phone: '+66 81 111 0019' },
    { firstName: 'ปราณี', lastName: 'อุดม', phone: '+66 81 111 0020' },
  ];

  const caddies = await Promise.all(
    caddyNames.map((c, i) => {
      const num = String(i + 1).padStart(3, '0');
      return prisma.caddy.upsert({
        where: { clubId_caddyNumber: { clubId: demoClub.id, caddyNumber: num } },
        update: {},
        create: {
          clubId: demoClub.id,
          caddyNumber: num,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
          experience: Math.floor(Math.random() * 10) + 1,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        },
      });
    })
  );

  console.log(`✅ Created ${caddies.length} caddies`);

  // ============================================================================
  // GOLF RATE CONFIGURATION
  // ============================================================================
  console.log('Creating golf rate configuration...');

  // Find existing rate config or create new one
  let rateConfig = await prisma.golfRateConfig.findFirst({
    where: {
      clubId: demoClub.id,
      courseId: golfCourse.id,
      name: 'Standard Rates 2026',
    },
  });

  if (!rateConfig) {
    rateConfig = await prisma.golfRateConfig.create({
      data: {
        clubId: demoClub.id,
        courseId: golfCourse.id,
        name: 'Standard Rates 2026',
        description: 'Default rate configuration for 2026 season',
        isActive: true,
        effectiveFrom: new Date('2026-01-01'),
        effectiveTo: null,
      },
    });
  }

  console.log(`✅ Created rate config: ${rateConfig.name}`);

  // Green Fee Rates
  console.log('Creating green fee rates...');

  const greenFeeRates = [
    // Members - discounted/included in membership
    { playerType: 'MEMBER', holes: 18, timeCategory: 'STANDARD', amount: 50, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'MEMBER', holes: 9, timeCategory: 'STANDARD', amount: 30, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'MEMBER', holes: 18, timeCategory: 'PRIME_TIME', amount: 65, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'MEMBER', holes: 9, timeCategory: 'PRIME_TIME', amount: 40, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'MEMBER', holes: 18, timeCategory: 'OFF_PEAK', amount: 35, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'MEMBER', holes: 9, timeCategory: 'OFF_PEAK', amount: 20, taxType: 'INCLUDE', taxRate: 7 },

    // Guests - full price
    { playerType: 'GUEST', holes: 18, timeCategory: 'STANDARD', amount: 150, taxType: 'ADD', taxRate: 7 },
    { playerType: 'GUEST', holes: 9, timeCategory: 'STANDARD', amount: 90, taxType: 'ADD', taxRate: 7 },
    { playerType: 'GUEST', holes: 18, timeCategory: 'PRIME_TIME', amount: 180, taxType: 'ADD', taxRate: 7 },
    { playerType: 'GUEST', holes: 9, timeCategory: 'PRIME_TIME', amount: 110, taxType: 'ADD', taxRate: 7 },
    { playerType: 'GUEST', holes: 18, timeCategory: 'OFF_PEAK', amount: 120, taxType: 'ADD', taxRate: 7 },
    { playerType: 'GUEST', holes: 9, timeCategory: 'OFF_PEAK', amount: 70, taxType: 'ADD', taxRate: 7 },

    // Dependents - reduced rate
    { playerType: 'DEPENDENT', holes: 18, timeCategory: 'STANDARD', amount: 75, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'DEPENDENT', holes: 9, timeCategory: 'STANDARD', amount: 45, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'DEPENDENT', holes: 18, timeCategory: 'PRIME_TIME', amount: 90, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'DEPENDENT', holes: 9, timeCategory: 'PRIME_TIME', amount: 55, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'DEPENDENT', holes: 18, timeCategory: 'OFF_PEAK', amount: 60, taxType: 'INCLUDE', taxRate: 7 },
    { playerType: 'DEPENDENT', holes: 9, timeCategory: 'OFF_PEAK', amount: 35, taxType: 'INCLUDE', taxRate: 7 },

    // Walk-ups - premium pricing
    { playerType: 'WALK_UP', holes: 18, timeCategory: 'STANDARD', amount: 180, taxType: 'ADD', taxRate: 7 },
    { playerType: 'WALK_UP', holes: 9, timeCategory: 'STANDARD', amount: 110, taxType: 'ADD', taxRate: 7 },
    { playerType: 'WALK_UP', holes: 18, timeCategory: 'PRIME_TIME', amount: 210, taxType: 'ADD', taxRate: 7 },
    { playerType: 'WALK_UP', holes: 9, timeCategory: 'PRIME_TIME', amount: 130, taxType: 'ADD', taxRate: 7 },
    { playerType: 'WALK_UP', holes: 18, timeCategory: 'OFF_PEAK', amount: 150, taxType: 'ADD', taxRate: 7 },
    { playerType: 'WALK_UP', holes: 9, timeCategory: 'OFF_PEAK', amount: 90, taxType: 'ADD', taxRate: 7 },
  ];

  for (const rate of greenFeeRates) {
    await prisma.greenFee.upsert({
      where: {
        rateConfigId_playerType_holes_timeCategory: {
          rateConfigId: rateConfig.id,
          playerType: rate.playerType,
          holes: rate.holes,
          timeCategory: rate.timeCategory,
        },
      },
      update: {},
      create: {
        rateConfigId: rateConfig.id,
        ...rate,
      },
    });
  }

  console.log(`✅ Created ${greenFeeRates.length} green fee rates`);

  // Cart Rates
  console.log('Creating cart rates...');

  const cartRates = [
    { cartType: 'SINGLE', amount: 40, taxType: 'ADD', taxRate: 7 },
    { cartType: 'SHARED', amount: 25, taxType: 'ADD', taxRate: 7 }, // Per person
    { cartType: 'WALKING', amount: 0, taxType: 'NONE', taxRate: 0 },
  ];

  for (const rate of cartRates) {
    await prisma.cartRate.upsert({
      where: {
        rateConfigId_cartType: {
          rateConfigId: rateConfig.id,
          cartType: rate.cartType,
        },
      },
      update: {},
      create: {
        rateConfigId: rateConfig.id,
        ...rate,
      },
    });
  }

  console.log(`✅ Created ${cartRates.length} cart rates`);

  // Caddy Rates
  console.log('Creating caddy rates...');

  const caddyRates = [
    { caddyType: 'FORECADDY', amount: 30, taxType: 'NONE', taxRate: 0 }, // Per player
    { caddyType: 'SINGLE', amount: 80, taxType: 'NONE', taxRate: 0 },
    { caddyType: 'DOUBLE', amount: 50, taxType: 'NONE', taxRate: 0 }, // Per player for shared
  ];

  for (const rate of caddyRates) {
    await prisma.caddyRate.upsert({
      where: {
        rateConfigId_caddyType: {
          rateConfigId: rateConfig.id,
          caddyType: rate.caddyType,
        },
      },
      update: {},
      create: {
        rateConfigId: rateConfig.id,
        ...rate,
      },
    });
  }

  console.log(`✅ Created ${caddyRates.length} caddy rates`);

  // ============================================================================
  // ADMIN USER
  // ============================================================================
  console.log('Creating admin user...');

  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { clubId_email: { clubId: demoClub.id, email: 'admin@royalbangkokclub.com' } },
    update: {},
    create: {
      clubId: demoClub.id,
      email: 'admin@royalbangkokclub.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.TENANT_ADMIN,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);

  // ============================================================================
  // SAMPLE MEMBERS
  // ============================================================================
  console.log('Creating sample members...');

  const fullMemberType = membershipTypes.find((t) => t.code === 'FULL')!;
  const golfMemberType = membershipTypes.find((t) => t.code === 'GOLF')!;
  const socialMemberType = membershipTypes.find((t) => t.code === 'SOCIAL')!;
  const juniorMemberType = membershipTypes.find((t) => t.code === 'JUNIOR')!;

  // Extended member list with varied statuses and membership types
  const extendedMembers = [
    // Active Full Members
    { firstName: 'Somchai', lastName: 'Tanaka', email: 'somchai@example.com', status: MemberStatus.ACTIVE, type: fullMemberType, handicap: 12 },
    { firstName: 'Nattaya', lastName: 'Wong', email: 'nattaya@example.com', status: MemberStatus.ACTIVE, type: fullMemberType, handicap: 18 },
    { firstName: 'Prasit', lastName: 'Lee', email: 'prasit@example.com', status: MemberStatus.ACTIVE, type: fullMemberType, handicap: 8 },
    { firstName: 'Siriporn', lastName: 'Chen', email: 'siriporn@example.com', status: MemberStatus.ACTIVE, type: fullMemberType, handicap: 22 },
    { firstName: 'Wichai', lastName: 'Kim', email: 'wichai@example.com', status: MemberStatus.ACTIVE, type: fullMemberType, handicap: 15 },
    // Active Golf Members
    { firstName: 'Thaksin', lastName: 'Yamamoto', email: 'thaksin@example.com', status: MemberStatus.ACTIVE, type: golfMemberType, handicap: 5 },
    { firstName: 'Pimchanok', lastName: 'Park', email: 'pimchanok@example.com', status: MemberStatus.ACTIVE, type: golfMemberType, handicap: 10 },
    { firstName: 'Anuwat', lastName: 'Nguyen', email: 'anuwat@example.com', status: MemberStatus.ACTIVE, type: golfMemberType, handicap: 16 },
    { firstName: 'Kanokwan', lastName: 'Suzuki', email: 'kanokwan@example.com', status: MemberStatus.ACTIVE, type: golfMemberType, handicap: 20 },
    // Active Social Members
    { firstName: 'Chaiwat', lastName: 'Sato', email: 'chaiwat@example.com', status: MemberStatus.ACTIVE, type: socialMemberType },
    { firstName: 'Pornthip', lastName: 'Ito', email: 'pornthip@example.com', status: MemberStatus.ACTIVE, type: socialMemberType },
    { firstName: 'Surasak', lastName: 'Watanabe', email: 'surasak@example.com', status: MemberStatus.ACTIVE, type: socialMemberType },
    // Active Junior Members
    { firstName: 'Natthapong', lastName: 'Takahashi', email: 'natthapong@example.com', status: MemberStatus.ACTIVE, type: juniorMemberType, handicap: 25 },
    { firstName: 'Supaporn', lastName: 'Tanaka', email: 'supaporn@example.com', status: MemberStatus.ACTIVE, type: juniorMemberType, handicap: 28 },
    // Suspended Members
    { firstName: 'Arthit', lastName: 'Kato', email: 'arthit@example.com', status: MemberStatus.SUSPENDED, type: fullMemberType, handicap: 14 },
    { firstName: 'Sunisa', lastName: 'Nakamura', email: 'sunisa@example.com', status: MemberStatus.SUSPENDED, type: golfMemberType, handicap: 19 },
    // Inactive Members
    { firstName: 'Kittipong', lastName: 'Yamada', email: 'kittipong@example.com', status: MemberStatus.LAPSED, type: fullMemberType, handicap: 11 },
    { firstName: 'Waraporn', lastName: 'Saito', email: 'waraporn@example.com', status: MemberStatus.LAPSED, type: socialMemberType },
    // More Active Members for bookings
    { firstName: 'Pacharapol', lastName: 'Matsuda', email: 'pacharapol@example.com', status: MemberStatus.ACTIVE, type: fullMemberType, handicap: 9 },
    { firstName: 'Sasithorn', lastName: 'Kobayashi', email: 'sasithorn@example.com', status: MemberStatus.ACTIVE, type: fullMemberType, handicap: 17 },
  ];

  const members = await Promise.all(
    extendedMembers.map(async (m, i) => {
      const memberId = `M-${String(i + 1).padStart(4, '0')}`;
      return prisma.member.upsert({
        where: { clubId_memberId: { clubId: demoClub.id, memberId } },
        update: {},
        create: {
          clubId: demoClub.id,
          memberId,
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email,
          membershipTypeId: m.type.id,
          status: m.status,
          joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        },
      });
    })
  );

  console.log(`✅ Created ${members.length} sample members`);

  // ============================================================================
  // INVOICES
  // ============================================================================
  console.log('Creating invoices...');

  const greenFeeChargeType = chargeTypes.find((t) => t.code === 'GREEN_FEE')!;
  const monthlyFeeChargeType = chargeTypes.find((t) => t.code === 'MONTHLY_FEE')!;

  const invoiceData = [
    // Paid invoices
    { memberId: members[0].id, status: InvoiceStatus.PAID, amount: 26750, dueDate: new Date(2025, 0, 6) },
    { memberId: members[1].id, status: InvoiceStatus.PAID, amount: 16050, dueDate: new Date(2025, 0, 6) },
    { memberId: members[2].id, status: InvoiceStatus.PAID, amount: 16050, dueDate: new Date(2024, 11, 6) },
    // Partially paid
    { memberId: members[3].id, status: InvoiceStatus.PARTIALLY_PAID, amount: 135000, dueDate: new Date(2025, 0, 16) },
    // Sent/unpaid
    { memberId: members[4].id, status: InvoiceStatus.SENT, amount: 16050, dueDate: new Date(2025, 0, 6) },
    { memberId: members[5].id, status: InvoiceStatus.SENT, amount: 12840, dueDate: new Date(2025, 0, 6) },
    // Overdue
    { memberId: members[6].id, status: InvoiceStatus.OVERDUE, amount: 16050, dueDate: new Date(2024, 10, 6) },
    { memberId: members[7].id, status: InvoiceStatus.OVERDUE, amount: 16050, dueDate: new Date(2024, 11, 6) },
    // Draft
    { memberId: members[8].id, status: InvoiceStatus.DRAFT, amount: 9095, dueDate: new Date(2025, 0, 7) },
  ];

  const invoices = await Promise.all(
    invoiceData.map(async (inv, i) => {
      const invoiceNumber = `INV-2025-${String(i + 1).padStart(4, '0')}`;
      return prisma.invoice.upsert({
        where: { clubId_invoiceNumber: { clubId: demoClub.id, invoiceNumber } },
        update: {},
        create: {
          clubId: demoClub.id,
          memberId: inv.memberId,
          invoiceNumber,
          invoiceDate: new Date(inv.dueDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before due
          dueDate: inv.dueDate,
          subtotal: Math.round(inv.amount / 1.07),
          taxAmount: Math.round(inv.amount - inv.amount / 1.07),
          totalAmount: inv.amount,
          paidAmount: inv.status === InvoiceStatus.PAID ? inv.amount : inv.status === InvoiceStatus.PARTIAL ? Math.round(inv.amount * 0.6) : 0,
          balanceDue: inv.status === InvoiceStatus.PAID ? 0 : inv.status === InvoiceStatus.PARTIAL ? Math.round(inv.amount * 0.4) : inv.amount,
          status: inv.status,
        },
      });
    })
  );

  console.log(`✅ Created ${invoices.length} invoices`);

  // ============================================================================
  // PAYMENTS
  // ============================================================================
  console.log('Creating payments...');

  const paidInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.PARTIALLY_PAID);

  const payments = await Promise.all(
    paidInvoices.map(async (inv, i) => {
      const receiptNumber = `RCP-2025-${String(i + 1).padStart(4, '0')}`;
      const amount = inv.status === InvoiceStatus.PAID ? inv.totalAmount : inv.paidAmount;
      return prisma.payment.upsert({
        where: { clubId_receiptNumber: { clubId: demoClub.id, receiptNumber } },
        update: {},
        create: {
          clubId: demoClub.id,
          memberId: inv.memberId,
          receiptNumber,
          paymentDate: new Date(inv.dueDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before due
          amount: amount,
          method: i % 3 === 0 ? PaymentMethod.CREDIT_CARD : i % 3 === 1 ? PaymentMethod.BANK_TRANSFER : PaymentMethod.CASH,
          referenceNumber: i % 3 === 0 ? `ch_${Math.random().toString(36).substring(2, 15)}` : i % 3 === 1 ? `TRF-${Date.now()}-${i}` : `CASH-${Date.now()}-${i}`,
        },
      });
    })
  );

  console.log(`✅ Created ${payments.length} payments`);

  // ============================================================================
  // TEE TIMES
  // ============================================================================
  console.log('Creating tee times...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const teeTimes: { time: string; status: BookingStatus; players: number }[] = [
    { time: '06:00', status: BookingStatus.COMPLETED, players: 4 },
    { time: '06:08', status: BookingStatus.COMPLETED, players: 3 },
    { time: '06:16', status: BookingStatus.CHECKED_IN, players: 4 },
    { time: '06:24', status: BookingStatus.CHECKED_IN, players: 2 },
    { time: '06:32', status: BookingStatus.CONFIRMED, players: 4 },
    { time: '06:40', status: BookingStatus.CONFIRMED, players: 4 },
    { time: '06:48', status: BookingStatus.CONFIRMED, players: 2 },
    { time: '06:56', status: BookingStatus.PENDING, players: 1 },
    { time: '07:04', status: BookingStatus.PENDING, players: 0 },
    { time: '07:12', status: BookingStatus.CANCELLED, players: 0 },
  ];

  const createdTeeTimes = await Promise.all(
    teeTimes.map(async (tt, i) => {
      const teeTimeNumber = `TT-2025-${String(i + 1).padStart(4, '0')}`;
      const completedAt = tt.status === BookingStatus.COMPLETED ? new Date() : null;
      const checkedInAt = [BookingStatus.CHECKED_IN, BookingStatus.COMPLETED].includes(tt.status) ? new Date() : null;
      const confirmedAt = [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED].includes(tt.status) ? new Date() : null;

      // Check if tee time already exists by courseId + date + time OR by teeTimeNumber
      const existingBySlot = await prisma.teeTime.findFirst({
        where: {
          courseId: golfCourse.id,
          teeDate: today,
          teeTime: tt.time,
        }
      });

      if (existingBySlot) return existingBySlot;

      // Also check if teeTimeNumber already used (from previous runs on different dates)
      const existingByNumber = await prisma.teeTime.findFirst({
        where: {
          clubId: demoClub.id,
          teeTimeNumber,
        }
      });

      if (existingByNumber) return existingByNumber;

      return prisma.teeTime.create({
        data: {
          clubId: demoClub.id,
          courseId: golfCourse.id,
          teeTimeNumber,
          teeDate: today,
          teeTime: tt.time,
          holes: 18,
          status: tt.status,
          confirmedAt,
          checkedInAt,
          completedAt,
          notes: tt.status === BookingStatus.CANCELLED ? 'Tournament - Member-Guest Invitational' : null,
          cancelReason: tt.status === BookingStatus.CANCELLED ? 'Course blocked for tournament' : null,
          cancelledAt: tt.status === BookingStatus.CANCELLED ? new Date() : null,
        },
      });
    })
  );

  console.log(`✅ Created ${createdTeeTimes.length} tee times`);

  // ============================================================================
  // ADDITIONAL USERS
  // ============================================================================
  console.log('Creating additional staff users...');

  const staffUsers = [
    { email: 'accountant@royalbangkokclub.com', firstName: 'Piya', lastName: 'Kongkam', role: UserRole.STAFF },
    { email: 'frontdesk@royalbangkokclub.com', firstName: 'Ariya', lastName: 'Thongchai', role: UserRole.STAFF },
    { email: 'manager@royalbangkokclub.com', firstName: 'Thanapat', lastName: 'Suwanno', role: UserRole.TENANT_ADMIN },
    { email: 'membership@royalbangkokclub.com', firstName: 'Napat', lastName: 'Wongwai', role: UserRole.STAFF },
    { email: 'booking@royalbangkokclub.com', firstName: 'Kanchana', lastName: 'Phromma', role: UserRole.STAFF },
  ];

  const additionalUsers = await Promise.all(
    staffUsers.map(async (u) => {
      return prisma.user.upsert({
        where: { clubId_email: { clubId: demoClub.id, email: u.email } },
        update: {},
        create: {
          clubId: demoClub.id,
          email: u.email,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    })
  );

  console.log(`✅ Created ${additionalUsers.length} additional staff users`);

  // ============================================================================
  // STAFF (Service providers - separate from system users)
  // ============================================================================
  console.log('Creating staff members...');

  const tennisCourtFacility = facilities.find(f => f.code === 'TENNIS')!;
  const gymFacility = facilities.find(f => f.code === 'GYM')!;
  const poolFacility = facilities.find(f => f.code === 'POOL')!;

  const staffData = [
    // Spa & Massage therapists
    { firstName: 'Suwanna', lastName: 'Charoen', email: 'suwanna@royalbangkokclub.com', phone: '+66 81 222 0001', capabilities: [{ name: 'thai_massage', level: SkillLevel.EXPERT }, { name: 'aromatherapy', level: SkillLevel.ADVANCED }] },
    { firstName: 'Pranee', lastName: 'Kanchana', email: 'pranee@royalbangkokclub.com', phone: '+66 81 222 0002', capabilities: [{ name: 'swedish_massage', level: SkillLevel.EXPERT }, { name: 'deep_tissue', level: SkillLevel.ADVANCED }] },
    { firstName: 'Somjai', lastName: 'Rattana', email: 'somjai@royalbangkokclub.com', phone: '+66 81 222 0003', capabilities: [{ name: 'thai_massage', level: SkillLevel.ADVANCED }, { name: 'foot_massage', level: SkillLevel.EXPERT }] },
    // Personal trainers
    { firstName: 'Natthawut', lastName: 'Chaiyasit', email: 'natthawut@royalbangkokclub.com', phone: '+66 81 222 0004', facilityId: gymFacility.id, capabilities: [{ name: 'personal_training', level: SkillLevel.EXPERT }, { name: 'strength', level: SkillLevel.EXPERT }] },
    { firstName: 'Pattarapol', lastName: 'Somsak', email: 'pattarapol@royalbangkokclub.com', phone: '+66 81 222 0005', facilityId: gymFacility.id, capabilities: [{ name: 'personal_training', level: SkillLevel.ADVANCED }, { name: 'cardio', level: SkillLevel.EXPERT }] },
    // Tennis coaches
    { firstName: 'Rachata', lastName: 'Wongsawat', email: 'rachata@royalbangkokclub.com', phone: '+66 81 222 0006', facilityId: tennisCourtFacility.id, capabilities: [{ name: 'tennis_coaching', level: SkillLevel.EXPERT }] },
    { firstName: 'Supachai', lastName: 'Bunyong', email: 'supachai@royalbangkokclub.com', phone: '+66 81 222 0007', facilityId: tennisCourtFacility.id, capabilities: [{ name: 'tennis_coaching', level: SkillLevel.ADVANCED }] },
    // Swim instructors
    { firstName: 'Kannika', lastName: 'Thongkam', email: 'kannika@royalbangkokclub.com', phone: '+66 81 222 0008', facilityId: poolFacility.id, capabilities: [{ name: 'swim_instruction', level: SkillLevel.EXPERT }, { name: 'aqua_aerobics', level: SkillLevel.ADVANCED }] },
    // Yoga instructors
    { firstName: 'Apinya', lastName: 'Srisombat', email: 'apinya@royalbangkokclub.com', phone: '+66 81 222 0009', capabilities: [{ name: 'yoga', level: SkillLevel.EXPERT }, { name: 'meditation', level: SkillLevel.ADVANCED }] },
    { firstName: 'Orathai', lastName: 'Wongsakul', email: 'orathai@royalbangkokclub.com', phone: '+66 81 222 0010', capabilities: [{ name: 'yoga', level: SkillLevel.ADVANCED }, { name: 'pilates', level: SkillLevel.EXPERT }] },
  ];

  const staffMembers = await Promise.all(
    staffData.map(async (s) => {
      // Check if staff already exists by email
      const existing = await prisma.staff.findFirst({
        where: { clubId: demoClub.id, email: s.email }
      });

      if (existing) return existing;

      return prisma.staff.create({
        data: {
          clubId: demoClub.id,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          phone: s.phone,
          defaultFacilityId: s.facilityId,
          workingSchedule: {
            monday: { start: '09:00', end: '18:00' },
            tuesday: { start: '09:00', end: '18:00' },
            wednesday: { start: '09:00', end: '18:00' },
            thursday: { start: '09:00', end: '18:00' },
            friday: { start: '09:00', end: '18:00' },
            saturday: { start: '10:00', end: '16:00' },
          },
          capabilities: {
            create: s.capabilities.map(c => ({
              capability: c.name,
              skillLevel: c.level,
            }))
          }
        }
      });
    })
  );

  console.log(`✅ Created ${staffMembers.length} staff members`);

  // ============================================================================
  // SERVICES
  // ============================================================================
  console.log('Creating services...');

  const serviceData = [
    // Spa services
    { name: 'Thai Traditional Massage', category: 'spa', duration: 60, buffer: 15, price: 1500, capabilities: ['thai_massage'], variations: [
      { name: '90 Minutes', priceType: VariationPriceType.FIXED_ADD, price: 500 },
      { name: 'Hot Stone Add-on', priceType: VariationPriceType.FIXED_ADD, price: 300 },
    ]},
    { name: 'Swedish Massage', category: 'spa', duration: 60, buffer: 15, price: 1800, capabilities: ['swedish_massage'], variations: [
      { name: '90 Minutes', priceType: VariationPriceType.FIXED_ADD, price: 600 },
      { name: 'Aromatherapy Add-on', priceType: VariationPriceType.FIXED_ADD, price: 400 },
    ]},
    { name: 'Deep Tissue Massage', category: 'spa', duration: 60, buffer: 15, price: 2000, capabilities: ['deep_tissue'] },
    { name: 'Foot Reflexology', category: 'spa', duration: 45, buffer: 10, price: 800, capabilities: ['foot_massage'] },
    // Fitness services
    { name: 'Personal Training Session', category: 'fitness', duration: 60, buffer: 15, price: 1500, capabilities: ['personal_training'], variations: [
      { name: '5-Session Package', priceType: VariationPriceType.REPLACEMENT, price: 6500 },
      { name: '10-Session Package', priceType: VariationPriceType.REPLACEMENT, price: 12000 },
    ]},
    { name: 'Group Fitness Class', category: 'fitness', duration: 60, buffer: 10, price: 500, capabilities: ['personal_training'] },
    // Tennis services
    { name: 'Private Tennis Lesson', category: 'sports', duration: 60, buffer: 15, price: 2000, capabilities: ['tennis_coaching'], variations: [
      { name: '90 Minutes', priceType: VariationPriceType.FIXED_ADD, price: 800 },
      { name: 'Video Analysis Add-on', priceType: VariationPriceType.FIXED_ADD, price: 500 },
    ]},
    { name: 'Group Tennis Clinic', category: 'sports', duration: 90, buffer: 15, price: 800, capabilities: ['tennis_coaching'] },
    // Swimming services
    { name: 'Private Swim Lesson', category: 'aquatics', duration: 45, buffer: 15, price: 1200, capabilities: ['swim_instruction'] },
    { name: 'Aqua Aerobics Class', category: 'aquatics', duration: 60, buffer: 10, price: 400, capabilities: ['aqua_aerobics'] },
    // Wellness services
    { name: 'Private Yoga Session', category: 'wellness', duration: 60, buffer: 15, price: 1500, capabilities: ['yoga'] },
    { name: 'Group Yoga Class', category: 'wellness', duration: 60, buffer: 10, price: 400, capabilities: ['yoga'] },
    { name: 'Pilates Session', category: 'wellness', duration: 60, buffer: 15, price: 1500, capabilities: ['pilates'] },
    { name: 'Meditation & Mindfulness', category: 'wellness', duration: 45, buffer: 10, price: 600, capabilities: ['meditation'] },
  ];

  const services = await Promise.all(
    serviceData.map(async (s) => {
      // Check if service already exists
      const existing = await prisma.service.findFirst({
        where: { clubId: demoClub.id, name: s.name }
      });

      if (existing) return existing;

      return prisma.service.create({
        data: {
          clubId: demoClub.id,
          name: s.name,
          category: s.category,
          durationMinutes: s.duration,
          bufferMinutes: s.buffer,
          basePrice: s.price,
          requiredCapabilities: s.capabilities,
          tierDiscounts: { FULL: 10, GOLF: 5 }, // 10% discount for Full members, 5% for Golf
          variations: s.variations ? {
            create: s.variations.map((v, i) => ({
              name: v.name,
              priceType: v.priceType,
              priceValue: v.price,
              sortOrder: i,
            }))
          } : undefined,
        }
      });
    })
  );

  console.log(`✅ Created ${services.length} services`);

  // ============================================================================
  // SAMPLE FACILITY BOOKINGS (Enhanced)
  // ============================================================================
  console.log('Creating sample bookings...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const thaiMassageService = services.find(s => s.name === 'Thai Traditional Massage');
  const personalTrainingService = services.find(s => s.name === 'Personal Training Session');
  const tennisLessonService = services.find(s => s.name === 'Private Tennis Lesson');

  const suwannaStaff = staffMembers.find(s => s.firstName === 'Suwanna');
  const natthawutStaff = staffMembers.find(s => s.firstName === 'Natthawut');
  const rachataStaff = staffMembers.find(s => s.firstName === 'Rachata');

  const bookingData = [
    // Facility booking (tennis court)
    {
      bookingType: BookingType.FACILITY,
      memberId: members[0].id,
      facilityId: tennisCourtFacility.id,
      startTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      durationMinutes: 60,
      basePrice: 500,
      status: BookingStatus.CONFIRMED,
    },
    // Service booking (massage)
    {
      bookingType: BookingType.SERVICE,
      memberId: members[1].id,
      serviceId: thaiMassageService?.id,
      staffId: suwannaStaff?.id,
      startTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000), // 10 AM
      durationMinutes: 60,
      basePrice: 1500,
      tierDiscount: 150, // 10% discount
      status: BookingStatus.CONFIRMED,
    },
    // Service booking (personal training)
    {
      bookingType: BookingType.SERVICE,
      memberId: members[2].id,
      serviceId: personalTrainingService?.id,
      staffId: natthawutStaff?.id,
      facilityId: gymFacility.id,
      startTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000), // 2 PM
      durationMinutes: 60,
      basePrice: 1500,
      status: BookingStatus.CONFIRMED,
    },
    // Staff-based booking (tennis lesson)
    {
      bookingType: BookingType.STAFF,
      memberId: members[3].id,
      serviceId: tennisLessonService?.id,
      staffId: rachataStaff?.id,
      facilityId: tennisCourtFacility.id,
      startTime: new Date(tomorrow.getTime() + 15 * 60 * 60 * 1000), // 3 PM
      durationMinutes: 60,
      basePrice: 2000,
      variationsTotal: 500, // Video analysis add-on
      status: BookingStatus.CONFIRMED,
    },
    // Completed booking
    {
      bookingType: BookingType.SERVICE,
      memberId: members[4].id,
      serviceId: thaiMassageService?.id,
      staffId: suwannaStaff?.id,
      startTime: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      durationMinutes: 60,
      basePrice: 1500,
      status: BookingStatus.COMPLETED,
      bookingPaymentStatus: BookingPaymentStatus.PAID,
    },
  ];

  const bookings = await Promise.all(
    bookingData.map(async (b, i) => {
      const bookingNumber = `BK-2025-${String(i + 1).padStart(4, '0')}`;

      // Check if booking already exists
      const existing = await prisma.booking.findFirst({
        where: { clubId: demoClub.id, bookingNumber }
      });

      if (existing) return existing;

      const endTime = new Date(b.startTime.getTime() + b.durationMinutes * 60 * 1000);
      const totalAmount = (b.basePrice || 0) + (b.variationsTotal || 0) - (b.tierDiscount || 0);

      return prisma.booking.create({
        data: {
          clubId: demoClub.id,
          bookingNumber,
          bookingType: b.bookingType,
          memberId: b.memberId,
          facilityId: b.facilityId,
          serviceId: b.serviceId,
          staffId: b.staffId,
          startTime: b.startTime,
          endTime,
          durationMinutes: b.durationMinutes,
          basePrice: b.basePrice || 0,
          tierDiscount: b.tierDiscount || 0,
          variationsTotal: b.variationsTotal || 0,
          totalAmount,
          status: b.status,
          bookingPaymentMethod: BookingPaymentMethod.ON_ACCOUNT,
          bookingPaymentStatus: b.bookingPaymentStatus || BookingPaymentStatus.PENDING,
        }
      });
    })
  );

  console.log(`✅ Created ${bookings.length} sample bookings`);

  // ============================================================================
  // CONSUMABLES
  // ============================================================================
  console.log('Creating consumables...');

  const consumableData = [
    { name: 'Massage Oil - Lavender', category: 'spa', unit: 'ml', stock: 5000, threshold: 1000 },
    { name: 'Massage Oil - Eucalyptus', category: 'spa', unit: 'ml', stock: 3000, threshold: 500 },
    { name: 'Hot Stone Set', category: 'spa', unit: 'set', stock: 10, threshold: 2 },
    { name: 'Disposable Towels', category: 'spa', unit: 'pack', stock: 100, threshold: 20 },
    { name: 'Tennis Balls', category: 'sports', unit: 'can', stock: 50, threshold: 10 },
    { name: 'Tennis Grip Tape', category: 'sports', unit: 'roll', stock: 30, threshold: 5 },
    { name: 'Swimming Goggles', category: 'aquatics', unit: 'piece', stock: 20, threshold: 5 },
    { name: 'Kickboards', category: 'aquatics', unit: 'piece', stock: 15, threshold: 3 },
  ];

  const consumables = await Promise.all(
    consumableData.map(async (c) => {
      const existing = await prisma.consumable.findFirst({
        where: { clubId: demoClub.id, name: c.name }
      });

      if (existing) return existing;

      return prisma.consumable.create({
        data: {
          clubId: demoClub.id,
          name: c.name,
          category: c.category,
          unit: c.unit,
          currentStock: c.stock,
          reorderThreshold: c.threshold,
        }
      });
    })
  );

  console.log(`✅ Created ${consumables.length} consumables`);

  // ============================================================================
  // PLATFORM ADMIN USERS (No clubId - platform-level access)
  // ============================================================================
  console.log('Creating platform admin users...');

  // Create Super Admin (no clubId - platform level)
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: 'superadmin@vantage.com', clubId: null },
  });

  const superAdmin = existingSuperAdmin || await prisma.user.create({
    data: {
      email: 'superadmin@vantage.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      permissions: ['platform:all', 'clubs:manage', 'users:manage'],
    },
  });

  console.log(`✅ Created super admin: ${superAdmin.email}`);

  // Create Platform Admin (no clubId - platform level)
  const existingPlatformAdmin = await prisma.user.findFirst({
    where: { email: 'platformadmin@vantage.com', clubId: null },
  });

  const platformAdmin = existingPlatformAdmin || await prisma.user.create({
    data: {
      email: 'platformadmin@vantage.com',
      passwordHash,
      firstName: 'Platform',
      lastName: 'Admin',
      role: UserRole.PLATFORM_ADMIN,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      permissions: ['platform:read', 'clubs:read', 'reports:view'],
    },
  });

  console.log(`✅ Created platform admin: ${platformAdmin.email}`);

  // ============================================================================
  // MEMBER PORTAL USER
  // ============================================================================
  console.log('Creating member portal user...');

  // Find the first active member to link
  const memberForPortal = members[0]; // Somchai Tanaka

  const memberUser = await prisma.user.upsert({
    where: { clubId_email: { clubId: demoClub.id, email: 'member@demo.com' } },
    update: {},
    create: {
      clubId: demoClub.id,
      memberId: memberForPortal.id,
      email: 'member@demo.com',
      passwordHash: await bcrypt.hash('Member123!', 12),
      firstName: memberForPortal.firstName,
      lastName: memberForPortal.lastName,
      role: UserRole.MEMBER,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      permissions: ['member:read', 'member:portal', 'bookings:create', 'invoices:view'],
    },
  });

  console.log(`✅ Created member portal user: ${memberUser.email}`);

  // ============================================================================
  // MEMBERSHIP APPLICATIONS
  // ============================================================================
  console.log('Creating membership applications...');

  // Get first member as sponsor
  const sponsorMember = await prisma.member.findFirst({
    where: { clubId: demoClub.id, status: MemberStatus.ACTIVE },
  });

  const applications = await Promise.all([
    prisma.membershipApplication.upsert({
      where: { clubId_applicationNumber: { clubId: demoClub.id, applicationNumber: 'APP-2026-0001' } },
      update: {},
      create: {
        clubId: demoClub.id,
        applicationNumber: 'APP-2026-0001',
        firstName: 'Wichai',
        lastName: 'Pongpanich',
        email: 'wichai.p@newmember.com',
        phone: '+66 88 111 2233',
        membershipTypeId: membershipTypes[0].id,
        sponsorId: sponsorMember?.id,
        status: ApplicationStatus.PENDING_BOARD,
        reviewNotes: 'Referred by platinum member. Strong corporate background in finance sector.',
        reviewedAt: new Date('2026-01-06'),
        reviewedBy: 'Membership Administrator',
      },
    }),
    prisma.membershipApplication.upsert({
      where: { clubId_applicationNumber: { clubId: demoClub.id, applicationNumber: 'APP-2026-0002' } },
      update: {},
      create: {
        clubId: demoClub.id,
        applicationNumber: 'APP-2026-0002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@corporate.com',
        phone: '+66 92 444 5566',
        membershipTypeId: membershipTypes[2].id, // Corporate
        sponsorId: sponsorMember?.id,
        status: ApplicationStatus.UNDER_REVIEW,
        reviewNotes: 'Awaiting corporate verification documents and company letter.',
      },
    }),
    prisma.membershipApplication.upsert({
      where: { clubId_applicationNumber: { clubId: demoClub.id, applicationNumber: 'APP-2026-0003' } },
      update: {},
      create: {
        clubId: demoClub.id,
        applicationNumber: 'APP-2026-0003',
        firstName: 'Kittisak',
        lastName: 'Somboon',
        email: 'kittisak.s@email.com',
        phone: '+66 81 999 0000',
        membershipTypeId: membershipTypes[1].id, // Social
        status: ApplicationStatus.SUBMITTED,
        reviewNotes: 'Walk-in applicant. Needs to submit ID and proof of address.',
      },
    }),
    prisma.membershipApplication.upsert({
      where: { clubId_applicationNumber: { clubId: demoClub.id, applicationNumber: 'APP-2025-0010' } },
      update: {},
      create: {
        clubId: demoClub.id,
        applicationNumber: 'APP-2025-0010',
        firstName: 'Ananya',
        lastName: 'Charoenpol',
        email: 'ananya.c@firm.co.th',
        phone: '+66 89 222 3344',
        membershipTypeId: membershipTypes[0].id,
        sponsorId: sponsorMember?.id,
        status: ApplicationStatus.APPROVED,
        reviewNotes: 'Approved by board on 2026-01-02. Pending member record creation.',
        reviewedAt: new Date('2025-12-25'),
        reviewedBy: 'Membership Administrator',
        approvedAt: new Date('2026-01-02'),
        approvedBy: 'Board Vote (3-0)',
      },
    }),
    prisma.membershipApplication.upsert({
      where: { clubId_applicationNumber: { clubId: demoClub.id, applicationNumber: 'APP-2025-0008' } },
      update: {},
      create: {
        clubId: demoClub.id,
        applicationNumber: 'APP-2025-0008',
        firstName: 'Robert',
        lastName: 'Martinez',
        email: 'r.martinez@company.com',
        phone: '+66 95 777 8899',
        membershipTypeId: membershipTypes[2].id, // Corporate
        sponsorId: sponsorMember?.id,
        status: ApplicationStatus.REJECTED,
        reviewNotes: 'Application incomplete. Company not verified.',
        reviewedAt: new Date('2025-12-18'),
        reviewedBy: 'Membership Administrator',
        rejectedAt: new Date('2025-12-20'),
        rejectedBy: 'Membership Committee',
        rejectionReason: 'Unable to verify corporate affiliation. Applicant may reapply with proper documentation.',
      },
    }),
  ]);

  console.log(`✅ Created ${applications.length} membership applications`);

  // ============================================================================
  // COMPREHENSIVE TEE TIME TEST DATA (Jan 19 - Feb 7, 2026)
  // ============================================================================
  console.log('Creating comprehensive tee time test data...');

  // Helper to create date at specific time
  const createDateTime = (year: number, month: number, day: number, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  };

  // Get active members for bookings
  const activeMembers = members.filter(m =>
    ['ACTIVE'].includes((m as any).status)
  );

  // Helper to generate tee time number
  // Find the highest existing tee time number to avoid conflicts
  const existingTeeTimes = await prisma.teeTime.findMany({
    where: {
      clubId: demoClub.id,
      teeTimeNumber: {
        startsWith: 'TT-2026-',
      },
    },
    select: {
      teeTimeNumber: true,
    },
  });

  let teeTimeCounter = 100;
  if (existingTeeTimes.length > 0) {
    const maxNumber = Math.max(
      ...existingTeeTimes.map(tt => parseInt(tt.teeTimeNumber.split('-')[2]) || 0)
    );
    teeTimeCounter = maxNumber;
  }

  const getNextTeeTimeNumber = () => `TT-2026-${String(++teeTimeCounter).padStart(4, '0')}`;

  // ============================================================================
  // TEE TIME BLOCKS (Maintenance, Tournaments, etc.)
  // ============================================================================
  console.log('Creating tee time blocks...');

  const blocks = [
    // Monday Jan 20 - Morning course maintenance
    {
      startTime: createDateTime(2026, 1, 20, '06:00'),
      endTime: createDateTime(2026, 1, 20, '07:00'),
      blockType: 'MAINTENANCE' as const,
      reason: 'Morning greens maintenance - aerating greens 1-9',
    },
    // Wednesday Jan 22 - Ladies Tournament (morning)
    {
      startTime: createDateTime(2026, 1, 22, '07:00'),
      endTime: createDateTime(2026, 1, 22, '11:00'),
      blockType: 'TOURNAMENT' as const,
      reason: 'Ladies Monthly Medal Tournament',
    },
    // Friday Jan 24 - Corporate event
    {
      startTime: createDateTime(2026, 1, 24, '12:00'),
      endTime: createDateTime(2026, 1, 24, '14:00'),
      blockType: 'PRIVATE' as const,
      reason: 'Corporate Golf Day - ABC Company',
    },
    // Saturday Jan 25 - Club Championship
    {
      startTime: createDateTime(2026, 1, 25, '06:30'),
      endTime: createDateTime(2026, 1, 25, '09:00'),
      blockType: 'TOURNAMENT' as const,
      reason: 'Club Championship - Round 1 (Shotgun Start)',
    },
    // Sunday Jan 26 - Reserved for members event
    {
      startTime: createDateTime(2026, 1, 26, '14:00'),
      endTime: createDateTime(2026, 1, 26, '16:00'),
      blockType: 'PRIVATE' as const,
      reason: 'Member-Guest Invitational Tee Times Reserved',
    },
    // Tuesday Jan 28 - Cart path maintenance
    {
      startTime: createDateTime(2026, 1, 28, '10:00'),
      endTime: createDateTime(2026, 1, 28, '11:00'),
      blockType: 'MAINTENANCE' as const,
      reason: 'Cart path repair - Hole 7 and 8 area',
    },
    // Saturday Feb 1 - New Year Tournament
    {
      startTime: createDateTime(2026, 2, 1, '07:00'),
      endTime: createDateTime(2026, 2, 1, '10:00'),
      blockType: 'TOURNAMENT' as const,
      reason: 'Chinese New Year Celebration Tournament',
    },
    // Monday Feb 3 - Course closed for maintenance
    {
      startTime: createDateTime(2026, 2, 3, '06:00'),
      endTime: createDateTime(2026, 2, 3, '18:00'),
      blockType: 'MAINTENANCE' as const,
      reason: 'Full course maintenance - Annual overseeding (Course Closed)',
    },
    // Thursday Feb 6 - Twilight blocked for private party
    {
      startTime: createDateTime(2026, 2, 6, '15:00'),
      endTime: createDateTime(2026, 2, 6, '17:00'),
      blockType: 'PRIVATE' as const,
      reason: 'Private event - Smith Birthday Celebration',
    },
  ];

  const createdBlocks = await Promise.all(
    blocks.map(async (b) => {
      const existing = await prisma.teeTimeBlock.findFirst({
        where: {
          courseId: golfCourse.id,
          startTime: b.startTime,
        }
      });
      if (existing) return existing;

      return prisma.teeTimeBlock.create({
        data: {
          courseId: golfCourse.id,
          startTime: b.startTime,
          endTime: b.endTime,
          blockType: b.blockType,
          reason: b.reason,
          createdBy: adminUser.id,
        }
      });
    })
  );

  console.log(`✅ Created ${createdBlocks.length} tee time blocks`);

  // ============================================================================
  // TEE TIME BOOKINGS WITH PLAYERS
  // ============================================================================
  console.log('Creating tee time bookings with players...');

  // Define test scenarios for various dates
  const bookingScenarios = [
    // ===========================================
    // Monday Jan 20, 2026 - Normal weekday
    // ===========================================
    // Early morning bookings
    { date: [2026, 1, 20], time: '07:12', status: BookingStatus.COMPLETED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1, checkedIn: true },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2, checkedIn: true },
      { type: PlayerType.GUEST, guestName: 'David Wilson', pos: 3, checkedIn: true },
      { type: PlayerType.GUEST, guestName: 'Tom Anderson', pos: 4, checkedIn: true },
    ]},
    { date: [2026, 1, 20], time: '07:20', status: BookingStatus.COMPLETED, players: [
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 1, checkedIn: true },
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 2, checkedIn: true },
    ]},
    { date: [2026, 1, 20], time: '07:28', status: BookingStatus.CHECKED_IN, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1, checkedIn: true },
      { type: PlayerType.GUEST, guestName: 'Michael Brown', pos: 2, checkedIn: true },
      { type: PlayerType.GUEST, guestName: 'Robert Davis', pos: 3, checkedIn: true },
    ]},
    { date: [2026, 1, 20], time: '07:44', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 3 },
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 4 },
    ]},
    { date: [2026, 1, 20], time: '09:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 1 },
      { type: PlayerType.DEPENDENT, guestName: 'Junior Player', pos: 2 },
    ]},
    { date: [2026, 1, 20], time: '14:00', status: BookingStatus.PENDING, players: [
      { type: PlayerType.WALK_UP, guestName: 'Walk-in Guest 1', pos: 1 },
    ]},

    // ===========================================
    // Tuesday Jan 21, 2026
    // ===========================================
    { date: [2026, 1, 21], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 3 },
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 4 },
    ]},
    { date: [2026, 1, 21], time: '06:08', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'James Miller', pos: 2 },
    ]},
    { date: [2026, 1, 21], time: '08:00', status: BookingStatus.CANCELLED, players: [
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 1 },
    ], cancelReason: 'Weather forecast - heavy rain expected' },
    { date: [2026, 1, 21], time: '10:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 2 },
      { type: PlayerType.GUEST, guestName: 'Chris Taylor', pos: 3 },
    ]},
    { date: [2026, 1, 21], time: '14:56', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.WALK_UP, guestName: 'Evening Walker', pos: 1 },
      { type: PlayerType.WALK_UP, guestName: 'Twilight Player', pos: 2 },
    ]},

    // ===========================================
    // Wednesday Jan 22, 2026 (Ladies Tournament morning)
    // ===========================================
    // Tournament players would be handled separately - only afternoon slots available
    { date: [2026, 1, 22], time: '12:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Post-Tournament Guest', pos: 2 },
    ]},
    { date: [2026, 1, 22], time: '14:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 11, pos: 3 },
    ]},

    // ===========================================
    // Thursday Jan 23, 2026 - Busy day
    // ===========================================
    { date: [2026, 1, 23], time: '06:00', status: BookingStatus.COMPLETED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1, checkedIn: true },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2, checkedIn: true },
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 3, checkedIn: true },
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 4, checkedIn: true },
    ]},
    { date: [2026, 1, 23], time: '06:08', status: BookingStatus.COMPLETED, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1, checkedIn: true },
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 2, checkedIn: true },
    ]},
    { date: [2026, 1, 23], time: '06:16', status: BookingStatus.CHECKED_IN, players: [
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 1, checkedIn: true },
      { type: PlayerType.GUEST, guestName: 'Morning Guest A', pos: 2, checkedIn: true },
      { type: PlayerType.GUEST, guestName: 'Morning Guest B', pos: 3, checkedIn: true },
      { type: PlayerType.GUEST, guestName: 'Morning Guest C', pos: 4, checkedIn: true },
    ]},
    { date: [2026, 1, 23], time: '06:24', status: BookingStatus.CHECKED_IN, players: [
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 1, checkedIn: true },
    ]},
    { date: [2026, 1, 23], time: '07:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 2 },
    ]},
    { date: [2026, 1, 23], time: '08:00', status: BookingStatus.NO_SHOW, players: [
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'No Show Guest', pos: 2 },
    ]},
    { date: [2026, 1, 23], time: '09:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 11, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 12, pos: 2 },
      { type: PlayerType.GUEST, guestName: 'Business Partner', pos: 3 },
    ]},
    { date: [2026, 1, 23], time: '10:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 13, pos: 1 },
    ]},
    { date: [2026, 1, 23], time: '14:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Afternoon Guest', pos: 2 },
      { type: PlayerType.GUEST, guestName: 'Afternoon Guest 2', pos: 3 },
      { type: PlayerType.GUEST, guestName: 'Afternoon Guest 3', pos: 4 },
    ]},
    { date: [2026, 1, 23], time: '16:00', status: BookingStatus.PENDING, players: [
      { type: PlayerType.WALK_UP, guestName: 'Twilight Walker', pos: 1 },
    ]},

    // ===========================================
    // Friday Jan 24, 2026 (Corporate event midday)
    // ===========================================
    { date: [2026, 1, 24], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2 },
    ]},
    { date: [2026, 1, 24], time: '07:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 3 },
    ]},
    { date: [2026, 1, 24], time: '08:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'VIP Guest', pos: 2 },
    ]},
    { date: [2026, 1, 24], time: '14:56', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 1 },
    ]},

    // ===========================================
    // Saturday Jan 25, 2026 (Club Championship morning)
    // ===========================================
    // After tournament ends at 9am
    { date: [2026, 1, 25], time: '10:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Weekend Guest 1', pos: 2 },
      { type: PlayerType.GUEST, guestName: 'Weekend Guest 2', pos: 3 },
      { type: PlayerType.GUEST, guestName: 'Weekend Guest 3', pos: 4 },
    ]},
    { date: [2026, 1, 25], time: '10:08', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 2 },
    ]},
    { date: [2026, 1, 25], time: '12:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 1 },
      { type: PlayerType.DEPENDENT, guestName: 'Junior Smith', pos: 2 },
    ]},
    { date: [2026, 1, 25], time: '14:00', status: BookingStatus.PENDING, players: [
      { type: PlayerType.MEMBER, memberIdx: 11, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 12, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 13, pos: 3 },
    ]},

    // ===========================================
    // Sunday Jan 26, 2026 (Member-Guest afternoon reserved)
    // ===========================================
    { date: [2026, 1, 26], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 3 },
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 4 },
    ]},
    { date: [2026, 1, 26], time: '07:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Sunday Guest', pos: 2 },
    ]},
    { date: [2026, 1, 26], time: '08:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 3 },
    ]},
    { date: [2026, 1, 26], time: '10:00', status: BookingStatus.CANCELLED, players: [
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 1 },
    ], cancelReason: 'Personal emergency' },

    // ===========================================
    // Monday Jan 27, 2026
    // ===========================================
    { date: [2026, 1, 27], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2 },
    ]},
    { date: [2026, 1, 27], time: '08:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Monday Guest', pos: 2 },
      { type: PlayerType.GUEST, guestName: 'Monday Guest 2', pos: 3 },
    ]},

    // ===========================================
    // Tuesday Jan 28, 2026 (Cart path maintenance 10-11)
    // ===========================================
    { date: [2026, 1, 28], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 2 },
    ]},
    { date: [2026, 1, 28], time: '12:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 1 },
    ]},

    // ===========================================
    // Wednesday Jan 29, 2026
    // ===========================================
    { date: [2026, 1, 29], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 3 },
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 4 },
    ]},
    { date: [2026, 1, 29], time: '07:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 1 },
      { type: PlayerType.DEPENDENT, guestName: 'Junior Player Wed', pos: 2 },
    ]},

    // ===========================================
    // Thursday Jan 30, 2026
    // ===========================================
    { date: [2026, 1, 30], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Thursday AM Guest', pos: 2 },
    ]},
    { date: [2026, 1, 30], time: '09:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 3 },
    ]},

    // ===========================================
    // Friday Jan 31, 2026
    // ===========================================
    { date: [2026, 1, 31], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 2 },
    ]},
    { date: [2026, 1, 31], time: '08:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'End of Month Guest', pos: 2 },
      { type: PlayerType.GUEST, guestName: 'End of Month Guest 2', pos: 3 },
      { type: PlayerType.GUEST, guestName: 'End of Month Guest 3', pos: 4 },
    ]},
    { date: [2026, 1, 31], time: '14:00', status: BookingStatus.PENDING, players: [
      { type: PlayerType.WALK_UP, guestName: 'Friday Walk-up', pos: 1 },
    ]},

    // ===========================================
    // Saturday Feb 1, 2026 (Chinese NY Tournament morning)
    // ===========================================
    // After tournament at 10am
    { date: [2026, 2, 1], time: '10:56', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 2 },
      { type: PlayerType.GUEST, guestName: 'Feb Saturday Guest', pos: 3 },
    ]},
    { date: [2026, 2, 1], time: '14:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 2 },
    ]},

    // ===========================================
    // Sunday Feb 2, 2026
    // ===========================================
    { date: [2026, 2, 2], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 3 },
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 4 },
    ]},
    { date: [2026, 2, 2], time: '06:08', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 2 },
    ]},
    { date: [2026, 2, 2], time: '08:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Sunday Feb Guest', pos: 2 },
    ]},
    { date: [2026, 2, 2], time: '10:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 1 },
      { type: PlayerType.DEPENDENT, guestName: 'Sunday Junior', pos: 2 },
      { type: PlayerType.DEPENDENT, guestName: 'Sunday Junior 2', pos: 3 },
    ]},

    // ===========================================
    // Monday Feb 3, 2026 - CLOSED for maintenance
    // ===========================================
    // No bookings - entire day blocked

    // ===========================================
    // Tuesday Feb 4, 2026
    // ===========================================
    { date: [2026, 2, 4], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 2 },
    ]},
    { date: [2026, 2, 4], time: '07:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Tuesday Morning Guest', pos: 2 },
      { type: PlayerType.GUEST, guestName: 'Tuesday Morning Guest 2', pos: 3 },
    ]},
    { date: [2026, 2, 4], time: '14:00', status: BookingStatus.CANCELLED, players: [
      { type: PlayerType.MEMBER, memberIdx: 11, pos: 1 },
    ], cancelReason: 'Work conflict' },

    // ===========================================
    // Wednesday Feb 5, 2026
    // ===========================================
    { date: [2026, 2, 5], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 3 },
    ]},
    { date: [2026, 2, 5], time: '08:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Midweek Guest', pos: 2 },
    ]},
    { date: [2026, 2, 5], time: '10:00', status: BookingStatus.PENDING, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1 },
    ]},

    // ===========================================
    // Thursday Feb 6, 2026 (Private event twilight)
    // ===========================================
    { date: [2026, 2, 6], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 2 },
    ]},
    { date: [2026, 2, 6], time: '07:04', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 3 },
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 4 },
    ]},
    { date: [2026, 2, 6], time: '08:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 11, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Thursday Guest', pos: 2 },
    ]},
    { date: [2026, 2, 6], time: '10:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 12, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 13, pos: 2 },
    ]},
    // No bookings after 15:00 due to private event

    // ===========================================
    // Friday Feb 7, 2026
    // ===========================================
    { date: [2026, 2, 7], time: '06:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 3 },
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 4 },
    ]},
    { date: [2026, 2, 7], time: '06:08', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Friday Early Guest', pos: 2 },
    ]},
    { date: [2026, 2, 7], time: '08:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 2 },
    ]},
    { date: [2026, 2, 7], time: '10:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 1 },
      { type: PlayerType.GUEST, guestName: 'Friday Mid Guest', pos: 2 },
      { type: PlayerType.GUEST, guestName: 'Friday Mid Guest 2', pos: 3 },
    ]},
    { date: [2026, 2, 7], time: '14:00', status: BookingStatus.CONFIRMED, players: [
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 2 },
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 3 },
      { type: PlayerType.GUEST, guestName: 'Weekend Prep Guest', pos: 4 },
    ]},
    { date: [2026, 2, 7], time: '16:00', status: BookingStatus.PENDING, players: [
      { type: PlayerType.WALK_UP, guestName: 'Friday Twilight Walker', pos: 1 },
      { type: PlayerType.WALK_UP, guestName: 'Friday Twilight Walker 2', pos: 2 },
    ]},

    // ===========================================
    // MULTI-BOOKING SCENARIOS (2-3 bookings per flight)
    // These test the booking-centric tee sheet display
    // ===========================================

    // Jan 29, 2026 - Two separate 2-player bookings at 09:00
    { date: [2026, 1, 29], time: '09:04', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.MEMBER, memberIdx: 0, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 1, pos: 2 },
    ]},
    { date: [2026, 1, 29], time: '09:04', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.GUEST, guestName: 'Walk-in Guest A', pos: 3 },
      { type: PlayerType.GUEST, guestName: 'Walk-in Guest B', pos: 4 },
    ]},

    // Jan 29, 2026 - Three separate bookings at 11:00 (1+1+2)
    { date: [2026, 1, 29], time: '10:56', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.MEMBER, memberIdx: 2, pos: 1 },
    ]},
    { date: [2026, 1, 29], time: '10:56', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.MEMBER, memberIdx: 3, pos: 2 },
    ]},
    { date: [2026, 1, 29], time: '10:56', status: BookingStatus.PENDING, allowDuplicate: true, players: [
      { type: PlayerType.GUEST, guestName: 'Paired Guest 1', pos: 3 },
      { type: PlayerType.GUEST, guestName: 'Paired Guest 2', pos: 4 },
    ]},

    // Jan 30, 2026 - Two bookings at 08:00 (3+1)
    { date: [2026, 1, 30], time: '08:00', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.MEMBER, memberIdx: 4, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 5, pos: 2 },
      { type: PlayerType.DEPENDENT, guestName: 'Family Member', pos: 3 },
    ]},
    { date: [2026, 1, 30], time: '08:00', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.WALK_UP, guestName: 'Joined Single', pos: 4 },
    ]},

    // Jan 31, 2026 - Two bookings at 10:00 with different statuses
    { date: [2026, 1, 31], time: '10:00', status: BookingStatus.CHECKED_IN, allowDuplicate: true, players: [
      { type: PlayerType.MEMBER, memberIdx: 6, pos: 1, checkedIn: true },
      { type: PlayerType.MEMBER, memberIdx: 7, pos: 2, checkedIn: true },
    ]},
    { date: [2026, 1, 31], time: '10:00', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.GUEST, guestName: 'Late Arrival Guest 1', pos: 3 },
      { type: PlayerType.GUEST, guestName: 'Late Arrival Guest 2', pos: 4 },
    ]},

    // Feb 1, 2026 - Weekend multi-booking at 07:00 (2+2)
    { date: [2026, 2, 1], time: '07:04', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.MEMBER, memberIdx: 8, pos: 1 },
      { type: PlayerType.MEMBER, memberIdx: 9, pos: 2 },
    ]},
    { date: [2026, 2, 1], time: '07:04', status: BookingStatus.CONFIRMED, allowDuplicate: true, players: [
      { type: PlayerType.MEMBER, memberIdx: 10, pos: 3 },
      { type: PlayerType.GUEST, guestName: 'Weekend Guest', pos: 4 },
    ]},
  ];

  // Create all bookings
  let createdTeeTimeCount = 0;
  let createdPlayerCount = 0;

  for (const scenario of bookingScenarios) {
    const [year, month, day] = scenario.date;
    const teeDate = new Date(year, month - 1, day);
    teeDate.setHours(0, 0, 0, 0);

    // Check if tee time already exists (skip for multi-booking scenarios)
    if (!(scenario as any).allowDuplicate) {
      const existingTeeTime = await prisma.teeTime.findFirst({
        where: {
          courseId: golfCourse.id,
          teeDate,
          teeTime: scenario.time,
        }
      });

      if (existingTeeTime) continue;
    }

    const teeTimeNumber = getNextTeeTimeNumber();

    // Determine timestamps based on status
    const confirmedAt = [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED, BookingStatus.NO_SHOW].includes(scenario.status)
      ? new Date() : null;
    const checkedInAt = [BookingStatus.CHECKED_IN, BookingStatus.COMPLETED].includes(scenario.status)
      ? new Date() : null;
    const completedAt = scenario.status === BookingStatus.COMPLETED ? new Date() : null;
    const cancelledAt = scenario.status === BookingStatus.CANCELLED ? new Date() : null;

    // Create tee time with players
    const teeTime = await prisma.teeTime.create({
      data: {
        clubId: demoClub.id,
        courseId: golfCourse.id,
        teeTimeNumber,
        teeDate,
        teeTime: scenario.time,
        holes: 18,
        status: scenario.status,
        confirmedAt,
        checkedInAt,
        completedAt,
        cancelledAt,
        cancelReason: (scenario as any).cancelReason || null,
        players: {
          create: scenario.players.map((p: any) => {
            const basePlayer = {
              position: p.pos,
              playerType: p.type,
              checkedIn: p.checkedIn || false,
              checkedInAt: p.checkedIn ? new Date() : null,
            };

            if (p.type === PlayerType.MEMBER && p.memberIdx !== undefined) {
              const member = activeMembers[p.memberIdx % activeMembers.length];
              return {
                ...basePlayer,
                memberId: member.id,
              };
            } else {
              return {
                ...basePlayer,
                guestName: p.guestName || 'Guest Player',
                guestEmail: p.guestName ? `${p.guestName.toLowerCase().replace(/\s+/g, '.')}@guest.com` : null,
                guestPhone: '+66 99 999 9999',
              };
            }
          }),
        },
      },
    });

    createdTeeTimeCount++;
    createdPlayerCount += scenario.players.length;
  }

  console.log(`✅ Created ${createdTeeTimeCount} tee times with ${createdPlayerCount} players`);

  // ============================================================================
  // SAMPLE TEE TIMES WITH RATES & PAYMENT TRACKING
  // ============================================================================
  console.log('Creating sample tee times with rate calculations and payment states...');

  // Helper function to calculate fees based on rate config
  const getGreenFee = (playerType: string, holes: number, timeCategory: string = 'STANDARD'): number => {
    const rates: Record<string, Record<number, Record<string, number>>> = {
      'MEMBER': { 18: { STANDARD: 50, PRIME_TIME: 65, OFF_PEAK: 35 }, 9: { STANDARD: 30, PRIME_TIME: 40, OFF_PEAK: 20 } },
      'GUEST': { 18: { STANDARD: 150, PRIME_TIME: 180, OFF_PEAK: 120 }, 9: { STANDARD: 90, PRIME_TIME: 110, OFF_PEAK: 70 } },
      'DEPENDENT': { 18: { STANDARD: 75, PRIME_TIME: 90, OFF_PEAK: 60 }, 9: { STANDARD: 45, PRIME_TIME: 55, OFF_PEAK: 35 } },
      'WALK_UP': { 18: { STANDARD: 180, PRIME_TIME: 210, OFF_PEAK: 150 }, 9: { STANDARD: 110, PRIME_TIME: 130, OFF_PEAK: 90 } },
    };
    return rates[playerType]?.[holes]?.[timeCategory] || 0;
  };

  const getCartFee = (cartType: string): number => {
    const rates: Record<string, number> = { 'SINGLE': 40, 'SHARED': 25, 'WALKING': 0 };
    return rates[cartType] || 0;
  };

  const getCaddyFee = (caddyType: string): number => {
    const rates: Record<string, number> = { 'FORECADDY': 30, 'SINGLE': 80, 'DOUBLE': 50 };
    return rates[caddyType] || 0;
  };

  // Example 1: Fully paid member booking with cart and caddy (tomorrow for E2E tests)
  const sampleTeeDateBase = new Date();
  sampleTeeDateBase.setDate(sampleTeeDateBase.getDate() + 1); // Tomorrow
  // Ensure it's a weekday (Mon-Fri) for consistent testing
  while (sampleTeeDateBase.getDay() === 0 || sampleTeeDateBase.getDay() === 6) {
    sampleTeeDateBase.setDate(sampleTeeDateBase.getDate() + 1);
  }
  const paidTeeDate = new Date(sampleTeeDateBase.getFullYear(), sampleTeeDateBase.getMonth(), sampleTeeDateBase.getDate());
  console.log(`📅 Creating sample tee times for date: ${paidTeeDate.toISOString().split('T')[0]}`);
  const paidMember = activeMembers[0];

  let fullyPaidTeeTime = await prisma.teeTime.findFirst({
    where: {
      clubId: demoClub.id,
      courseId: golfCourse.id,
      teeDate: paidTeeDate,
      teeTime: '08:00',
    },
  });

  if (!fullyPaidTeeTime) {
    fullyPaidTeeTime = await prisma.teeTime.create({
      data: {
        clubId: demoClub.id,
        courseId: golfCourse.id,
        teeTimeNumber: getNextTeeTimeNumber(),
        teeDate: paidTeeDate,
        teeTime: '08:00',
        holes: 18,
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        players: {
          create: [
            {
              position: 1,
              playerType: PlayerType.MEMBER,
              memberId: paidMember.id,
              cartType: CartType.SINGLE,
              cartStatus: 'PAID' as RentalStatus,
              caddyStatus: 'PAID' as RentalStatus,
              greenFee: getGreenFee('MEMBER', 18, 'PRIME_TIME'),
              cartFee: getCartFee('SINGLE'),
              caddyFee: getCaddyFee('SINGLE'),
            },
            {
              position: 2,
              playerType: PlayerType.GUEST,
              guestName: 'John Smith',
              guestEmail: 'john.smith@guest.com',
              guestPhone: '+66 99 123 4567',
              cartType: CartType.SHARED,
              sharedWithPosition: 1,
              cartStatus: 'PAID' as RentalStatus,
              caddyStatus: 'NONE' as RentalStatus,
              greenFee: getGreenFee('GUEST', 18, 'PRIME_TIME'),
              cartFee: getCartFee('SHARED'),
              caddyFee: 0,
            },
          ],
        },
      },
    });
  }

  // Add line items for fully paid booking
  const fullyPaidPlayers = await prisma.teeTimePlayer.findMany({
    where: { teeTimeId: fullyPaidTeeTime!.id },
    orderBy: { position: 'asc' },
  });

  const taxRate = 7; // 7% VAT

  for (const player of fullyPaidPlayers) {
    // Check if line items already exist for this player
    const existingLineItems = await prisma.bookingLineItem.findMany({
      where: { teeTimePlayerId: player.id },
    });

    if (existingLineItems.length === 0) {
      // Create Green Fee line item
      const greenFeeBase = Number(player.greenFee || 0);
      if (greenFeeBase > 0) {
        const greenFeeTax = greenFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.GREEN_FEE,
            description: `Green Fee (18 holes) - ${player.playerType === 'MEMBER' ? 'Member' : 'Guest'}`,
            baseAmount: greenFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: greenFeeTax,
            totalAmount: greenFeeBase + greenFeeTax,
            isPaid: true,
            paidAt: new Date(),
            paymentMethodId: memberAccountMethod.id,
          },
        });
      }

      // Create Cart Fee line item
      const cartFeeBase = Number(player.cartFee || 0);
      if (cartFeeBase > 0) {
        const cartFeeTax = cartFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.CART,
            description: `Cart Fee - ${player.cartType === 'SINGLE' ? 'Single' : 'Shared'}`,
            baseAmount: cartFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: cartFeeTax,
            totalAmount: cartFeeBase + cartFeeTax,
            isPaid: true,
            paidAt: new Date(),
            paymentMethodId: memberAccountMethod.id,
          },
        });
      }

      // Create Caddy Fee line item
      const caddyFeeBase = Number(player.caddyFee || 0);
      if (caddyFeeBase > 0) {
        const caddyFeeTax = caddyFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.CADDY,
            description: 'Caddy Fee',
            baseAmount: caddyFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: caddyFeeTax,
            totalAmount: caddyFeeBase + caddyFeeTax,
            isPaid: true,
            paidAt: new Date(),
            paymentMethodId: memberAccountMethod.id,
          },
        });
      }
    }
  }

  console.log('✅ Created line items for fully paid booking');

  // Example 2: Unpaid guest booking (same day as Example 1, different time for E2E tests)
  const unpaidTeeDate = paidTeeDate; // Same date for easier testing
  const unpaidMember = activeMembers[1];

  let unpaidTeeTime = await prisma.teeTime.findFirst({
    where: {
      clubId: demoClub.id,
      courseId: golfCourse.id,
      teeDate: unpaidTeeDate,
      teeTime: '10:00',
    },
  });

  if (!unpaidTeeTime) {
    unpaidTeeTime = await prisma.teeTime.create({
      data: {
        clubId: demoClub.id,
        courseId: golfCourse.id,
        teeTimeNumber: getNextTeeTimeNumber(),
        teeDate: unpaidTeeDate,
        teeTime: '10:00',
        holes: 18,
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        players: {
          create: [
            {
              position: 1,
              playerType: PlayerType.GUEST,
              guestName: 'Sarah Johnson',
              guestEmail: 'sarah.j@corporate.com',
              guestPhone: '+66 88 234 5678',
              cartType: CartType.SINGLE,
              cartStatus: 'REQUESTED' as RentalStatus,
              caddyStatus: 'REQUESTED' as RentalStatus,
              greenFee: getGreenFee('GUEST', 18, 'STANDARD'),
              cartFee: getCartFee('SINGLE'),
              caddyFee: getCaddyFee('SINGLE'),
            },
            {
              position: 2,
              playerType: PlayerType.GUEST,
              guestName: 'Michael Lee',
              guestEmail: 'michael.lee@corporate.com',
              guestPhone: '+66 88 345 6789',
              cartType: CartType.SHARED,
              sharedWithPosition: 1,
              cartStatus: 'REQUESTED' as RentalStatus,
              caddyStatus: 'NONE' as RentalStatus,
              greenFee: getGreenFee('GUEST', 18, 'STANDARD'),
              cartFee: getCartFee('SHARED'),
              caddyFee: 0,
            },
            {
              position: 3,
              playerType: PlayerType.GUEST,
              guestName: 'Emma Wilson',
              guestEmail: 'emma.w@corporate.com',
              guestPhone: '+66 88 456 7890',
              cartType: CartType.WALKING,
              cartStatus: 'NONE' as RentalStatus,
              caddyStatus: 'NONE' as RentalStatus,
              greenFee: getGreenFee('GUEST', 18, 'STANDARD'),
              cartFee: 0,
              caddyFee: 0,
            },
          ],
        },
      },
    });
  }

  // Add UNPAID line items for unpaid booking
  const unpaidPlayers = await prisma.teeTimePlayer.findMany({
    where: { teeTimeId: unpaidTeeTime!.id },
    orderBy: { position: 'asc' },
  });

  for (const player of unpaidPlayers) {
    // Check if line items already exist for this player
    const existingLineItems = await prisma.bookingLineItem.findMany({
      where: { teeTimePlayerId: player.id },
    });

    if (existingLineItems.length === 0) {
      // Create Green Fee line item (unpaid)
      const greenFeeBase = Number(player.greenFee || 0);
      if (greenFeeBase > 0) {
        const greenFeeTax = greenFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.GREEN_FEE,
            description: `Green Fee (18 holes) - Guest`,
            baseAmount: greenFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: greenFeeTax,
            totalAmount: greenFeeBase + greenFeeTax,
            isPaid: false,  // UNPAID
          },
        });
      }

      // Create Cart Fee line item (unpaid)
      const cartFeeBase = Number(player.cartFee || 0);
      if (cartFeeBase > 0) {
        const cartFeeTax = cartFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.CART,
            description: `Cart Fee - ${player.cartType === 'SINGLE' ? 'Single' : 'Shared'}`,
            baseAmount: cartFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: cartFeeTax,
            totalAmount: cartFeeBase + cartFeeTax,
            isPaid: false,  // UNPAID
          },
        });
      }

      // Create Caddy Fee line item (unpaid)
      const caddyFeeBase = Number(player.caddyFee || 0);
      if (caddyFeeBase > 0) {
        const caddyFeeTax = caddyFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.CADDY,
            description: 'Caddy Fee',
            baseAmount: caddyFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: caddyFeeTax,
            totalAmount: caddyFeeBase + caddyFeeTax,
            isPaid: false,  // UNPAID
          },
        });
      }
    }
  }

  console.log('✅ Created line items for unpaid booking');

  // Example 3: Partially paid booking - member with guests (same day for E2E tests)
  const partialTeeDate = paidTeeDate; // Same date for easier testing
  const partialMember = activeMembers[2];

  let partialTeeTime = await prisma.teeTime.findFirst({
    where: {
      clubId: demoClub.id,
      courseId: golfCourse.id,
      teeDate: partialTeeDate,
      teeTime: '14:00',
    },
  });

  if (!partialTeeTime) {
    partialTeeTime = await prisma.teeTime.create({
      data: {
        clubId: demoClub.id,
        courseId: golfCourse.id,
        teeTimeNumber: getNextTeeTimeNumber(),
        teeDate: partialTeeDate,
        teeTime: '14:00',
        holes: 18,
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        players: {
          create: [
            {
              position: 1,
              playerType: PlayerType.MEMBER,
              memberId: partialMember.id,
              cartType: CartType.SINGLE,
              cartStatus: 'PAID' as RentalStatus,
              caddyStatus: 'PAID' as RentalStatus,
              greenFee: getGreenFee('MEMBER', 18, 'PRIME_TIME'),
              cartFee: getCartFee('SINGLE'),
              caddyFee: getCaddyFee('SINGLE'),
            },
            {
              position: 2,
              playerType: PlayerType.GUEST,
              guestName: 'David Chen',
              guestEmail: 'david.chen@guest.com',
              guestPhone: '+66 99 567 8901',
              cartType: CartType.SHARED,
              sharedWithPosition: 1,
              cartStatus: 'REQUESTED' as RentalStatus,
              caddyStatus: 'REQUESTED' as RentalStatus,
              greenFee: getGreenFee('GUEST', 18, 'PRIME_TIME'),
              cartFee: getCartFee('SHARED'),
              caddyFee: getCaddyFee('SINGLE'),
            },
          ],
        },
      },
    });
  }

  // Add MIXED line items for partially paid booking (member paid, guest unpaid)
  const partialPlayers = await prisma.teeTimePlayer.findMany({
    where: { teeTimeId: partialTeeTime!.id },
    orderBy: { position: 'asc' },
  });

  for (const player of partialPlayers) {
    // Check if line items already exist for this player
    const existingLineItems = await prisma.bookingLineItem.findMany({
      where: { teeTimePlayerId: player.id },
    });

    if (existingLineItems.length === 0) {
      const isPaid = player.playerType === 'MEMBER'; // Member is pre-paid, guest is not

      // Create Green Fee line item
      const greenFeeBase = Number(player.greenFee || 0);
      if (greenFeeBase > 0) {
        const greenFeeTax = greenFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.GREEN_FEE,
            description: `Green Fee (18 holes) - ${player.playerType === 'MEMBER' ? 'Member' : 'Guest'}`,
            baseAmount: greenFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: greenFeeTax,
            totalAmount: greenFeeBase + greenFeeTax,
            isPaid: isPaid,
            paidAt: isPaid ? new Date() : undefined,
            paymentMethodId: isPaid ? memberAccountMethod.id : undefined,
          },
        });
      }

      // Create Cart Fee line item
      const cartFeeBase = Number(player.cartFee || 0);
      if (cartFeeBase > 0) {
        const cartFeeTax = cartFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.CART,
            description: `Cart Fee - ${player.cartType === 'SINGLE' ? 'Single' : 'Shared'}`,
            baseAmount: cartFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: cartFeeTax,
            totalAmount: cartFeeBase + cartFeeTax,
            isPaid: isPaid,
            paidAt: isPaid ? new Date() : undefined,
            paymentMethodId: isPaid ? memberAccountMethod.id : undefined,
          },
        });
      }

      // Create Caddy Fee line item
      const caddyFeeBase = Number(player.caddyFee || 0);
      if (caddyFeeBase > 0) {
        const caddyFeeTax = caddyFeeBase * (taxRate / 100);
        await prisma.bookingLineItem.create({
          data: {
            teeTimePlayerId: player.id,
            type: LineItemType.CADDY,
            description: 'Caddy Fee',
            baseAmount: caddyFeeBase,
            taxType: TaxType.ADD,
            taxRate: taxRate,
            taxAmount: caddyFeeTax,
            totalAmount: caddyFeeBase + caddyFeeTax,
            isPaid: isPaid,
            paidAt: isPaid ? new Date() : undefined,
            paymentMethodId: isPaid ? memberAccountMethod.id : undefined,
          },
        });
      }
    }
  }

  console.log('✅ Created line items for partially paid booking');

  // ============================================================================
  // POS BUTTON REGISTRY & TEMPLATES
  // ============================================================================
  console.log('Creating POS configuration...');

  // Update club with POS button registry
  const posButtonRegistry = {
    'pos.pay': { id: 'pos.pay', label: 'Pay', icon: 'CreditCard', category: 'payment', color: 'primary', size: 'large', outlets: ['*'], shortcut: 'P' },
    'pos.addItem': { id: 'pos.addItem', label: 'Add Item', icon: 'Plus', category: 'cart', color: 'neutral', size: 'medium', outlets: ['*'] },
    'pos.discount': { id: 'pos.discount', label: 'Discount', icon: 'Percent', category: 'cart', color: 'warning', size: 'medium', outlets: ['*'], permissions: ['pos.discount.apply'] },
    'pos.void': { id: 'pos.void', label: 'Void', icon: 'X', category: 'cart', color: 'danger', size: 'medium', outlets: ['*'], permissions: ['pos.void'], confirmAction: true },
    'pos.hold': { id: 'pos.hold', label: 'Hold', icon: 'Pause', category: 'cart', color: 'neutral', size: 'medium', outlets: ['*'] },
    'pos.print': { id: 'pos.print', label: 'Print', icon: 'Printer', category: 'utility', color: 'neutral', size: 'medium', outlets: ['*'] },
    'pos.transfer': { id: 'pos.transfer', label: 'Transfer', icon: 'ArrowRightLeft', category: 'cart', color: 'neutral', size: 'medium', outlets: ['*'] },
    'pos.payCard': { id: 'pos.payCard', label: 'Card', icon: 'CreditCard', category: 'payment', color: 'primary', size: 'medium', outlets: ['*'] },
    'pos.payAccount': { id: 'pos.payAccount', label: 'Account', icon: 'User', category: 'payment', color: 'primary', size: 'medium', outlets: ['*'] },
    'pos.payCash': { id: 'pos.payCash', label: 'Cash', icon: 'Banknote', category: 'payment', color: 'primary', size: 'medium', outlets: ['*'] },
    'golf.checkin': { id: 'golf.checkin', label: 'Check In', icon: 'UserCheck', category: 'checkin', color: 'success', size: 'large', outlets: ['golf-checkin'], requiresSelection: true, selectionType: 'teeTime', shortcut: 'C' },
    'golf.settle': { id: 'golf.settle', label: 'Settle', icon: 'Receipt', category: 'payment', color: 'primary', size: 'large', outlets: ['golf-checkin'], requiresSelection: true },
    'golf.printTicket': { id: 'golf.printTicket', label: 'Print Ticket', icon: 'Ticket', category: 'utility', color: 'neutral', size: 'medium', outlets: ['golf-checkin'], requiresSelection: true },
  };

  await prisma.club.update({
    where: { id: demoClub.id },
    data: { posButtonRegistry },
  });

  console.log('✅ Updated club with POS button registry');

  // Create POS Templates
  const posTemplates = await Promise.all([
    // Golf Check-in Template
    prisma.pOSTemplate.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'Golf Check-in Default' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Golf Check-in Default',
        description: 'Default template for golf check-in counter',
        outletType: 'golf',
        isDefault: true,
        toolbarConfig: {
          zones: {
            left: { type: 'search', placeholder: 'Search member or tee time...', width: 'flex-1' },
            center: { type: 'categories', items: ['Tee Times', 'Walk-ups', 'On Course'] },
            right: { type: 'actions', items: ['golf.printTicket', 'pos.print'] },
          },
        },
        actionBarConfig: {
          rows: 2,
          columns: 6,
          buttons: [
            // Row 1
            { row: 0, col: 0, colSpan: 2, buttonId: 'golf.checkin' },
            { row: 0, col: 2, colSpan: 2, buttonId: 'golf.settle' },
            { row: 0, col: 4, buttonId: 'pos.addItem' },
            { row: 0, col: 5, buttonId: 'pos.discount' },
            // Row 2
            { row: 1, col: 0, buttonId: 'pos.payCard' },
            { row: 1, col: 1, buttonId: 'pos.payAccount' },
            { row: 1, col: 2, buttonId: 'pos.payCash' },
            { row: 1, col: 3, buttonId: 'pos.void' },
            { row: 1, col: 4, buttonId: 'pos.hold' },
            { row: 1, col: 5, buttonId: 'pos.print' },
          ],
        },
      },
    }),

    // Pro Shop Template
    prisma.pOSTemplate.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'Pro Shop Default' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Pro Shop Default',
        description: 'Default template for pro shop retail',
        outletType: 'pro-shop',
        isDefault: true,
        toolbarConfig: {
          zones: {
            left: { type: 'search', placeholder: 'Search products...', width: 'flex-1' },
            center: { type: 'categories', items: ['Apparel', 'Equipment', 'Accessories', 'Snacks', 'Rentals'] },
            right: { type: 'actions', items: ['pos.print'] },
          },
        },
        actionBarConfig: {
          rows: 2,
          columns: 6,
          buttons: [
            // Row 1
            { row: 0, col: 0, colSpan: 2, buttonId: 'pos.pay' },
            { row: 0, col: 2, buttonId: 'pos.addItem' },
            { row: 0, col: 3, buttonId: 'pos.discount' },
            { row: 0, col: 4, buttonId: 'pos.void' },
            { row: 0, col: 5, buttonId: 'pos.hold' },
            // Row 2
            { row: 1, col: 0, buttonId: 'pos.payCard' },
            { row: 1, col: 1, buttonId: 'pos.payAccount' },
            { row: 1, col: 2, buttonId: 'pos.payCash' },
            { row: 1, col: 3, buttonId: 'pos.transfer' },
            { row: 1, col: 4, colSpan: 2, buttonId: 'pos.print' },
          ],
        },
      },
    }),

    // Spa Template
    prisma.pOSTemplate.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'Spa Default' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Spa Default',
        description: 'Default template for spa front desk',
        outletType: 'spa',
        isDefault: true,
        toolbarConfig: {
          zones: {
            left: { type: 'search', placeholder: 'Search member or booking...', width: 'flex-1' },
            center: { type: 'categories', items: ['Treatments', 'Packages', 'Products'] },
            right: { type: 'actions', items: ['pos.print'] },
          },
        },
        actionBarConfig: {
          rows: 2,
          columns: 6,
          buttons: [
            // Row 1
            { row: 0, col: 0, colSpan: 2, buttonId: 'pos.pay' },
            { row: 0, col: 2, buttonId: 'pos.addItem' },
            { row: 0, col: 3, buttonId: 'pos.discount' },
            { row: 0, col: 4, buttonId: 'pos.void' },
            { row: 0, col: 5, buttonId: 'pos.hold' },
            // Row 2
            { row: 1, col: 0, buttonId: 'pos.payCard' },
            { row: 1, col: 1, buttonId: 'pos.payAccount' },
            { row: 1, col: 2, buttonId: 'pos.payCash' },
            { row: 1, col: 3, buttonId: 'pos.transfer' },
            { row: 1, col: 4, colSpan: 2, buttonId: 'pos.print' },
          ],
        },
      },
    }),

    // F&B Template
    prisma.pOSTemplate.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'F&B Default' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'F&B Default',
        description: 'Default template for food and beverage outlets',
        outletType: 'fnb',
        isDefault: true,
        toolbarConfig: {
          zones: {
            left: { type: 'search', placeholder: 'Search member or table...', width: 'flex-1' },
            center: { type: 'categories', items: ['Food', 'Beverages', 'Desserts', 'Specials'] },
            right: { type: 'actions', items: ['pos.print'] },
          },
        },
        actionBarConfig: {
          rows: 2,
          columns: 6,
          buttons: [
            // Row 1
            { row: 0, col: 0, colSpan: 2, buttonId: 'pos.pay' },
            { row: 0, col: 2, buttonId: 'pos.addItem' },
            { row: 0, col: 3, buttonId: 'pos.discount' },
            { row: 0, col: 4, buttonId: 'pos.void' },
            { row: 0, col: 5, buttonId: 'pos.hold' },
            // Row 2
            { row: 1, col: 0, buttonId: 'pos.payCard' },
            { row: 1, col: 1, buttonId: 'pos.payAccount' },
            { row: 1, col: 2, buttonId: 'pos.payCash' },
            { row: 1, col: 3, buttonId: 'pos.transfer' },
            { row: 1, col: 4, colSpan: 2, buttonId: 'pos.print' },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${posTemplates.length} POS templates`);

  // Create POS Outlets
  const golfTemplate = posTemplates.find(t => t.outletType === 'golf');
  const proShopTemplate = posTemplates.find(t => t.outletType === 'pro-shop');
  const spaTemplate = posTemplates.find(t => t.outletType === 'spa');
  const fnbTemplate = posTemplates.find(t => t.outletType === 'fnb');

  const posOutlets = await Promise.all([
    prisma.pOSOutlet.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'Golf Check-in' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Golf Check-in',
        outletType: 'golf',
        templateId: golfTemplate?.id,
        customConfig: {},
        isActive: true,
      },
    }),
    prisma.pOSOutlet.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'Pro Shop' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Pro Shop',
        outletType: 'pro-shop',
        templateId: proShopTemplate?.id,
        customConfig: {},
        isActive: true,
      },
    }),
    prisma.pOSOutlet.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'Spa Front Desk' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Spa Front Desk',
        outletType: 'spa',
        templateId: spaTemplate?.id,
        customConfig: {},
        isActive: true,
      },
    }),
    prisma.pOSOutlet.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'Restaurant' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Restaurant',
        outletType: 'fnb',
        templateId: fnbTemplate?.id,
        customConfig: {},
        isActive: true,
      },
    }),
    prisma.pOSOutlet.upsert({
      where: { clubId_name: { clubId: demoClub.id, name: 'Bar' } },
      update: {},
      create: {
        clubId: demoClub.id,
        name: 'Bar',
        outletType: 'fnb',
        templateId: fnbTemplate?.id,
        customConfig: {},
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${posOutlets.length} POS outlets`);

  // Create POS Outlet Role Configs
  const golfCheckinOutlet = posOutlets.find(o => o.name === 'Golf Check-in');
  const proShopOutlet = posOutlets.find(o => o.name === 'Pro Shop');

  if (golfCheckinOutlet) {
    await Promise.all([
      // Cashier role - hide void, require approval for discount
      prisma.pOSOutletRoleConfig.upsert({
        where: { outletId_role: { outletId: golfCheckinOutlet.id, role: 'cashier' } },
        update: {},
        create: {
          outletId: golfCheckinOutlet.id,
          role: 'cashier',
          buttonOverrides: {
            hidden: ['pos.void'],
            disabled: [],
            requireApproval: ['pos.discount'],
          },
        },
      }),
      // Manager role - full access
      prisma.pOSOutletRoleConfig.upsert({
        where: { outletId_role: { outletId: golfCheckinOutlet.id, role: 'manager' } },
        update: {},
        create: {
          outletId: golfCheckinOutlet.id,
          role: 'manager',
          buttonOverrides: {
            hidden: [],
            disabled: [],
            requireApproval: [],
          },
        },
      }),
    ]);
  }

  if (proShopOutlet) {
    await Promise.all([
      // Cashier role - hide void, require approval for discount
      prisma.pOSOutletRoleConfig.upsert({
        where: { outletId_role: { outletId: proShopOutlet.id, role: 'cashier' } },
        update: {},
        create: {
          outletId: proShopOutlet.id,
          role: 'cashier',
          buttonOverrides: {
            hidden: ['pos.void'],
            disabled: [],
            requireApproval: ['pos.discount'],
          },
        },
      }),
      // Manager role - full access
      prisma.pOSOutletRoleConfig.upsert({
        where: { outletId_role: { outletId: proShopOutlet.id, role: 'manager' } },
        update: {},
        create: {
          outletId: proShopOutlet.id,
          role: 'manager',
          buttonOverrides: {
            hidden: [],
            disabled: [],
            requireApproval: [],
          },
        },
      }),
    ]);
  }

  console.log('✅ Created POS outlet role configurations');

  // Example 4: Walk-up booking (same day for E2E tests - Twilight)
  const walkupTeeDate = paidTeeDate; // Same date for easier testing

  let walkupTeeTime = await prisma.teeTime.findFirst({
    where: {
      clubId: demoClub.id,
      courseId: golfCourse.id,
      teeDate: walkupTeeDate,
      teeTime: '16:00',
    },
  });

  if (!walkupTeeTime) {
    walkupTeeTime = await prisma.teeTime.create({
      data: {
        clubId: demoClub.id,
        courseId: golfCourse.id,
        teeTimeNumber: getNextTeeTimeNumber(),
        teeDate: walkupTeeDate,
        teeTime: '16:00',
        holes: 9,
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        players: {
          create: [
            {
              position: 1,
              playerType: PlayerType.WALK_UP,
              guestName: 'Twilight Walker 1',
              guestEmail: 'walkup1@example.com',
              guestPhone: '+66 99 678 9012',
              cartType: CartType.WALKING,
              cartStatus: 'NONE' as RentalStatus,
              caddyStatus: 'NONE' as RentalStatus,
              greenFee: getGreenFee('WALK_UP', 9, 'OFF_PEAK'),
              cartFee: 0,
              caddyFee: 0,
            },
            {
              position: 2,
              playerType: PlayerType.WALK_UP,
              guestName: 'Twilight Walker 2',
              guestEmail: 'walkup2@example.com',
              guestPhone: '+66 99 789 0123',
              cartType: CartType.WALKING,
              cartStatus: 'NONE' as RentalStatus,
              caddyStatus: 'NONE' as RentalStatus,
              greenFee: getGreenFee('WALK_UP', 9, 'OFF_PEAK'),
              cartFee: 0,
              caddyFee: 0,
            },
          ],
        },
      },
    });
  }

  // Example 5: Four-ball with mixed players and forecaddy (same day for E2E tests)
  const fourballTeeDate = paidTeeDate; // Same date for easier testing
  const fourballMember1 = activeMembers[3];
  const fourballMember2 = activeMembers[4];

  let fourballTeeTime = await prisma.teeTime.findFirst({
    where: {
      clubId: demoClub.id,
      courseId: golfCourse.id,
      teeDate: fourballTeeDate,
      teeTime: '07:04',
    },
  });

  if (!fourballTeeTime) {
    fourballTeeTime = await prisma.teeTime.create({
      data: {
        clubId: demoClub.id,
        courseId: golfCourse.id,
        teeTimeNumber: getNextTeeTimeNumber(),
        teeDate: fourballTeeDate,
        teeTime: '07:04',
        holes: 18,
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        players: {
          create: [
            {
              position: 1,
              playerType: PlayerType.MEMBER,
              memberId: fourballMember1.id,
              cartType: CartType.SHARED,
              sharedWithPosition: 2,
              cartStatus: 'PAID' as RentalStatus,
              caddyStatus: 'PAID' as RentalStatus,
              greenFee: getGreenFee('MEMBER', 18, 'PRIME_TIME'),
              cartFee: getCartFee('SHARED'),
              caddyFee: getCaddyFee('FORECADDY'),
            },
            {
              position: 2,
              playerType: PlayerType.MEMBER,
              memberId: fourballMember2.id,
              cartType: CartType.SHARED,
              sharedWithPosition: 1,
              cartStatus: 'PAID' as RentalStatus,
              caddyStatus: 'PAID' as RentalStatus,
              greenFee: getGreenFee('MEMBER', 18, 'PRIME_TIME'),
              cartFee: getCartFee('SHARED'),
              caddyFee: getCaddyFee('FORECADDY'),
            },
            {
              position: 3,
              playerType: PlayerType.GUEST,
              guestName: 'VIP Guest 1',
              guestEmail: 'vip1@corporate.com',
              guestPhone: '+66 99 890 1234',
              cartType: CartType.SHARED,
              sharedWithPosition: 4,
              cartStatus: 'PAID' as RentalStatus,
              caddyStatus: 'PAID' as RentalStatus,
              greenFee: getGreenFee('GUEST', 18, 'PRIME_TIME'),
              cartFee: getCartFee('SHARED'),
              caddyFee: getCaddyFee('FORECADDY'),
            },
            {
              position: 4,
              playerType: PlayerType.GUEST,
              guestName: 'VIP Guest 2',
              guestEmail: 'vip2@corporate.com',
              guestPhone: '+66 99 901 2345',
              cartType: CartType.SHARED,
              sharedWithPosition: 3,
              cartStatus: 'PAID' as RentalStatus,
              caddyStatus: 'PAID' as RentalStatus,
              greenFee: getGreenFee('GUEST', 18, 'PRIME_TIME'),
              cartFee: getCartFee('SHARED'),
              caddyFee: getCaddyFee('FORECADDY'),
            },
          ],
        },
      },
    });
  }

  console.log('✅ Created 5 sample tee times with detailed rate calculations:');
  console.log(`   - Fully paid member + guest (Prime Time)`);
  console.log(`   - Unpaid 3-guest booking (Standard Time)`);
  console.log(`   - Partially paid member + guest (Prime Time)`);
  console.log(`   - Walk-up twilight 9-hole (Off-Peak)`);
  console.log(`   - Four-ball with forecaddy (Prime Time)`);

  // ============================================================================
  // LOOKUP TABLES (Global Defaults)
  // ============================================================================
  console.log('');
  await seedLookups(prisma);

  // ============================================================================
  // EVENTS & ANNOUNCEMENTS
  // ============================================================================
  console.log('');
  console.log('Creating events and announcements...');

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in2Weeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in3Weeks = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  await prisma.event.createMany({
    data: [
      {
        clubId: demoClub.id,
        title: 'Monthly Medal Tournament',
        description: 'Our flagship monthly stableford competition open to all members. Prizes for gross and nett winners. Followed by dinner and awards ceremony at the Terrace Restaurant.',
        category: 'GOLF',
        location: 'Championship Course',
        startDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 7, 0),
        endDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 18, 0),
        capacity: 120,
        price: 2500,
        isPublished: true,
        isFeatured: true,
      },
      {
        clubId: demoClub.id,
        title: 'Wine & Cheese Evening',
        description: 'An exclusive tasting event featuring premium wines from Burgundy paired with artisanal cheeses. Limited to 40 guests.',
        category: 'SOCIAL',
        location: 'The Cellar Lounge',
        startDate: new Date(in2Weeks.getFullYear(), in2Weeks.getMonth(), in2Weeks.getDate(), 19, 0),
        endDate: new Date(in2Weeks.getFullYear(), in2Weeks.getMonth(), in2Weeks.getDate(), 22, 0),
        capacity: 40,
        price: 3500,
        isPublished: true,
        isFeatured: true,
      },
      {
        clubId: demoClub.id,
        title: 'Kids Swimming Clinic',
        description: 'Professional swimming lessons for children aged 5-12. All skill levels welcome. Equipment provided.',
        category: 'KIDS',
        location: 'Olympic Pool',
        startDate: new Date(in2Weeks.getFullYear(), in2Weeks.getMonth(), in2Weeks.getDate() + 1, 9, 0),
        endDate: new Date(in2Weeks.getFullYear(), in2Weeks.getMonth(), in2Weeks.getDate() + 1, 12, 0),
        capacity: 20,
        price: 800,
        isPublished: true,
      },
      {
        clubId: demoClub.id,
        title: 'Yoga & Wellness Retreat',
        description: 'A full-day wellness experience with morning yoga, guided meditation, spa treatments, and a healthy lunch. Led by our resident wellness expert.',
        category: 'FITNESS',
        location: 'Wellness Center & Spa',
        startDate: new Date(in3Weeks.getFullYear(), in3Weeks.getMonth(), in3Weeks.getDate(), 8, 0),
        endDate: new Date(in3Weeks.getFullYear(), in3Weeks.getMonth(), in3Weeks.getDate(), 16, 0),
        capacity: 25,
        price: 4500,
        isPublished: true,
      },
      {
        clubId: demoClub.id,
        title: 'Sunday Brunch Buffet',
        description: 'Our legendary Sunday brunch featuring live cooking stations, seafood, and a dessert bar. Complimentary welcome drink for members.',
        category: 'DINING',
        location: 'Grand Ballroom',
        startDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate() + 2, 11, 0),
        endDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate() + 2, 15, 0),
        capacity: 150,
        price: 1800,
        isPublished: true,
      },
      {
        clubId: demoClub.id,
        title: 'Inter-Club Golf Championship',
        description: 'Annual competition against Royal Hua Hin Golf Club. Team selection based on handicap. Represent our club!',
        category: 'GOLF',
        location: 'Championship Course',
        startDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate(), 6, 30),
        endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate(), 19, 0),
        capacity: 60,
        isPublished: true,
        isFeatured: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.announcement.createMany({
    data: [
      {
        clubId: demoClub.id,
        title: 'Course Maintenance Schedule Update',
        body: 'The Championship Course will undergo aeration on holes 10-18 from February 15-17. The front nine will remain open for play. Please book tee times accordingly. We apologize for any inconvenience.',
        category: 'MAINTENANCE',
        isPinned: true,
        publishedAt: new Date(),
      },
      {
        clubId: demoClub.id,
        title: 'New Pool Hours Starting March',
        body: 'Starting March 1st, the Olympic Pool will open 30 minutes earlier at 5:30 AM on weekdays to accommodate early morning lap swimmers. Weekend hours remain unchanged (6:00 AM - 9:00 PM).',
        category: 'GENERAL',
        publishedAt: new Date(),
      },
      {
        clubId: demoClub.id,
        title: 'Introducing Chef Tanaka\'s Omakase Night',
        body: 'Every Thursday evening, Chef Tanaka presents a 7-course Japanese omakase dinner at Sakura Restaurant. Limited to 12 seats per evening. Member price: ฿4,500 per person. Reservations required 48 hours in advance.',
        category: 'DINING',
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: demoClub.id,
        title: 'Junior Golf Academy Registration Open',
        body: 'Registration is now open for the 2026 Junior Golf Academy season (March-June). Our PGA-certified coaches will provide structured training for ages 6-16. Early bird discount of 15% for registrations before February 28.',
        category: 'GOLF',
        isPinned: true,
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: demoClub.id,
        title: 'Valentine\'s Day Special Dinner',
        body: 'Celebrate Valentine\'s Day at The Terrace with a special 5-course dinner paired with champagne. ฿6,800 per couple. Live music by the Jazz Quartet. Book before February 10 to secure your table.',
        category: 'SOCIAL',
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created events and announcements');

  // ============================================================================
  // SCORECARDS
  // ============================================================================
  console.log('Creating scorecards...');

  const scorecardData = [
    { daysAgo: 3, totalScore: 78, totalPutts: 32, fairwaysHit: 9, greensInReg: 11, weather: 'Sunny', holes: [
      4,4,3,5,4,3,4,5,4, 4,5,3,4,4,3,5,4,4
    ]},
    { daysAgo: 10, totalScore: 82, totalPutts: 34, fairwaysHit: 8, greensInReg: 9, weather: 'Cloudy', holes: [
      5,4,4,5,4,3,5,5,4, 4,5,4,4,5,3,5,4,4
    ]},
    { daysAgo: 18, totalScore: 75, totalPutts: 29, fairwaysHit: 11, greensInReg: 13, weather: 'Sunny', holes: [
      4,4,3,4,4,3,4,5,4, 4,4,3,4,4,3,5,4,4
    ]},
    { daysAgo: 25, totalScore: 80, totalPutts: 33, fairwaysHit: 10, greensInReg: 10, weather: 'Overcast', holes: [
      4,5,3,5,4,3,4,5,5, 4,5,3,4,4,4,5,4,4
    ]},
    { daysAgo: 35, totalScore: 84, totalPutts: 36, fairwaysHit: 7, greensInReg: 8, weather: 'Hot', holes: [
      5,5,4,5,4,4,5,5,4, 5,5,3,4,5,3,5,4,4
    ]},
  ];

  // Standard par for championship course (par 72)
  const parByHole = [4,4,3,5,4,3,4,5,4, 4,5,3,4,4,3,5,4,4];

  for (const sc of scorecardData) {
    const playedAt = new Date(now.getTime() - sc.daysAgo * 24 * 60 * 60 * 1000);
    const scorecard = await prisma.scorecard.create({
      data: {
        memberId: memberForPortal.id,
        courseId: golfCourse.id,
        playedAt,
        totalScore: sc.totalScore,
        totalPutts: sc.totalPutts,
        fairwaysHit: sc.fairwaysHit,
        greensInReg: sc.greensInReg,
        weather: sc.weather,
        holes: {
          create: sc.holes.map((strokes, i) => ({
            holeNumber: i + 1,
            par: parByHole[i]!,
            strokes,
            putts: Math.floor(Math.random() * 2) + 1,
            fairwayHit: Math.random() > 0.4,
            greenInReg: strokes <= parByHole[i]!,
          })),
        },
      },
    });
  }

  console.log('✅ Created scorecards');

  // ============================================================================
  // MULTI-TENANCY SEED
  // ============================================================================
  await seedMultitenancy(prisma);

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('Demo credentials:');
  console.log('');
  console.log('  Staff Application (http://localhost:3000):');
  console.log('    admin@royalbangkokclub.com / Admin123!  (Royal Bangkok)');
  console.log('    admin@phuketoceanclub.com / Admin123!   (Phuket Ocean)');
  console.log('');
  console.log('  Platform Manager (http://localhost:3002):');
  console.log('    superadmin@vantage.com / Admin123!');
  console.log('    platformadmin@vantage.com / Admin123!');
  console.log('');
  console.log('  Tenant Admin (http://localhost:3003):');
  console.log('    admin@royalbangkokclub.com / Admin123!');
  console.log('');
  console.log('  Member Portal (http://localhost:3004):');
  console.log('    member@demo.com / Member123!       (Full Member, Royal Bangkok)');
  console.log('    nattaya@demo.com / Member123!      (Full Member, Royal Bangkok)');
  console.log('    thaksin@demo.com / Member123!      (Golf Member, Royal Bangkok)');
  console.log('    chaiwat@demo.com / Member123!      (Social Member, Royal Bangkok)');
  console.log('    corporate@demo.com / Member123!    (Corporate Member, Royal Bangkok)');
  console.log('    phuket@demo.com / Member123!       (Full Member, Phuket Ocean)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
