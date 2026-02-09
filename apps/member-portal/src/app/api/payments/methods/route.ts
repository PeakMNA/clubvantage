import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe/server'

/**
 * Find the Stripe customer ID for a member from stored payment methods,
 * or create a new Stripe customer if none exists.
 */
async function getOrCreateStripeCustomer(memberId: string, clubId: string) {
  // Check if we already have a stripe customer ID from a previous payment method
  const existing = await prisma.storedPaymentMethod.findFirst({
    where: { memberId, stripeCustomerId: { not: null } },
    select: { stripeCustomerId: true },
  })

  if (existing?.stripeCustomerId) {
    return existing.stripeCustomerId
  }

  // Create a new Stripe customer
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { firstName: true, lastName: true, email: true },
  })

  if (!member) throw new Error('Member not found')

  const customer = await stripe.customers.create({
    name: `${member.firstName} ${member.lastName}`,
    email: member.email ?? undefined,
    metadata: { memberId },
  })

  return customer.id
}

// GET — List payment methods
export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const methods = await prisma.storedPaymentMethod.findMany({
      where: { memberId: session.memberId, status: 'ACTIVE' },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        stripePaymentMethodId: true,
        brand: true,
        last4: true,
        expiryMonth: true,
        expiryYear: true,
        isDefault: true,
      },
    })

    return NextResponse.json({
      methods: methods.map((m) => ({
        id: m.id,
        brand: m.brand,
        last4: m.last4,
        expiryMonth: m.expiryMonth,
        expiryYear: m.expiryYear,
        isDefault: m.isDefault,
      })),
    })
  } catch (error) {
    console.error('Failed to list payment methods:', error)
    return NextResponse.json({ error: 'Failed to load payment methods' }, { status: 500 })
  }
}

// POST — Create SetupIntent for adding a new card
export async function POST() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { clubId: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const customerId = await getOrCreateStripeCustomer(session.memberId, member.clubId)

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (error) {
    console.error('Failed to create setup intent:', error)
    return NextResponse.json({ error: 'Failed to setup card' }, { status: 500 })
  }
}

// DELETE — Remove a payment method
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { methodId } = await request.json()
    if (!methodId) {
      return NextResponse.json({ error: 'Missing methodId' }, { status: 400 })
    }

    // Verify the method belongs to this member
    const method = await prisma.storedPaymentMethod.findFirst({
      where: { id: methodId, memberId: session.memberId },
      select: { stripePaymentMethodId: true },
    })

    if (!method) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    // Detach from Stripe
    try {
      await stripe.paymentMethods.detach(method.stripePaymentMethodId)
    } catch {
      // If Stripe fails, still remove locally
    }

    // Mark as inactive locally
    await prisma.storedPaymentMethod.update({
      where: { id: methodId },
      data: { status: 'REMOVED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove payment method:', error)
    return NextResponse.json({ error: 'Failed to remove card' }, { status: 500 })
  }
}

// PATCH — Set default payment method
export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { methodId } = await request.json()
    if (!methodId) {
      return NextResponse.json({ error: 'Missing methodId' }, { status: 400 })
    }

    // Verify the method belongs to this member
    const method = await prisma.storedPaymentMethod.findFirst({
      where: { id: methodId, memberId: session.memberId },
    })

    if (!method) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    // Unset all defaults for this member, then set the new one
    await prisma.$transaction([
      prisma.storedPaymentMethod.updateMany({
        where: { memberId: session.memberId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.storedPaymentMethod.update({
        where: { id: methodId },
        data: { isDefault: true },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to set default:', error)
    return NextResponse.json({ error: 'Failed to set default' }, { status: 500 })
  }
}
