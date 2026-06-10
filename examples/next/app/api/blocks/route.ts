import { NextResponse } from 'next/server'

import { enrichBlocksForSsr } from '@/lib/enrichBlocks'
import { readBlocksFromFile, writeBlocksToFile } from '@/lib/blocksFile'
import { serializeBlocksForStorage } from '@/lib/serializeBlocks'

export async function GET() {
  const blocks = await readBlocksFromFile()
  return NextResponse.json(enrichBlocksForSsr(blocks))
}

export async function POST(request: Request) {
  const body = (await request.json()) as unknown
  const blocks = enrichBlocksForSsr(
    serializeBlocksForStorage(Array.isArray(body) ? body : [])
  )

  await writeBlocksToFile(blocks)

  return NextResponse.json({
    ok: true,
    count: blocks.length,
    path: 'data/blocks.json',
  })
}
