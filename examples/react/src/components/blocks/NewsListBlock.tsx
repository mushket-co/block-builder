import { useEffect, useState } from 'react'

import './NewsListBlock.css'

interface INews {
  id: number
  name: string
  title: string
  date: string
}

function normalizeNewsId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = Number((value as { id: unknown }).id)
    return Number.isNaN(id) ? null : id
  }

  const id = Number(value)
  return Number.isNaN(id) ? null : id
}

function normalizeNewsIds(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map(normalizeNewsId)
    .filter((id): id is number => id !== null)
}

interface INewsListBlockProps {
  title?: string
  featuredNewsId?: unknown
  newsIds?: unknown
  showDate?: boolean
  columns?: string
  backgroundColor?: string
  textColor?: string
}

export default function NewsListBlock({
  title = 'Последние новости',
  featuredNewsId = null,
  newsIds,
  showDate = true,
  columns = '2',
  backgroundColor = '#f8f9fa',
  textColor = '#333333',
}: INewsListBlockProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featuredNews, setFeaturedNews] = useState<INews | null>(null)
  const [newsList, setNewsList] = useState<INews[]>([])

  useEffect(() => {
    const resolvedFeaturedNewsId = normalizeNewsId(featuredNewsId)
    const resolvedNewsIds = normalizeNewsIds(newsIds)

    const loadNewsData = async () => {
      if (!resolvedFeaturedNewsId && resolvedNewsIds.length === 0) {
        setFeaturedNews(null)
        setNewsList([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/news?limit=100')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        const allNews: INews[] = data.data || []

        setFeaturedNews(
          resolvedFeaturedNewsId
            ? allNews.find(item => item.id === resolvedFeaturedNewsId) || null
            : null
        )
        setNewsList(
          resolvedNewsIds.length > 0
            ? allNews.filter(item => resolvedNewsIds.includes(item.id))
            : []
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setLoading(false)
      }
    }

    void loadNewsData()
  }, [featuredNewsId, newsIds])

  return (
    <div
      className="news-list-block"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="container">
        <h2 className="news-list-block__title">{title}</h2>

        {featuredNews ? (
          <div className="news-list-block__featured">
            <h3>🌟 Главная новость:</h3>
            <div className="news-card news-card--featured">
              <h4>{featuredNews.title}</h4>
              {showDate ? <p className="news-date">{featuredNews.date}</p> : null}
            </div>
          </div>
        ) : null}

        {newsList.length > 0 ? (
          <div
            className="news-list-block__grid"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {newsList.map(news => (
              <div key={news.id} className="news-card">
                <h4>{news.title}</h4>
                {showDate ? <p className="news-date">{news.date}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {loading ? <div className="news-list-block__loading">Загрузка новостей...</div> : null}
        {error ? <div className="news-list-block__error">Ошибка загрузки: {error}</div> : null}
        {!loading && !error && !featuredNews && newsList.length === 0 ? (
          <div className="news-list-block__empty">
            Новости не выбраны. Настройте блок в редакторе.
          </div>
        ) : null}
      </div>
    </div>
  )
}
