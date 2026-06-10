const NEWS_LIST_DERIVED_KEYS = ['featuredNews', 'newsItems'] as const

export function stripNewsListEnrichedProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...props }

  for (const key of NEWS_LIST_DERIVED_KEYS) {
    delete result[key]
  }

  return result
}
