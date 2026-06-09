import {
  extractApiSelectValueId,
  extractApiSelectValueIds,
} from '../../../../src/utils/apiSelectValueHelpers'

type TJsonRecord = Record<string, unknown>

interface INewsItem {
  id: number
  name: string
  title: string
  date: string
}

/** Восстанавливает newsItems на клиенте после редактирования (SSR-поле с сервера). */
export async function enrichNewsListProps(props: TJsonRecord): Promise<TJsonRecord> {
  const newsIds = extractApiSelectValueIds(props.newsIds)
  const featuredNewsId = extractApiSelectValueId(props.featuredNewsId)
  const hasNewsIds = newsIds.length > 0
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

  if (hasFeatured) {
    const featuredNews = allNews.find(item => String(item.id) === String(featuredNewsId))
    if (featuredNews) {
      next.featuredNews = featuredNews
    } else {
      delete next.featuredNews
    }
  } else {
    delete next.featuredNews
  }

  if (hasNewsIds) {
    next.newsItems = allNews.filter(item =>
      newsIds.some(id => String(item.id) === String(id))
    )
  } else {
    delete next.newsItems
  }

  return next
}
