import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { NextResponse } from 'next/server'

const STATIC_ICONS_DIR = path.resolve(process.cwd(), '../static/icons')

const MIME_TYPES: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params
  const relativePath = segments.join('/')
  const filePath = path.resolve(STATIC_ICONS_DIR, relativePath)

  if (!filePath.startsWith(STATIC_ICONS_DIR)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const content = await readFile(filePath)
    const extension = path.extname(filePath).toLowerCase()

    return new NextResponse(content, {
      headers: {
        'Content-Type': MIME_TYPES[extension] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
