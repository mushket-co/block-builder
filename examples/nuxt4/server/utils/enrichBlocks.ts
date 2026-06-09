import {
  extractApiSelectValueId,
  extractApiSelectValueIds,
} from '../../../../src/utils/apiSelectValueHelpers'
import { searchMockNews } from './mockNews'

type TJsonRecord = Record<string, unknown>

interface INewsItem {
  id: number
  name: string
  title: string
  date: string
}

function getAllNews(): INewsItem[] {
  return searchMockNews('', 1, 100).data as INewsItem[]
}

function enrichNewsListBlock(block: TJsonRecord): TJsonRecord {
  if (block.type !== 'newsList' || !block.props || typeof block.props !== 'object') {
    return block
  }

  const props = { ...(block.props as TJsonRecord) }
  const allNews = getAllNews()

  const featuredNewsId = extractApiSelectValueId(props.featuredNewsId)
  const newsIds = extractApiSelectValueIds(props.newsIds)

  if (featuredNewsId != null) {
    const featuredNews = allNews.find(item => String(item.id) === String(featuredNewsId))
    if (featuredNews) {
      props.featuredNews = featuredNews
    } else {
      delete props.featuredNews
    }
  } else {
    delete props.featuredNews
  }

  if (newsIds.length > 0) {
    props.newsItems = allNews.filter(item =>
      newsIds.some(id => String(item.id) === String(id))
    )
  } else {
    delete props.newsItems
  }

  return {
    ...block,
    props,
  }
}

/** Разрешает api-select ID в данные для SSR и хранения в JSON. */
export function enrichBlocksForSsr(blocks: unknown[]): unknown[] {
  if (!Array.isArray(blocks)) {
    return []
  }

  return blocks.map(block => {
    if (!block || typeof block !== 'object') {
      return block
    }

    return enrichNewsListBlock(block as TJsonRecord)
  })
}
