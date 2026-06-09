import { searchMockNews } from '../utils/mockNews'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    search?: string
    page?: number
    limit?: number
  }>(event)

  return searchMockNews(
    body?.search ?? '',
    Number(body?.page ?? 1),
    Number(body?.limit ?? 10)
  )
})
