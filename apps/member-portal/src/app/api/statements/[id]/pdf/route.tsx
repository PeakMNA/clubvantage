import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getStatementById } from '@/lib/data/billing'
import { StatementPdf } from './statement-pdf'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const statement = await getStatementById(id)
  if (!statement) {
    return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
  }

  const buffer = await renderToBuffer(<StatementPdf statement={statement} />)
  const bytes = new Uint8Array(buffer)

  const filename = `statement-${statement.statementNumber ?? statement.id}.pdf`

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
