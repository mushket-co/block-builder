import { NextResponse } from 'next/server'

import { searchMockNews } from '@/lib/mockNews'

function parseQuery(request: Request) {
  const url = new URL(request.url)

  return {
    search: url.searchParams.get('search') ?? '',
    page: Number(url.searchParams.get('page') ?? 1),
    limit: Number(url.searchParams.get('limit') ?? 10),
  }
}

export async function GET(request: Request) {
  const { search, page, limit } = parseQuery(request)
  return NextResponse.json(searchMockNews(search, page, limit))
}

export async function POST(request: Request) {
  const body = (await request.json()) as { search?: string; page?: number; limit?: number }
  const search = body.search ?? ''
  const page = Number(body.page ?? 1)
  const limit = Number(body.limit ?? 10)

  return NextResponse.json(searchMockNews(search, page, limit))
}
