import { searchMockNews } from '../utils/mockNews'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = String(query.search ?? '')
  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? 10)

  return searchMockNews(search, page, limit)
})
