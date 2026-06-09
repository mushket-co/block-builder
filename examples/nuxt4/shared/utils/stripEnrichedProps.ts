/** Поля, которые сервер добавляет для SSR и не должны попадать в редактор/UpdateBlockUseCase. */
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

export function stripBlockPropsForEditor(
  type: string,
  props: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!props || type !== 'newsList') {
    return props
  }

  return stripNewsListEnrichedProps(props)
}
