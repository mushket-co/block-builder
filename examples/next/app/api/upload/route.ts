import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  await request.formData()
  await new Promise(resolve => setTimeout(resolve, 300))

  return NextResponse.json({
    url: '/icons/image.svg',
  })
}
