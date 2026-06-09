const mockNews = [
  { id: 1, name: 'Новость 1: Запуск нового продукта', title: 'Запуск нового продукта', date: '2025-01-15' },
  { id: 2, name: 'Новость 2: Обновление платформы', title: 'Обновление платформы', date: '2025-01-14' },
  { id: 3, name: 'Новость 3: Новая функция в приложении', title: 'Новая функция в приложении', date: '2025-01-13' },
  { id: 4, name: 'Новость 4: Интеграция с партнерами', title: 'Интеграция с партнерами', date: '2025-01-12' },
  { id: 5, name: 'Новость 5: Успешный год компании', title: 'Успешный год компании', date: '2025-01-11' },
  { id: 6, name: 'Новость 6: Расширение команды', title: 'Расширение команды', date: '2025-01-10' },
  { id: 7, name: 'Новость 7: Открытие нового офиса', title: 'Открытие нового офиса', date: '2025-01-09' },
  { id: 8, name: 'Новость 8: Конференция разработчиков', title: 'Конференция разработчиков', date: '2025-01-08' },
  { id: 9, name: 'Новость 9: Награда за инновации', title: 'Награда за инновации', date: '2025-01-07' },
  { id: 10, name: 'Новость 10: Запуск мобильного приложения', title: 'Запуск мобильного приложения', date: '2025-01-06' },
  { id: 11, name: 'Новость 11: Новый дизайн сайта', title: 'Новый дизайн сайта', date: '2025-01-05' },
  { id: 12, name: 'Новость 12: Интервью с CEO', title: 'Интервью с CEO', date: '2025-01-04' },
  { id: 13, name: 'Новость 13: Релиз версии 2.0', title: 'Релиз версии 2.0', date: '2025-01-03' },
  { id: 14, name: 'Новость 14: Партнерство с крупной компанией', title: 'Партнерство с крупной компанией', date: '2025-01-02' },
  { id: 15, name: 'Новость 15: Вебинар для пользователей', title: 'Вебинар для пользователей', date: '2025-01-01' },
]

export function searchMockNews(searchQuery = '', page = 1, limit = 10) {
  let filtered = mockNews

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = mockNews.filter(
      (item) =>
        item.name.toLowerCase().includes(query) || item.title.toLowerCase().includes(query)
    )
  }

  const start = (page - 1) * limit
  const end = start + limit
  const paginatedData = filtered.slice(start, end)

  return {
    data: paginatedData,
    total: filtered.length,
    page,
    hasMore: end < filtered.length,
  }
}
