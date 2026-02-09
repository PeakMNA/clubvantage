import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const certificateNumber = formData.get('certificateNumber') as string
    const certificateDate = formData.get('certificateDate') as string
    const amountStr = formData.get('amount') as string
    const invoiceNumber = formData.get('invoiceNumber') as string | null

    if (!file || !certificateNumber || !certificateDate || !amountStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Accepted: PDF, JPG, PNG' }, { status: 400 })
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 })
    }

    // Get member's club
    const member = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { clubId: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Store WHT metadata as JSON in description
    const whtMeta = JSON.stringify({
      certificateNumber,
      certificateDate,
      amount,
      status: 'SUBMITTED',
      ...(invoiceNumber ? { invoiceNumber } : {}),
    })

    // For now, store a placeholder file URL
    // In production, upload to Supabase Storage or S3
    const fileUrl = `/uploads/wht/${session.memberId}/${certificateNumber}-${Date.now()}.${file.name.split('.').pop()}`

    await prisma.memberDocument.create({
      data: {
        clubId: member.clubId,
        memberId: session.memberId,
        name: `WHT:${certificateNumber}`,
        type: 'OTHER',
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        description: whtMeta,
        uploadedBy: session.memberId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WHT upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
