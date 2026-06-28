const mockNews = [
  { id: 1, name: 'News 1: New product launch', title: 'New product launch', date: '2025-01-15' },
  { id: 2, name: 'News 2: Platform update', title: 'Platform update', date: '2025-01-14' },
  { id: 3, name: 'News 3: New app feature', title: 'New app feature', date: '2025-01-13' },
  { id: 4, name: 'News 4: Partner integration', title: 'Partner integration', date: '2025-01-12' },
  { id: 5, name: 'News 5: Successful year for the company', title: 'Successful year for the company', date: '2025-01-11' },
  { id: 6, name: 'News 6: Team expansion', title: 'Team expansion', date: '2025-01-10' },
  { id: 7, name: 'News 7: New office opening', title: 'New office opening', date: '2025-01-09' },
  { id: 8, name: 'News 8: Developer conference', title: 'Developer conference', date: '2025-01-08' },
  { id: 9, name: 'News 9: Innovation award', title: 'Innovation award', date: '2025-01-07' },
  { id: 10, name: 'News 10: Mobile app launch', title: 'Mobile app launch', date: '2025-01-06' },
  { id: 11, name: 'News 11: New website design', title: 'New website design', date: '2025-01-05' },
  { id: 12, name: 'News 12: CEO interview', title: 'CEO interview', date: '2025-01-04' },
  { id: 13, name: 'News 13: Version 2.0 release', title: 'Version 2.0 release', date: '2025-01-03' },
  { id: 14, name: 'News 14: Partnership with a major company', title: 'Partnership with a major company', date: '2025-01-02' },
  { id: 15, name: 'News 15: User webinar', title: 'User webinar', date: '2025-01-01' },
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
