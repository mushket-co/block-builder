type TJsonRecord = Record<string, unknown>

interface INewsItem {
  id: number
  name: string
  title: string
  date: string
}

/** Восстанавливает newsItems на клиенте после редактирования (SSR-поле с сервера). */
export async function enrichNewsListProps(props: TJsonRecord): Promise<TJsonRecord> {
  const newsIds = props.newsIds
  const featuredNewsId = props.featuredNewsId
  const hasNewsIds = Array.isArray(newsIds) && newsIds.length > 0
  const hasFeatured = featuredNewsId != null

  if (!hasNewsIds && !hasFeatured) {
    const next = { ...props }
    delete next.newsItems
    delete next.featuredNews
    return next
  }

  const response = await $fetch<{ data: INewsItem[] }>('/api/news?limit=100')
  const allNews = response.data ?? []
  const next: TJsonRecord = { ...props }

  delete next.featuredNews

  if (hasNewsIds) {
    next.newsItems = allNews.filter(item => (newsIds as number[]).includes(item.id))
  } else {
    delete next.newsItems
  }

  return next
}
