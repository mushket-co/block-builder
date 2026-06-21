/** Mock-ответ parse-xlsx для demo-блока form-features-demo (BB 1.8.0) */

function getImportDataPath(data, path) {
  if (!path) {
    return data
  }
  return path.split('.').reduce((acc, segment) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined
    }
    return acc[segment]
  }, data)
}

export function buildDemoXlsxParseResponse() {
  return {
    status: 'success',
    data: {
      filters: [
        { name: 'Категория', placeholder: 'Все', values: ['Demo A', 'Demo B'] },
        { name: 'Electronics', placeholder: 'Все', values: ['Gadgets'] },
      ],
      cards: [
        {
          title: 'Карточка 1',
          filters: [{ name: 'Категория', values: ['Demo A'] }],
        },
        {
          title: 'Карточка из XLSX 2',
          filters: [
            { name: 'Категория', values: ['Demo B'] },
            { name: 'Electronics', values: ['Gadgets'] },
          ],
        },
      ],
    },
  }
}

function mapXlsxFilter(filter) {
  return {
    name: filter.name,
    options: (filter.values || []).map(value => ({ name: value })),
  }
}

function mapXlsxCard(card) {
  return {
    title: card.title || '',
    filters: (card.filters || []).flatMap(entry => entry.values || []),
  }
}

/** Append фильтров по name + merge вариантов внутри фильтра */
export function mergeDemoFiltersIntoForm(formScope, response) {
  const payload = response?.data ?? response
  const filtersRaw = getImportDataPath(payload, 'filters')
  if (!Array.isArray(filtersRaw) || filtersRaw.length === 0) {
    return { added: 0, skipped: 0 }
  }

  const incoming = filtersRaw.map(mapXlsxFilter)
  const existing = Array.isArray(formScope.formData.filterOptions)
    ? formScope.formData.filterOptions.map(filter => ({
        name: filter.name,
        options: [...(filter.options || [])],
      }))
    : []

  const byName = new Map()
  existing.forEach(filter => {
    if (filter.name) {
      byName.set(String(filter.name).trim().toLowerCase(), filter)
    }
  })

  let added = 0
  let skipped = 0

  incoming.forEach(filter => {
    const key = String(filter.name || '').trim().toLowerCase()
    if (!key) {
      return
    }

    if (!byName.has(key)) {
      byName.set(key, filter)
      added += 1
      return
    }

    skipped += 1
    const current = byName.get(key)
    const optionNames = new Set((current.options || []).map(option => option.name))
    ;(filter.options || []).forEach(option => {
      if (option.name && !optionNames.has(option.name)) {
        current.options.push(option)
        optionNames.add(option.name)
      }
    })
  })

  const merged = Array.from(byName.values())
  formScope.setField('filterOptions', merged)
  formScope.setField('showFilterOptions', merged.length > 0)

  return { added, skipped }
}

/** @deprecated используйте merge rules + mergeDemoFiltersIntoForm */
export function mergeDemoXlsxIntoForm(formScope, response) {
  mergeDemoFiltersIntoForm(formScope, response)
  const cards = getImportDataPath(response?.data ?? response, 'cards')
  if (Array.isArray(cards)) {
    formScope.setField('items', cards.map(mapXlsxCard))
  }
}

export function handleDemoParseXlsxRequest(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  req.on('data', () => {})
  req.on('end', () => {
    setTimeout(() => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(buildDemoXlsxParseResponse()))
    }, 400)
  })
}

export const DEMO_XLSX_CARD_MAP_ITEM = mapXlsxCard
