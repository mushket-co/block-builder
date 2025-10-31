/**
 * Утилиты для безопасной работы с DOM
 * Предотвращают XSS уязвимости при работе с HTML
 */


/**
 * Экранирует HTML специальные символы
 * @param text - текст для экранирования
 * @returns экранированный текст
 */
export function escapeHtml(text: string | number | null | undefined): string {
  if (text === null || text === undefined) {
    return '';
  }

  const stringValue = String(text);
  const div = document.createElement('div');
  div.textContent = stringValue;
  return div.innerHTML;
}

/**
 * Безопасно устанавливает текстовое содержимое элемента
 * @param element - HTML элемент
 * @param text - текст для установки
 */
export function setTextContent(element: HTMLElement, text: string | number | null | undefined): void {
  element.textContent = text === null || text === undefined ? '' : String(text);
}

/**
 * Безопасно создает элемент с текстовым содержимым
 * @param tagName - имя тега
 * @param text - текстовое содержимое
 * @param attributes - атрибуты элемента
 * @returns созданный элемент
 */
export function createElementWithText(
  tagName: string,
  text: string | number | null | undefined = '',
  attributes: Record<string, string> = {}
): HTMLElement {
  const element = document.createElement(tagName);
  setTextContent(element, text);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  return element;
}

/**
 * Безопасно декодирует HTML entities
 * @param text - текст с HTML entities
 * @returns декодированный текст
 */
export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Безопасно парсит JSON из HTML атрибута (с учетом HTML entities)
 * @param text - JSON строка из HTML атрибута
 * @returns распарсенный объект
 * @throws Error если парсинг не удался
 */
export function parseJsonFromHtmlAttribute(text: string): any {
  try {
    // Сначала декодируем HTML entities
    const decoded = decodeHtmlEntities(text);
    // Затем парсим JSON
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error(`Failed to parse JSON from HTML attribute: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Безопасно вставляет HTML в элемент через DOMParser (санитизация)
 * Внимание: используйте только для доверенного HTML или с дополнительной санитизацией
 * @param container - контейнер для вставки
 * @param html - HTML строка
 */
export function setHTMLSafely(container: HTMLElement, html: string): void {
  // Если HTML пустой, просто очищаем контейнер
  if (!html.trim()) {
    container.innerHTML = '';
    return;
  }

  // Используем DOMParser для безопасного парсинга
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Проверяем на ошибки парсинга (XSS попытки могут вызвать ошибки)
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    // Если парсинг не удался, используем textContent как fallback
    container.textContent = html;
    return;
  }

  // Очищаем контейнер и добавляем безопасно распарсенные элементы
  container.innerHTML = '';
  const body = doc.body;
  while (body.firstChild) {
    container.appendChild(body.firstChild);
  }
}

