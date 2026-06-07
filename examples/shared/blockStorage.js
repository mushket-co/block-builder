const STORAGE_KEY = 'saved-blocks'

/** Запас до лимита localStorage (~5 MB в большинстве браузеров) */
const LOCAL_STORAGE_SAFE_BYTES = 4 * 1024 * 1024

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:')
}

/**
 * Убирает base64/data URL из props — они не помещаются в localStorage.
 * HTTP(S) URL и остальные поля сохраняются.
 */
export function stripDataUrlsForStorage(value) {
  if (isDataUrl(value)) {
    return ''
  }

  if (Array.isArray(value)) {
    return value.map(stripDataUrlsForStorage)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, stripDataUrlsForStorage(nested)])
    )
  }

  return value
}

export function loadBlocksFromLocalStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      return JSON.parse(savedData)
    }
  } catch (error) {
    console.error('Ошибка загрузки блоков:', error)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return []
}

/**
 * @returns {{ ok: true, strippedImages?: boolean } | { ok: false, error: Error }}
 */
export function saveBlocksToLocalStorage(blocks) {
  try {
    const json = JSON.stringify(blocks)

    if (json.length <= LOCAL_STORAGE_SAFE_BYTES) {
      localStorage.setItem(STORAGE_KEY, json)
      return { ok: true }
    }

    const stripped = stripDataUrlsForStorage(blocks)
    const strippedJson = JSON.stringify(stripped)

    if (strippedJson.length > LOCAL_STORAGE_SAFE_BYTES) {
      return {
        ok: false,
        error: new Error(
          'Слишком много данных для localStorage. Сохраните на сервер или удалите часть блоков.'
        ),
      }
    }

    localStorage.setItem(STORAGE_KEY, strippedJson)
    return { ok: true, strippedImages: true }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        const stripped = stripDataUrlsForStorage(blocks)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped))
        return { ok: true, strippedImages: true }
      } catch (retryError) {
        return { ok: false, error: retryError instanceof Error ? retryError : error }
      }
    }

    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}
